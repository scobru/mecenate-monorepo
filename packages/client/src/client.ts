import { ethers, Contract } from "ethers";
import { formatEther, parseEther, toUtf8String } from "ethers/lib/utils.js";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { saveAs } from "file-saver";
import MecenateHelper from "../../crypto-ipfs/index"
import ABIS from "../../nextjs/generated/hardhat_contracts.json";
import axios from "axios";
import fs from "fs";
import ProgressBar from 'progress';

// encoding & decoding

const crypto = require("asymmetric-crypto");
const pinataSDK = require("@pinata/sdk");

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // Sepolia v0.26

const eas = new EAS(EASContractAddress);

// Initialize SchemaEncoder with the schema string
const schemaEncoder = new SchemaEncoder(
  "bool verified ,address feed, bytes post,"
);
const schemaUID =
  "0xb73edc40219f8224352f6d9c12364faadae4e09726e78d0e9e78bea456930b5a";

export class MecenateClient {
  private signer: any;
  private pinataApiKey: string;
  private pinataApiSecret: string;
  public userCtx: Contract;
  public treasuryCtx: Contract;
  public factoryCtx: Contract;

  public userAddress = ABIS["84531"][0].contracts.MecenateUsers.address;
  public usersAbi = ABIS["84531"][0].contracts.MecenateUsers.abi;

  public treasuryAddress = ABIS["84531"][0].contracts.MecenateTreasury.address;
  public treasuryAbi = ABIS["84531"][0].contracts.MecenateTreasury.abi;

  public factoryAddress =
    ABIS["84531"][0].contracts.MecenateFeedFactory.address;
  public factoryAbi = ABIS["84531"][0].contracts.MecenateFeedFactory.abi;

  public feedABI = ABIS["84531"][0].contracts.MecenateFeed.abi;

  constructor(signer: any, pinataApiKey: string, pinataApiSecret: string) {
    this.signer = signer;
    this.pinataApiKey = pinataApiKey;
    this.pinataApiSecret = pinataApiSecret;

    this.userCtx = new Contract(this.userAddress, this.usersAbi, this.signer);
    this.treasuryCtx = new Contract(
      this.treasuryAddress,
      this.treasuryAbi,
      this.signer
    );
    this.factoryCtx = new Contract(
      this.factoryAddress,
      this.factoryAbi,
      this.signer
    );
  }

  public async createPair() {
    const kp = await crypto.keyPair();
    console.log("KeyPair: ", JSON.stringify(kp));
    // Save into folders
    fs.writeFileSync("./keypair.json", JSON.stringify(kp));
    return kp;
  }

  public verifyIdentity() {
    console.log("Please verify your identity");
    console.log("https://mecenate.vercel.app/verify");
  }

  public async registerUser(responseBytes: string, pubKey: string) {
    console.log("Signing in...");
    // Esecuzione della transazione
    const tx = await this.userCtx.registerUser(
      responseBytes,
      ethers.utils.toUtf8Bytes(pubKey)
    );
    // Attesa della conferma della transazione
    const receipt = await tx.wait();

    // Log o ulteriori operazioni con la ricevuta di transazione
    console.log("Transaction receipt:", receipt);
  }

  public async buildFeed() {
    const fee = await this.treasuryCtx.fixedFee();

    const tx = await this.factoryCtx.buildFeed({ value: fee });
    const receipt = await tx.wait();

    console.log("Transaction receipt:", receipt);
  }

