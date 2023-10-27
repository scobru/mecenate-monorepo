import { ethers, Contract } from "ethers";

const crypto = require("asymmetric-crypto");
const ErasureHelper = require("@erasure/crypto-ipfs");
const pinataSDK = require("@pinata/sdk");

export class MecenateClient {
  private signer: any;
  private pinataApiKey: string;
  private pinataApiSecret: string;

  constructor(signer: any, pinataApiKey: string, pinataApiSecret: string) {
    this.signer = signer;
    this.pinataApiKey = pinataApiKey;
    this.pinataApiSecret = pinataApiSecret;
  }

  public createPair() {
    const kp = crypto.keyPair();
    return kp;
  }

  public async registerUser(responseBytes: string, pubKey: string, userContract: Contract) {
    console.log("Signing in...");

    // Esecuzione della transazione
    const tx = await userContract.registerUser(responseBytes, ethers.utils.toUtf8Bytes(pubKey));

    // Attesa della conferma della transazione
    const receipt = await tx.wait();

    // Log o ulteriori operazioni con la ricevuta di transazione
    console.log("Transaction receipt:", receipt);
  }

  public async buildFeed(factoryContract: Contract, treasuryContract: Contract) {
    const fee = await treasuryContract.fixedFee();

    const tx = await factoryContract.buildFeed({ value: fee });
    const receipt = await tx.wait();

    console.log("Transaction receipt:", receipt);
  }

  public async createPostData(RawData: any) {
    try {
      const symmetricKey = ErasureHelper.crypto.symmetric.generateKey();
      const encryptedFile = ErasureHelper.crypto.symmetric.encryptMessage(symmetricKey, RawData);

      const symmetricKeyHash = await ErasureHelper.multihash({
        input: symmetricKey,
        inputType: "raw",
        outputType: "hex",
      });

      // datahash sha256(rawdata)

      const dataHash = await ErasureHelper.multihash({
        input: RawData,
        inputType: "raw",
        outputType: "hex",
      });

      // encryptedDatahash = sha256(encryptedData)

      // This hash will match the IPFS pin hash
      const encryptedDataHash = await ErasureHelper.multihash({
        input: JSON.stringify({ encryptedData: encryptedFile }),
        inputType: "raw",
        outputType: "b58",
      });

      // jsonblob_v1_2_0 = JSON(multihashformat(datahash), multihashformat(keyhash), multihashformat(encryptedDatahash))
      const jsonblob_v1_2_0 = {
        seller: signerAddress,
        datahash: dataHash,
        encryptedDatahash: encryptedDataHash, // This allows the encrypted data to be located on IPFS or 3Box
        keyhash: symmetricKeyHash,
      };

      // proofhash = sha256(jsonblob_v1_2_0)
      // This hash will match the IPFS pin hash. It should be saved to the users feed contract.
      const proofHash58 = await ErasureHelper.multihash({
        input: JSON.stringify(jsonblob_v1_2_0),
        inputType: "raw",
        outputType: "b58",
      });

      console.log("RawData", RawData);
      console.log("Encrypted File", encryptedFile);
      console.log("Symmetric Key", symmetricKey);
      console.log("Key Hash", symmetricKeyHash);
      console.log("Datahash", dataHash);
      console.log("Encrypted DataHash", encryptedDataHash);
      console.log("ProofHash", proofHash58);

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
    feedContractAddress: Contract,
    postRawData: any,
    buyer: string,
    postType: number,
    postDuration: number,
    buyerPayment: string,
    postStake: string,
    tokenId: number,
    funder: string,
    seller: string,
    useStake: boolean,
  ) {
    const dataSaved = await savePost(postRawData);

    const proofOfHashEncode = await ErasureHelper.multihash({
      input: dataSaved?.proofhash,
      inputType: "b58",
      outputType: "digest",
    });

    console.log("ProofHash", proofOfHashEncode);
    console.log("Start Tx...");
    console.log("Signer Address: ", signer?.getAddress());

    let _buyer;

    if (buyer == "") {
      _buyer = ethers.constants.AddressZero;
    } else {
      _buyer = buyer;
    }

    const feedCtx = new Contract(feedContractAddress, feedABI, this.signer);

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
        value: tokenId == "0" ? parseEther(postStake) : 0,
      },
    );
  }

  public async savePost(RawData: string): Promise<any | void> {
    console.log("Saving Data...");

    // Check Pinata credentials.
    if (!pinataApiKey || !pinataApiSecret) {
      console.log("Please call with Pinata Account Credentials");
      return;
    }

    // Authenticate with Pinata.
    const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);
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
      let pin = await pinata.pinJSONToIPFS({ encryptedData: postData.encryptedData });
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
}
