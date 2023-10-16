import nacl from "tweetnacl";
import util from "tweetnacl-util";
import fs from "fs";
import path from "path";
import dotenv from "dotenv"; // Load environment variables from .env file
import pinataSDK from "@pinata/sdk";
import axios from "axios";
import { ethers } from "ethers";
const base64js = require("base64-js");

// Decode
const crypto = require("asymmetric-crypto");
dotenv.config();

const ErasureHelper = require("@erasure/crypto-ipfs");

async function savePost(
  RawData: string,
  seller: string,
  sellerPubKey: string,
  pinataApiKey,
  pinataApiSecret
) {
  // IPFS needs Pinata account credentials.
  if (pinataApiKey === undefined || pinataApiSecret === undefined) {
    console.log("Please call with Pinata Account Credentials");
    return;
  }

  // Make sure Pinata is authenticating.
  const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);

  var pinataAuth = await pinata.testAuthentication();

  if (pinataAuth.authenticated !== true) {
    console.log("Pinata Authentication Failed.");
    return;
  }

  // Creates post data - See createPostData function for more info on data format.
  let postData = await createPostData(RawData, seller, sellerPubKey);

  console.log("Saving encrypted data...");
  // Saves the encrypted data to IPFS.

  var pin = await pinata
    .pinJSONToIPFS({
      encryptedData: postData?.encryptedData,
    })
    .catch((err) => {
      console.log(err);
    });

  // Check that JSON proof does have the correct info.
  if (pin?.IpfsHash !== postData?.proofJson.encryptedDatahash) {
    console.log("Error with Encrypted Data Hash.");
    console.log(pin?.IpfsHash);
    console.log(postData?.proofJson.encryptedDatahash);
    return;
  }

  console.log("Saving proof JSON...");

  // Saves the proof JSON to IPFS.
  pin = await pinata.pinJSONToIPFS(postData?.proofJson);

  // Check that JSON proof does have the correct info.
  if (pin.IpfsHash !== postData?.proofhash) {
    console.log("Error with proof Hash.");
    console.log(pin.IpfsHash);
    console.log(postData?.proofhash);
    return;
  }

  console.log("Data Saved.");
  return postData;
}