  // Creation
  public async createPostData(RawData: any) {
    try {
      const symmetricKey = MecenateHelper.crypto.symmetric.generateKey();
      const encryptedFile = MecenateHelper.crypto.symmetric.encryptMessage(
        symmetricKey,
        RawData
      );

      const symmetricKeyHash = await MecenateHelper.multihash({
        input: symmetricKey,
        inputType: "raw",
        outputType: "hex",
      });

      // datahash sha256(rawdata)

      const dataHash = await MecenateHelper.multihash({
        input: RawData,
        inputType: "raw",
        outputType: "hex",
      });

      // encryptedDatahash = sha256(encryptedData)
      // This hash will match the IPFS pin hash
      const encryptedDataHash = await MecenateHelper.multihash({
        input: JSON.stringify({ encryptedData: encryptedFile }),
        inputType: "raw",
        outputType: "b58",
      });

      // jsonblob_v1_2_0 = JSON(multihashformat(datahash), multihashformat(keyhash), multihashformat(encryptedDatahash))
      const jsonblob_v1_2_0 = {
        seller: this.signer.getAddress(),
        datahash: dataHash,
        encryptedDatahash: encryptedDataHash, // This allows the encrypted data to be located on IPFS or 3Box
        keyhash: symmetricKeyHash,
      };

      // proofhash = sha256(jsonblob_v1_2_0)
      // This hash will match the IPFS pin hash. It should be saved to the users feed contract.
      const proofHash58 = await MecenateHelper.multihash({
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
    } catch (e) {
      console.log(e);
    }
  }

  public async createPost(
    feedAddress: string,
    postRawData: any,
    buyer: string,
    postType: number,
    postDuration: number,
    buyerPayment: string,
    postStake: string,
    tokenId: number,
    funder: string,
    seller: string,
    useStake: boolean
  ) {
    // Save data to IPFS.
    const dataSaved = await this.savePost(postRawData);

    const proofOfHashEncode = await MecenateHelper.multihash({
      input: dataSaved?.proofhash,
      inputType: "b58",
      outputType: "digest",
    });

    console.log("ProofHash", proofOfHashEncode);

    let _buyer;

    if (buyer == "") {
      _buyer = ethers.constants.AddressZero;
    } else {
      _buyer = buyer;
    }

    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);

    await feedCtx?.createPost(
      proofOfHashEncode,
      Number(postType),
      Number(postDuration),
      parseEther(await buyerPayment),
      parseEther(postStake),
      Number(tokenId),
      funder,
      seller,
      useStake,
      {
        value: tokenId == 0 ? parseEther(postStake) : 0,
      }
    );
  }

  public async savePost(RawData: string): Promise<any | void> {
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
    } catch (err) {
      console.log("Error saving data to IPFS:", err);
    }
  }

  public async acceptPost(postPayment: string, feedAddress: string) {
    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);
    const post = await feedCtx?.post();
    const postTokenId = post.postdata?.settings?.tokenId;

