"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MecenateClient = exports.EASContractAddress = void 0;
const ethers_1 = require("ethers");
const utils_js_1 = require("ethers/lib/utils.js");
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const crypto_ipfs_1 = __importDefault(require("@scobru/crypto-ipfs"));
const hardhat_contracts_json_1 = __importDefault(require("../../nextjs/generated/hardhat_contracts.json"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
// encoding & decoding
const crypto = require("asymmetric-crypto");
const pinataSDK = require("@pinata/sdk");
exports.EASContractAddress = "0x4200000000000000000000000000000000000021"; // Sepolia v0.26
const eas = new eas_sdk_1.EAS(exports.EASContractAddress);
// Initialize SchemaEncoder with the schema string
const schemaEncoder = new eas_sdk_1.SchemaEncoder("bool verified ,address feed,bytes32 postId, bytes post,");
const schemaUID = "0x826a8867a8fa45929593ef87a5b94e5800de3f2e3f7fbc93a995069777076e6a";
class MecenateClient {
    signer;
    pinataApiKey;
    pinataApiSecret;
    userCtx;
    treasuryCtx;
    factoryCtx;
    userAddress = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateUsers.address;
    usersAbi = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateUsers.abi;
    treasuryAddress = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateTreasury.address;
    treasuryAbi = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateTreasury.abi;
    factoryAddress = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateFeedFactory.address;
    factoryAbi = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateFeedFactory.abi;
    feedABI = hardhat_contracts_json_1.default["84531"][0].contracts.MecenateFeed.abi;
    constructor(signer, pinataApiKey, pinataApiSecret) {
        this.signer = signer;
        this.pinataApiKey = pinataApiKey;
        this.pinataApiSecret = pinataApiSecret;
        this.userCtx = new ethers_1.Contract(this.userAddress, this.usersAbi, this.signer);
        this.treasuryCtx = new ethers_1.Contract(this.treasuryAddress, this.treasuryAbi, this.signer);
        this.factoryCtx = new ethers_1.Contract(this.factoryAddress, this.factoryAbi, this.signer);
    }
    async createPair() {
        const kp = await crypto_ipfs_1.default.crypto.asymmetric.keyPair();
        console.log("KeyPair: ", JSON.stringify(kp));
        // Save into folders
        fs_1.default.writeFileSync("./keypair.json", JSON.stringify(kp));
        return kp;
    }
    verifyIdentity() {
        console.log("Please verify your identity");
        console.log("https://mecenate.vercel.app/verify");
    }
    async registerUser(responseBytes, pubKey) {
        console.log("Signing in...");
        // Esecuzione della transazione
        const tx = await this.userCtx.registerUser(responseBytes, ethers_1.ethers.utils.toUtf8Bytes(pubKey));
        // Attesa della conferma della transazione
        const receipt = await tx.wait();
        // Log o ulteriori operazioni con la ricevuta di transazione
        console.log("Transaction receipt:", receipt);
    }
    async buildFeed() {
        const fee = await this.treasuryCtx.fixedFee();
        const tx = await this.factoryCtx.buildFeed({ value: fee });
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);
    }
    // Creation
    async createPostData(RawData) {
        try {
            const symmetricKey = crypto_ipfs_1.default.crypto.symmetric.generateKey();
            const encryptedFile = crypto_ipfs_1.default.crypto.symmetric.encryptMessage(symmetricKey, RawData);
            const symmetricKeyHash = await crypto_ipfs_1.default.multihash({
                input: symmetricKey,
                inputType: "raw",
                outputType: "hex",
            });
            // datahash sha256(rawdata)
            const dataHash = await crypto_ipfs_1.default.multihash({
                input: RawData,
                inputType: "raw",
                outputType: "hex",
            });
            // encryptedDatahash = sha256(encryptedData)
            // This hash will match the IPFS pin hash
            const encryptedDataHash = await crypto_ipfs_1.default.multihash({
                input: JSON.stringify({ encryptedData: encryptedFile }),
                inputType: "raw",
                outputType: "b58",
            });
            // jsonblob_v1_2_0 = JSON(multihashformat(datahash), multihashformat(keyhash), multihashformat(encryptedDatahash))
            const jsonblob_v1_2_0 = {
                seller: this.signer.getAddress(),
                datahash: dataHash,
                encryptedDatahash: encryptedDataHash,
                keyhash: symmetricKeyHash,
            };
            // proofhash = sha256(jsonblob_v1_2_0)
            // This hash will match the IPFS pin hash. It should be saved to the users feed contract.
            const proofHash58 = await crypto_ipfs_1.default.multihash({
                input: JSON.stringify(jsonblob_v1_2_0),
                inputType: "raw",
                outputType: "b58",
            });
            console.group("Data Saved");
            console.log("RawData", RawData);
            console.log("Encrypted File", encryptedFile);
            console.log("Symmetric Key", symmetricKey);
            console.log("Key Hash", symmetricKeyHash);
            console.log("Datahash", dataHash);
            console.log("Encrypted DataHash", encryptedDataHash);
            console.log("ProofHash", proofHash58);
            console.groupEnd();
            return {
                proofJson: jsonblob_v1_2_0,
                proofhash: proofHash58,
                symmetricKey: symmetricKey,
                encryptedData: encryptedFile,
            };
        }
        catch (e) {
            console.log(e);
        }
    }
    async createPost(feedAddress, postRawData, buyer, postType, postDuration, buyerPayment, postStake, tokenId, funder, seller, useStake) {
        // Save data to IPFS.
        const dataSaved = await this.savePost(postRawData);
        const proofOfHashEncode = await crypto_ipfs_1.default.multihash({
            input: dataSaved?.proofhash,
            inputType: "b58",
            outputType: "digest",
        });
        console.log("ProofHash", proofOfHashEncode);
        let _buyer;
        if (buyer == "") {
            _buyer = ethers_1.ethers.constants.AddressZero;
        }
        else {
            _buyer = buyer;
        }
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        await feedCtx?.createPost(proofOfHashEncode, Number(postType), Number(postDuration), (0, utils_js_1.parseEther)(await buyerPayment), (0, utils_js_1.parseEther)(postStake), Number(tokenId), funder, seller, useStake, {
            value: tokenId == 0 ? (0, utils_js_1.parseEther)(postStake) : 0,
        });
    }
    async savePost(RawData) {
        console.log("Saving Data...");
        // Check Pinata credentials.
        if (!this.pinataApiKey || !this.pinataApiSecret) {
            console.log("Please call with Pinata Account Credentials");
            return;
        }
        // Authenticate with Pinata.
        const pinata = new pinataSDK(this.pinataApiKey, this.pinataApiSecret);
        const pinataAuth = await pinata.testAuthentication();
        if (pinataAuth?.authenticated !== true) {
            console.log("Pinata Authentication Failed.");
            return;
        }
        // Create post data.
        const postData = await this.createPostData(RawData);
        if (!postData) {
            console.log("Error creating post data.");
            return;
        }
        // Save encrypted data to IPFS.
        try {
            let pin = await pinata.pinJSONToIPFS({
                encryptedData: postData.encryptedData,
            });
            if (pin?.IpfsHash !== postData.proofJson.encryptedDatahash) {
                console.log("Error with Encrypted Data Hash.");
                return;
            }
            // Save proof JSON to IPFS.
            pin = await pinata.pinJSONToIPFS(postData.proofJson);
            if (pin.IpfsHash !== postData.proofhash) {
                console.log("Error with proof Hash.");
                return;
            }
            console.log("Data Saved.");
            return postData;
        }
        catch (err) {
            console.log("Error saving data to IPFS:", err);
        }
    }
    async acceptPost(postPayment, feedAddress) {
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        const post = await feedCtx?.post();
        const postTokenId = post.postdata?.settings?.tokenId;
        await feedCtx?.acceptPost(postTokenId, (0, utils_js_1.parseEther)(postPayment), this.signer.getAddress(), {
            value: postTokenId == 0 ? (0, utils_js_1.parseEther)(postPayment) : 0,
        });
    }
    async submitData(feedAddress, symmetricKey, secretKey) {
        const abiCoder = new ethers_1.ethers.utils.AbiCoder();
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        const post = await feedCtx?.post();
        const encryptedData = post.postdata?.data.encryptedData;
        const proofhash = abiCoder.decode(["bytes32"], encryptedData);
        const buyer = post.postdata?.escrow?.buyer;
        const seller = post.postdata?.escrow?.seller;
        const buyerPublicKey = await this.userCtx?.getUserPublicKey(buyer);
        const sellerPublicKey = await this.userCtx?.getUserPublicKey(seller);
        const encrypted = crypto.encrypt(symmetricKey, (0, utils_js_1.toUtf8String)(buyerPublicKey), secretKey);
        const buyerMetadata = await this.userCtx?.getUserMetadata(buyer);
        const sellerMetadata = await this.userCtx?.getUserMetadata(seller);
        const encryptedSymKey_Buyer = {
            ciphertext: encrypted.data,
            ephemPubKey: sellerPublicKey,
            nonce: encrypted.nonce,
            version: "v2.0.0",
        };
        const json_selldata_v120 = {
            msp_version: "v2.0.0",
            proofhash: proofhash,
            sender: sellerMetadata?.evmAddress,
            senderPubKey: sellerMetadata?.publicKey,
            senderVaultId: sellerMetadata?.sismoVaultId,
            receiver: buyerMetadata?.evmAddress,
            receiverPubKey: buyerMetadata?.publicKey,
            receiverVaultId: buyerMetadata?.sismoVaultId,
            encryptedSymKey: encryptedSymKey_Buyer,
        };
        const pinata = await new pinataSDK(this.pinataApiKey, this.pinataApiSecret);
        const pinataAuth = await pinata.testAuthentication();
        if (pinataAuth.authenticated !== true) {
            console.log("Pinata Authentication Failed.");
            return;
        }
        console.log("Saving proof JSON...");
        const pin = await pinata.pinJSONToIPFS(json_selldata_v120);
        const proofHash58 = await crypto_ipfs_1.default.multihash({
            input: JSON.stringify(json_selldata_v120),
            inputType: "raw",
            outputType: "b58",
        });
        const proofHash58Digest = await crypto_ipfs_1.default.multihash({
            input: proofHash58,
            inputType: "b58",
            outputType: "digest",
        });
        console.group("Subimt Data");
        console.log("Buyer Address: ", buyer);
        console.log("Seller Address: ", seller);
        console.log("Buyer Public Key: ", buyerPublicKey);
        console.log("Seller Public Key: ", sellerPublicKey);
        console.log("Encrypted Symmetric Key: ", encryptedSymKey_Buyer);
        console.log("Proof JSON: ", json_selldata_v120);
        console.log("Pinata Pin: ", pin);
        console.log("Proof Hash: ", proofHash58);
        console.log("Proof Hash Digest: ", proofHash58Digest);
        console.groupEnd();
        if (String(pin.IpfsHash) !== String(proofHash58)) {
            console.log("Error with proof Hash.");
            console.log(pin.IpfsHash);
            console.log(proofHash58);
            return;
        }
        console.log("Data Saved.");
        //CHeck Fetch data
        const responseIPFS = await axios_1.default.get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + pin.IpfsHash, {
            headers: {
                Accept: "text/plain",
            },
        });
        // check response is ipfs valid content
        if (responseIPFS.data.esp_version !== "v2.0.0") {
            console.log("Error with proof Hash.");
            console.log(responseIPFS.data.esp_version);
            return;
        }
        console.log("Data Retrieved.");
        console.log("Proof Hash Digest: ", proofHash58Digest);
        await feedCtx?.submitHash(proofHash58Digest);
        return {
            proofJson: json_selldata_v120,
            proofHash58: proofHash58,
            proofHash58Decode: proofHash58Digest,
        };
    }
    async retrievePost(feedAddress, secretKey) {
        console.log("Retrieving Data...");
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        const post = await feedCtx?.post();
        const encryptedKey = post.postdata?.data.encryptedKey;
        const postCount = post.postdata?.settings?.postCount;
        const decodeHash = await crypto_ipfs_1.default.multihash({
            input: encryptedKey,
            inputType: "sha2-256",
            outputType: "b58",
        });
        console.log("Decoded Hash: ", decodeHash);
        //#endregion
        const responseDecodeHash = await axios_1.default.get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + decodeHash, {
            headers: {
                Accept: "text/plain",
            },
        });
        const responseDecodeHahJSON = await JSON.parse(JSON.stringify(responseDecodeHash.data));
        console.log("Response Decode Hash: ", responseDecodeHahJSON);
        const encryptedSymKey = await JSON.parse(JSON.stringify(responseDecodeHahJSON.encryptedSymKey));
        console.log("Encrypted Symmetric Key: ", encryptedSymKey);
        const decrypted = crypto.decrypt(encryptedSymKey.ciphertext, encryptedSymKey.nonce, (0, utils_js_1.toUtf8String)(encryptedSymKey.ephemPubKey), secretKey);
        console.log("Decrypted", decrypted);
        const _decodeHash = await crypto_ipfs_1.default.multihash({
            input: responseDecodeHahJSON.proofhash.toString(),
            inputType: "sha2-256",
            outputType: "b58",
        });
        const url = "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + _decodeHash;
        console.log(url);
        const responseProofHash = await axios_1.default.get(url, {
            headers: {
                Accept: "text/plain",
            },
        });
        console.log(responseProofHash);
        const responseProofHashJSON = JSON.parse(JSON.stringify(responseProofHash.data));
        console.log(responseProofHashJSON);
        const response_Encrypteddatahash = await axios_1.default.get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" +
            responseProofHashJSON.encryptedDatahash, {
            headers: {
                Accept: "text/plain",
            },
        });
        const response_Encrypteddatahash_JSON = JSON.parse(JSON.stringify(response_Encrypteddatahash.data));
        const decryptFile = crypto_ipfs_1.default.crypto.symmetric.decryptMessage(decrypted, response_Encrypteddatahash_JSON.encryptedData);
        if (decryptFile) {
            // wait 10 seconds
            console.log("Decrypted Data: ", decryptFile);
            const dataHash = await crypto_ipfs_1.default.multihash({
                input: decryptFile,
                inputType: "raw",
                outputType: "hex",
            });
            const hashCheck = responseProofHashJSON.datahash === dataHash;
            const postType = post.postdata?.settings?.postType;
            if (postType == 1 || postType == 2 || postType == 3 || postType == 4) {
                const mimeType = this.base64Mime(decryptFile);
                // Repair malformed base64 data
                const file = this.convertBase64ToFile(decryptFile, feedCtx?.address + "_decryptedData" + "." + mimeType?.split("/")[1]);
                fs_1.default.writeFileSync("./" +
                    String(postCount) +
                    feedCtx?.address +
                    "_decryptsaveAsedData" +
                    "." +
                    mimeType?.split("/")[1], file);
            }
            else {
                console.log("Decrypted Data: ", decryptFile);
            }
            return {
                rawData: encryptedSymKey,
                hashCheck: hashCheck,
            };
        }
        else {
            console.log("Error decrypting message.");
            return null;
        }
    }
    async revealPost(feedAddress, symmetricKey, postRawData) {
        const symKeyHash = await crypto_ipfs_1.default.multihash({
            input: JSON.stringify({ symmetricKey: symmetricKey }),
            inputType: "raw",
            outputType: "b58",
        });
        const rawDataHash = await crypto_ipfs_1.default.multihash({
            input: JSON.stringify({ rawData: postRawData }),
            inputType: "raw",
            outputType: "b58",
        });
        // IPFS needs Pinata account credentials.
        if (this.pinataApiKey === undefined || this.pinataApiSecret === undefined) {
            console.log("Please call with Pinata Account Credentials");
            return;
        }
        // Make sure Pinata is authenticating.
        const pinata = await new pinataSDK(this.pinataApiKey, this.pinataApiSecret);
        const pinataAuth = await pinata.testAuthentication();
        if (pinataAuth.authenticated !== true) {
            console.log("Pinata Authentication Failed.");
            return;
        }
        // Saves the SymKey to IPFS.
        let pin = await pinata.pinJSONToIPFS({ symmetricKey: symmetricKey });
        // Saves the data to IPFS.
        pin = await pinata.pinJSONToIPFS({ rawData: postRawData });
        console.log("Data Saved.");
        const AbiCoder = new ethers_1.ethers.utils.AbiCoder();
        const dataEncoded = AbiCoder.encode(["string", "string"], [symKeyHash, rawDataHash]);
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        await feedCtx?.revealData(dataEncoded);
    }
    async finalizePost(valid, punishment, feedAddress) {
        console.log("Finalizing Data...");
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        const post = await feedCtx?.post();
        const encryptedData = post.postdata?.data.encryptedData;
        const postId = post.postdata?.settings?.postId;
        if (valid == true) {
            const encodedData = schemaEncoder.encodeData([
                { name: "verified", value: valid, type: "bool" },
                { name: "feed", value: feedAddress, type: "address" },
                { name: "postId", value: postId, type: "bytes32" },
                { name: "post", value: encryptedData, type: "bytes" },
            ]);
            console.log("Encoded Data: ", encodedData);
            const data = {
                recipient: post.postdata?.escrow?.seller,
                revocable: false,
                data: encodedData,
            };
            console.log(data);
            eas.connect(this.signer);
            const tx = await eas.attest({
                schema: schemaUID,
                data: data,
            });
            const newAttestationUID = await tx.wait();
            console.log("New attestation UID:", newAttestationUID);
            const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
            await feedCtx?.finalizePost(valid, (0, utils_js_1.parseEther)("0"), newAttestationUID);
        }
        else {
            const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
            await feedCtx?.finalizePost(valid, (0, utils_js_1.parseEther)(punishment), "0x00");
        }
    }
    async renounce(feedAddress) {
        const feedCtx = new ethers_1.Contract(feedAddress, this.feedABI, this.signer);
        await feedCtx?.renouncePost();
    }
    async listFeed() {
        let feedAddress = await this.factoryCtx?.getFeeds();
        const len = feedAddress.length;
        console.log("Feed Address: ", feedAddress);
        const results = [];
        for (let i = 0; i < len; i++) {
            const MecenateFeed = new ethers_1.ethers.Contract(feedAddress[i], this.feedABI, this.signer);
            let post = await MecenateFeed.post();
            results.push({
                feedAddress: feedAddress[i],
                creator: post[0],
                settings: post[1][0],
                escrow: post[1][1],
                data: post[1][2],
            });
        }
        console.log(results);
    }
    async feedInfo(feedAddress) {
        const MecenateFeed = new ethers_1.ethers.Contract(feedAddress, this.feedABI, this.signer);
        let post = await MecenateFeed.post();
        const result = {
            feedAddress: feedAddress,
            creator: post[0],
            settings: post[1][0],
            escrow: post[1][1],
            data: post[1][2],
        };
        console.log("Feed Info:", JSON.stringify(result));
        return result;
    }
    async fetchPost(_feedAddress) {
        const MecenateFeed = new ethers_1.ethers.Contract(_feedAddress, this.feedABI, this.signer);
        const post = await MecenateFeed.post();
        return JSON.stringify(post);
    }
    async getStake(_feedAddr) {
        const MecenateFeed = new ethers_1.ethers.Contract(_feedAddr, this.feedABI, this.signer);
        const stake = await MecenateFeed.getStake(this.signer?.getAddress());
        console.log((0, utils_js_1.formatEther)(stake));
    }
    async addStake(tokenId, _feedAddr, stakeAmount) {
        console.log("Adding Stake...");
        const MecenateFeed = new ethers_1.ethers.Contract(_feedAddr, this.feedABI, this.signer);
        const post = await MecenateFeed?.post();
        const postTokenId = post.postdata?.settings?.tokenId;
        if (tokenId != postTokenId) {
            console.log("Wrong tokenID");
            return;
        }
        await MecenateFeed?.addStake(postTokenId, this.signer.getAddress(), (0, utils_js_1.parseEther)(stakeAmount), {
            value: postTokenId == 0 ? (0, utils_js_1.parseEther)(stakeAmount) : 0,
        });
    }
    async takeAll(tokenId, _feedAddr, receiver) {
        const MecenateFeed = new ethers_1.ethers.Contract(_feedAddr, this.feedABI, this.signer);
        const post = await MecenateFeed?.post();
        const postTokenId = post.postdata?.settings?.tokenId;
        if (tokenId != postTokenId) {
            console.log("Wrong tokenID");
            return;
        }
        MecenateFeed?.takeFullStake(postTokenId, receiver);
        console.log("Take All Stake...");
    }
    async takeStake(tokenId, _feedAddr, stakeAmount, receiver) {
        const MecenateFeed = new ethers_1.ethers.Contract(_feedAddr, this.feedABI, this.signer);
        const post = await MecenateFeed?.post();
        const postTokenId = post.postdata?.settings?.tokenId;
        if (tokenId != postTokenId) {
            console.log("Wrong tokenID");
            return;
        }
        console.log("Take Stake...");
        MecenateFeed?.takeStake(postTokenId, receiver, (0, utils_js_1.parseEther)(stakeAmount));
    }
    // Helpers
    base64Mime(encoded) {
        let result = null;
        if (typeof encoded !== "string") {
            return result;
        }
        const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        if (mime && mime.length) {
            result = mime[1];
        }
        return result;
    }
    convertBase64ToFile(base64String, fileName) {
        const arr = base64String.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const uint8Array = new Uint8Array(n);
        while (n--) {
            uint8Array[n] = bstr.charCodeAt(n);
        }
        const file = new File([uint8Array], fileName, { type: mime });
        return file;
    }
}
exports.MecenateClient = MecenateClient;