async function createPostData(
  RawData: any,
  seller: string,
  sellerPubKey: string
) {
  try {
    // SymKey Generate sym key
    const symmetricKey = ErasureHelper.crypto.symmetric.generateKey(); // base64 string

    // encryptedData Encrypt Raw Data
    const encryptedFile = ErasureHelper.crypto.symmetric.encryptMessage(
      symmetricKey,
      RawData
    );

    // keyhash Hash sym key
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

    // jsonblob_v1_2_0 = JSON(address_seller, salt, multihashformat(datahash), multihashformat(keyhash), multihashformat(encryptedDatahash))
    const jsonblob_v1_2_0 = {
      creator: seller,
      creatorPubKey: sellerPubKey,
      salt: ErasureHelper.crypto.asymmetric.generateNonce(),
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

async function revealPost(
  SymKey: any,
  RawData: any,
  pinataApiKey,
  pinataApiSecret
) {
  const symKeyHash = await ErasureHelper.multihash({
    input: JSON.stringify({ symmetricKey: SymKey }),
    inputType: "raw",
    outputType: "b58",
  });

  const rawDataHash = await ErasureHelper.multihash({
    input: JSON.stringify({ rawData: RawData }),
    inputType: "raw",
    outputType: "b58",
  });

  // IPFS needs Pinata account credentials.
  if (pinataApiKey === undefined || pinataApiSecret === undefined) {
    console.log("Please call with Pinata Account Credentials");
    return;
  }

  // Make sure Pinata is authenticating.
  const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);

  var pinataAuth = await pinata.testAuthentication();

  if (pinataAuth.authenticated !== true) {
    console.log("Pinata Authentication Failed.");
    return;
  }

  // Saves the SymKey to IPFS.
  var pin = await pinata.pinJSONToIPFS({ symmetricKey: SymKey });

  // Saves the data to IPFS.
  pin = await pinata.pinJSONToIPFS({ rawData: RawData });

  console.log("Data Saved.");
}

async function submitData(
  feed: any,
  symmetricKey: any,
  proofhash: any,
  seller: string,
  buyer: string,
  buyerPubKey: any
) {
  const keypair = await fetchKeyPair();
  const abicoder = new ethers.AbiCoder();
  const buyerPubKeyDecoded = abicoder.decode(["string"], buyerPubKey);

  const encrypted = crypto.encrypt(
    symmetricKey,
    buyerPubKeyDecoded,
    keypair.secretKey
  );

  console.log(encrypted);

  const encryptedSymKey_Buyer = {
    ciphertext: encrypted.data,
    ephemPubKey: keypair.publicKey,
    nonce: encrypted.nonce,
    version: "v1.0.0",
  };

  console.log("Encrypted Symmetric Key", encryptedSymKey_Buyer);

  const json_selldata_v120 = {
    esp_version: "v1.2.0",
    proofhash: proofhash,
    sender: seller,
    senderPubKey: keypair.publicKey,
    receiver: buyer,
    receiverPubKey: buyerPubKey,
    encryptedSymKey: encryptedSymKey_Buyer,
  };

  const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);
  var pinataAuth = await pinata.testAuthentication();

  if (pinataAuth.authenticated !== true) {
    console.log("Pinata Authentication Failed.");
    return;
  }

  console.log("Saving proof JSON...");

  const pin = await pinata.pinJSONToIPFS(json_selldata_v120);

  const proofHash58 = await ErasureHelper.multihash({
    input: JSON.stringify(json_selldata_v120),
    inputType: "raw",
    outputType: "b58",
  });

  const proofHash58Decode = await ErasureHelper.multihash({
    input: proofHash58,
    inputType: "b58",
    outputType: "digest",
  });

  if (pin.IpfsHash !== proofHash58) {
    console.log("Error with proof Hash.");
    console.log(pin.IpfsHash);
    console.log(proofHash58);
    return;
  }

  console.log("Data Saved.");

  // store keypair
  const ipfsPath = "./ipfsPost/post_sell_" + feed + ".json";
  // if doesnt exit create folder
  if (!fs.existsSync("./ipfsPost")) {
    fs.mkdirSync("./ipfsPost");
  }

  if (!fs.existsSync(ipfsPath)) {
    fs.writeFileSync(ipfsPath, JSON.stringify(json_selldata_v120));
    console.log(JSON.stringify(json_selldata_v120));
    console.log("Ipfs data saved!");
  } else {
    fs.writeFileSync(ipfsPath, JSON.stringify(json_selldata_v120));
    console.log(JSON.stringify(json_selldata_v120));
    console.log("Ipfs data already exists!");
  }

  //CHeck Fetch data
  const response = await axios.get(
    "https://gateway.pinata.cloud/ipfs/" + pin.IpfsHash,
    {
      headers: {
        Accept: "text/plain",
      },
    }
  );

  // check response is ipfs valid content
  if (response.data.esp_version !== "v1.2.0") {
    console.log("Error with proof Hash.");
    console.log(response.data.esp_version);
    console.log("v1.2.0");
    return;
  }

  return {
    proofJson: json_selldata_v120,
    proofHash58: proofHash58,
    proofHash58Decode: proofHash58Decode,
  };
}

async function retrievePost(JsonHash: string) {
  console.log("Retrieving Data...");

  const keypair = await fetchKeyPair2();

  var decodeHash = await ErasureHelper.multihash({
    input: JsonHash,
    inputType: "sha2-256",
    outputType: "b58",
  });

  console.log("Decoded Hash: ", decodeHash);

  //#endregion
  const responseDecodeHash = await axios.get(
    "https://gateway.pinata.cloud/ipfs/" + decodeHash,
    {
      headers: {
        Accept: "text/plain",
      },
    }
  );

  const responseDecodeHahJSON = JSON.parse(
    JSON.stringify(responseDecodeHash.data)
  );

  const encryptedSymKey = JSON.parse(
    JSON.stringify(responseDecodeHahJSON.encryptedSymKey)
  );

  console.log("Encrypted Symmetric Key: ", encryptedSymKey);

  const decrypted = crypto.decrypt(
    encryptedSymKey.ciphertext,
    encryptedSymKey.nonce,
    encryptedSymKey.ephemPubKey,
    keypair.secretKey
  );

  const responseProofHash = await axios.get(
    "https://gateway.pinata.cloud/ipfs/" + responseDecodeHahJSON.proofhash,
    {
      headers: {
        Accept: "text/plain",
      },
    }
  );

  const responseProofHashJSON = JSON.parse(
    JSON.stringify(responseProofHash.data)
  );

  const response_Encrypteddatahash = await axios.get(
    "https://gateway.pinata.cloud/ipfs/" +
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

  const decriptFile = ErasureHelper.crypto.symmetric.decryptMessage(
    decrypted,
    response_Encrypteddatahash_JSON.encryptedData
  );

  // wait 10 seconds
  if (decriptFile) {
    console.log("Decrypted Data: ", decriptFile);
    const dataHash = await ErasureHelper.multihash({
      input: decriptFile,
      inputType: "raw",
      outputType: "hex",
    });

    const hashCheck = responseProofHashJSON.datahash === dataHash;
    console.log();
    return {
      rawData: decrypted,
      hashCheck: hashCheck,
    };
  } else {
    console.log("Error decrypting message.");
    return null;
  }
}

async function createKeyPair() {
  console.log("Generating Key Pair...");
  // Generate a keypair with nacl and store it in a folder
  const privateKeyUTF8 = util.decodeUTF8(String(process.env.PRIVATEKEY));
  const privateKeyU8a = Uint8Array.prototype.slice.call(privateKeyUTF8, 0, 32);
  const kp = nacl.box.keyPair.fromSecretKey(privateKeyU8a);

  // encode the keypair as a JSON string
  const keypairJSON = JSON.stringify({
    publicKey: util.encodeBase64(kp.publicKey),
    secretKey: util.encodeBase64(kp.secretKey),
  });

  // store keypair
  const keypairPath = path.join("keypair", "keypair.json");
  fs.writeFileSync(keypairPath, keypairJSON);

  const keyPair = keypairJSON;
  console.log(keypairJSON);
  console.log("Keypair created successfully!");
  return keyPair;
}

export {
  retrievePost,
  revealPost,
  savePost,
  submitData,
  createPostData,
  createKeyPair,
  fetchKeyPair,
};