    await feedCtx?.acceptPost(
      postTokenId,
      parseEther(postPayment),
      this.signer.getAddress(),
      {
        value: postTokenId == 0 ? parseEther(postPayment) : 0,
      }
    );
  }

  public async submitData(
    feedAddress: string,
    symmetricKey: string,
    secretKey: string
  ) {
    const abiCoder = new ethers.utils.AbiCoder();
    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);
    const post = await feedCtx?.post();
    const encryptedData = post.postdata?.data.encryptedData;
    const proofhash = abiCoder.decode(["bytes32"], encryptedData);

    const buyer = post.postdata?.escrow?.buyer;
    const seller = post.postdata?.escrow?.seller;

    const buyerPublicKey = await this.userCtx?.getUserPublicKey(buyer);
    const sellerPublicKey = await this.userCtx?.getUserPublicKey(seller);

    const encrypted = crypto.encrypt(
      symmetricKey,
      toUtf8String(buyerPublicKey),
      secretKey
    );

    const buyerMetadata = await this.userCtx?.getUserMetadata(buyer);
    const sellerMetadata = await this.userCtx?.getUserMetadata(seller);

    const encryptedSymKey_Buyer = {
      ciphertext: encrypted.data,
      ephemPubKey: sellerPublicKey,
      nonce: encrypted.nonce,
      version: "v2.0.0",
    };

    const json_selldata_v120 = {
      msp_version: "v1.0.0",
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
    const proofHash58 = await MecenateHelper.multihash({
      input: JSON.stringify(json_selldata_v120),
      inputType: "raw",
      outputType: "b58",
    });

    const proofHash58Digest = await MecenateHelper.multihash({
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
    const responseIPFS = await axios.get(
      "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + pin.IpfsHash,
      {
        headers: {
          Accept: "text/plain",
        },
      }
    );

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

  public async retrievePost(feedAddress: string, secretKey: string) {
    console.log("Retrieving Data...");

    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);

    const post = await feedCtx?.post();
    const encryptedKey = post.postdata?.data.encryptedKey;
    const postCount = post.postdata?.settings?.postCount;

    const decodeHash = await MecenateHelper.multihash({
      input: encryptedKey,
      inputType: "sha2-256",
      outputType: "b58",
    });

    console.log("Decoded Hash: ", decodeHash);

    //#endregion
    const responseDecodeHash = await axios.get(
      "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + decodeHash,
      {
        headers: {
          Accept: "text/plain",
        },
      }
    );

    const responseDecodeHahJSON = await JSON.parse(
      JSON.stringify(responseDecodeHash.data)
    );
    console.log("Response Decode Hash: ", responseDecodeHahJSON);

    const encryptedSymKey = await JSON.parse(
      JSON.stringify(responseDecodeHahJSON.encryptedSymKey)
    );
    console.log("Encrypted Symmetric Key: ", encryptedSymKey);

    const decrypted = crypto.decrypt(
      encryptedSymKey.ciphertext,
      encryptedSymKey.nonce,
      toUtf8String(encryptedSymKey.ephemPubKey),
      secretKey
    );

    console.log("Decrypted", decrypted);

    const _decodeHash = await MecenateHelper.multihash({
      input: responseDecodeHahJSON.proofhash.toString(),
      inputType: "sha2-256",
      outputType: "b58",
    });

    const url =
      "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + _decodeHash;

    console.log(url);

    const responseProofHash = await axios.get(url, {
      headers: {
        Accept: "text/plain",
      },
    });

    console.log(responseProofHash);

    const responseProofHashJSON = JSON.parse(
      JSON.stringify(responseProofHash.data)
    );

    console.log(responseProofHashJSON);

    const response_Encrypteddatahash = await axios.get(
      "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" +
      responseProofHashJSON.encryptedDatahash,
      {
        headers: {
          Accept: "text/plain",
        },
      }
    );

    const response_Encrypteddatahash_JSON = JSON.parse(
      JSON.stringify(response_Encrypteddatahash.data)
    );

    const decryptFile = MecenateHelper.crypto.symmetric.decryptMessage(
      decrypted,
      response_Encrypteddatahash_JSON.encryptedData
    );

    if (decryptFile) {
      // wait 10 seconds
      console.log("Decrypted Data: ", decryptFile);

      const dataHash = await MecenateHelper.multihash({
        input: decryptFile,
        inputType: "raw",
        outputType: "hex",
      });

      const hashCheck = responseProofHashJSON.datahash === dataHash;

      const postType = post.postdata?.settings?.postType;

      if (postType == 1 || postType == 2 || postType == 3 || postType == 4) {
        const mimeType: any = this.base64Mime(decryptFile);

        // Repair malformed base64 data
        const file = this.convertBase64ToFile(
          decryptFile,
          feedCtx?.address + "_decryptedData" + "." + mimeType?.split("/")[1]
        );

        fs.writeFileSync("./" +
          String(postCount) +
          feedCtx?.address +
          "_decryptsaveAsedData" +
          "." +
          mimeType?.split("/")[1],
          file as any)
      } else {
        console.log("Decrypted Data: ", decryptFile);
      }

      return {
        rawData: encryptedSymKey,
        hashCheck: hashCheck,
      };
    } else {
      console.log("Error decrypting message.");
      return null;
    }
  }

  public async revealPost(
    feedAddress: string,
    symmetricKey: string,
    postRawData: string
  ) {
    const symKeyHash = await MecenateHelper.multihash({
      input: JSON.stringify({ symmetricKey: symmetricKey }),
      inputType: "raw",
      outputType: "b58",
    });

    const rawDataHash = await MecenateHelper.multihash({
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

    const AbiCoder = new ethers.utils.AbiCoder();
    const dataEncoded = AbiCoder.encode(
      ["string", "string"],
      [symKeyHash, rawDataHash]
    );

    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);

    await feedCtx?.revealData(dataEncoded);
  }

  public async finalizePost(
    valid: boolean,
    punishment: string,
    feedAddress: string
  ) {
    console.log("Finalizing Data...");

    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);
    const post = await feedCtx?.post();

    const encryptedData = post.postdata?.data.encryptedData;

    if (valid == true) {
      const encodedData = schemaEncoder.encodeData([
        { name: "verified", value: valid, type: "bool" },
        { name: "feed", value: feedAddress, type: "address" },
        { name: "post", value: encryptedData, type: "bytes" },
      ]);
      console.log("Encoded Data: ", encodedData);

      const data = {
        recipient: post.postdata?.escrow?.seller,
        revocable: false, // Be aware that if your schema is not revocable, this MUST be false
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

      const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);

      await feedCtx?.finalizePost(valid, parseEther("0"), newAttestationUID);
    } else {
      const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);
      await feedCtx?.finalizePost(valid, parseEther(punishment), "0x00");
    }
  }

  public async renounce(feedAddress: string) {
    const feedCtx = new Contract(feedAddress, this.feedABI, this.signer);
    await feedCtx?.renouncePost();
  }

  public async listFeed() {
    let feedAddress = await this.factoryCtx?.getFeeds();
    const len = feedAddress.length;
    console.log("Feed Address: ", feedAddress);

    const results = [];
    for (let i = 0; i < len; i++) {
      const MecenateFeed = new ethers.Contract(
        feedAddress[i],
        this.feedABI,
        this.signer
      );

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

  public async feedInfo(feedAddress: string) {
    const MecenateFeed = new ethers.Contract(
      feedAddress,
      this.feedABI,
      this.signer
    );

    let post = await MecenateFeed.post();

    const result = ({
      feedAddress: feedAddress,
      creator: post[0],
      settings: post[1][0],
      escrow: post[1][1],
      data: post[1][2],
    });

    console.log("Feed Info:", JSON.stringify(result))

    return result;
  }

  public async fetchPost(_feedAddress: string) {
    const MecenateFeed = new ethers.Contract(
      _feedAddress,
      this.feedABI,
      this.signer
    );

    const post = await MecenateFeed.post();
    return JSON.stringify(post)
  }

  async getStake(_feedAddr: string) {
    const MecenateFeed = new ethers.Contract(
      _feedAddr,
      this.feedABI,
      this.signer
    );


    const stake = await MecenateFeed.getStake(this.signer?.getAddress());

    console.log(formatEther(stake));
  }

  public async addStake(tokenId: string, _feedAddr: string, stakeAmount: string) {
    console.log("Adding Stake...");
    const MecenateFeed = new ethers.Contract(
      _feedAddr,
      this.feedABI,
      this.signer
    );

    const post = await MecenateFeed?.post();
    const postTokenId = post.postdata?.settings?.tokenId;

    if (tokenId != postTokenId) {
      console.log("Wrong tokenID");
      return;
    }

    await MecenateFeed?.addStake(postTokenId, this.signer.getAddress(), parseEther(stakeAmount), {
      value: postTokenId == 0 ? parseEther(stakeAmount) : 0,
    })
  }

  public async takeAll(tokenId: string, _feedAddr: string, receiver: string) {
    const MecenateFeed = new ethers.Contract(
      _feedAddr,
      this.feedABI,
      this.signer
    );
    const post = await MecenateFeed?.post();
    const postTokenId = post.postdata?.settings?.tokenId;

    if (tokenId != postTokenId) {
      console.log("Wrong tokenID");
      return;
    }

    MecenateFeed?.takeFullStake(postTokenId, receiver)
    console.log("Take All Stake...");
  }

  public async takeStake(tokenId: string, _feedAddr: string, stakeAmount: string, receiver: string) {

    const MecenateFeed = new ethers.Contract(
      _feedAddr,
      this.feedABI,
      this.signer
    );
    const post = await MecenateFeed?.post();
    const postTokenId = post.postdata?.settings?.tokenId;
    if (tokenId != postTokenId) {
      console.log("Wrong tokenID");
      return;
    }
    console.log("Take Stake...");

    MecenateFeed?.takeStake(postTokenId, receiver, parseEther(stakeAmount))

  }

  // Helpers
  base64Mime(encoded: string) {
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

  convertBase64ToFile(base64String: string, fileName: string) {
    const arr: any = base64String.split(",");
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




