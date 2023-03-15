import { ethers } from "ethers/lib";

const ErasureHelper = require("@erasure/crypto-ipfs");
const pinataSDK = require("@pinata/sdk");
const axios = require("axios");
const pinataApiSecret = "49be591effec457330d0b7f3b985a64b5fe34e8731006e2a72ddbf6388c6baf3";
const pinataApiKey = "db6edfd69adcb416fe1c";
import nacl = require("tweetnacl"); // cryptographic functions
import util = require("tweetnacl-util"); // encoding & decoding

const PrivateKey1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const PrivateKey2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const secretKeyUInt8Array = util.decodeUTF8(PrivateKey1);
const secretUInt8Array_32 = Uint8Array.prototype.slice.call(secretKeyUInt8Array, 0, 32);
const secretKeyUInt8Array_2 = util.decodeUTF8(PrivateKey1);
const secretUInt8Array_32_2 = Uint8Array.prototype.slice.call(secretKeyUInt8Array_2, 0, 32);
let account1KeyPair = nacl.box.keyPair.fromSecretKey(Buffer.from(secretUInt8Array_32));
let account2KeyPair = nacl.box.keyPair.fromSecretKey(Buffer.from(secretUInt8Array_32_2));

console.log(account1KeyPair);
console.log(account2KeyPair);

interface IEncryptedMsg {
  ciphertext: string;
  ephemPubKey: string;
  nonce: string;
  version: string;
}
/**
 * Creates required Post data from RawData and stores encrypted data and proof JSON using selected storage method.
 * See createPostData for more info on data format.
 * @param {string} RawData Raw data from creator.
 * @param {string} StorageMethod 3Box or IPFS via Pinata. (Others can be added)
 * @param {string} PinataApiKey Only for IPFS.
 * @param {string} PinataApiSecret Only for IPFS.
 * @return {object} Post object.
 {
  proofJson: {
    creator: this.ethAddress,                      // Post creator address.
    salt: ErasureHelper.crypto.asymmetric.generateNonce(),
    datahash: dataHash,                            // Hash of the raw data - used for confirmation
    encryptedDatahash: encryptedDataHash,         // This allows the encrypted data to be located on IPFS or 3Box
    keyhash: symmetricKeyHash                      // Hash of symmetricKey used for encryption - used for confirmation
  }
  proofhash: proofHash58,                          // Hash of proofJson - should be saved on chain
  symmetricKey: symmetricKey,                      // SymmetricKey used for encryption. For post creator to store.
  encryptedData: encryptedFile                     // Encrypted data - used for storage.
};
 */
async function savePost(RawData: string, seller: string) {
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
  let postData = await createPostData(RawData, seller);

  console.log("Saving encrypted data...");
  // Saves the encrypted data to IPFS.
  var pin = await pinata.pinJSONToIPFS({ encryptedData: postData?.encryptedData });
  // Check that JSON proof does have the correct info.
  if (pin.IpfsHash !== postData?.proofJson.encryptedDatahash) {
    console.log("Error with Encrypted Data Hash.");
    console.log(pin.IpfsHash);
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

/**
 * Helper to convert the raw data to required Numerai format with other useful info.
  generates a sym key
  creates hash of sym key
  encrypts the raw data
  create hash of raw & encrypted data
  creates JSON of the data to be saved on-chain
  creates proof hash
 * @param {string} RawData Raw data from creator.
 * @return {object} Post object in format:
  {
   proofJson: {
     creator: this.ethAddress,                      // Post creator address.
     salt: ErasureHelper.crypto.asymmetric.generateNonce(),
     datahash: dataHash,                            // Hash of the raw data - used for confirmation
     encryptedDatahash: encryptedDataHash,         // This allows the encrypted data to be located on IPFS or 3Box
     keyhash: symmetricKeyHash                      // Hash of symmetricKey used for encryption - used for confirmation
   }
   proofhash: proofHash58,                          // Hash of proofJson - should be saved on chain
   symmetricKey: symmetricKey,                      // SymmetricKey used for encryption. For post creator to store.
   encryptedData: encryptedFile                     // Encrypted data - used for storage.
 };
 */
async function createPostData(RawData: any, seller: string) {
  try {
    // SymKey Generate sym key
    const symmetricKey = ErasureHelper.crypto.symmetric.generateKey(); // base64 string

    // encryptedData Encrypt Raw Data
    const encryptedFile = ErasureHelper.crypto.symmetric.encryptMessage(symmetricKey, RawData);

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

/**
 * Allows data owner to reveal post by saving data & key to selected storage.
 * @param {string} SymKey Symmetric Key.
 * @param {string} RawData Raw data from creator.
 * @param {string} StorageMethod 3Box or IPFS via Pinata. (Others can be added)
 * @param {string} PinataApiKey Only for IPFS.
 * @param {string} PinataApiSecret Only for IPFS.
 */
async function revealPost(SymKey: any, RawData: any) {
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

async function submitData(symmetricKey: string, proofhash: string, seller: string, buyer: string) {
  const pubKeyUInt8Array = Uint8Array.prototype.slice.call(account2KeyPair.publicKey, 0, 32);
  const msgParamsUInt8Array = util.decodeBase64(symmetricKey);

  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  const encryptedMessage = nacl.box(msgParamsUInt8Array, nonce, pubKeyUInt8Array, account1KeyPair.secretKey);

  const encryptedSymKey_Buyer = {
    ciphertext: util.encodeBase64(encryptedMessage),
    ephemPubKey: util.encodeBase64(pubKeyUInt8Array),
    nonce: util.encodeBase64(nonce),
    version: "x25519-xsalsa20-poly1305",
  };

  console.log("Encrypted Symmetric Key", encryptedSymKey_Buyer);

  const json_selldata_v120 = {
    esp_version: "v1.2.0",
    proofhash: proofhash,
    sender: seller,
    senderPubKey: seller,
    receiver: buyer,
    receiverPubKey: buyer,
    encryptedSymKey: encryptedSymKey_Buyer,
  };

  const proofHashSellData = await ErasureHelper.multihash({
    input: JSON.stringify(json_selldata_v120),
    inputType: "raw",
    outputType: "b58",
  });

  // Make sure Pinata is authenticating.
  const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);
  var pinataAuth = await pinata.testAuthentication();

  if (pinataAuth.authenticated !== true) {
    console.log("Pinata Authentication Failed.");
    return;
  }

  console.log("Saving proof JSON...");
  // Saves the proof JSON to IPFS.

  // const pin = await pinata.pinJSONToIPFS(json_selldata_v120);

  const proofHash58 = await ErasureHelper.multihash({
    input: JSON.stringify(json_selldata_v120),
    inputType: "raw",
    outputType: "b58",
  });

  // Check that JSON proof does have the correct info.
  /*  if (pin.IpfsHash !== proofHash58) {
    console.log("Error with proof Hash.");
    console.log(pin.IpfsHash);
    console.log(proofHash58);
    return;
  } */

  console.log("Data Saved.");

  return {
    proofJson: json_selldata_v120,
    proofHash58: proofHash58,
  };
}

async function retrievePost(JsonHash: string, encryptedSymKey: IEncryptedMsg, SymKey: string) {
  console.log("Retrieving Data...");
  const nonce = util.decodeBase64(encryptedSymKey.nonce);
  const ciphertext = util.decodeBase64(encryptedSymKey.ciphertext);
  const ephemPubKey = util.decodeBase64(encryptedSymKey.ephemPubKey);
  const decryptedMessage = nacl.box.open(ciphertext, nonce, ephemPubKey, account2KeyPair.secretKey);

  if (decryptedMessage) {
    console.log("Encrypted Data: ", decryptedMessage);

    const dataHash = await ErasureHelper.multihash({
      input: decryptedMessage,
      inputType: "raw",
      outputType: "hex",
    });

    const response = await axios.get("https://gateway.pinata.cloud/ipfs/" + JsonHash);

    const hashCheck = response.data.datahash === dataHash;

    return {
      rawData: decryptedMessage,
      hashCheck: hashCheck,
    };
  } else {
    console.log("Error decrypting message.");
    return null;
  }
}

async function main() {
  const hre = require("hardhat");

  const accounts = await hre.ethers.getSigners();
  const account1 = accounts[1];
  const account2 = accounts[2];

  const postdata = await createPostData("Hello World", account1);
  const submit = await submitData(postdata?.symmetricKey, postdata?.proofhash, account1.address, account2.address);
  const retrieve = await retrievePost(postdata?.proofhash, submit?.proofJson?.encryptedSymKey!, account1.address);
}

main();

export { retrievePost, revealPost, savePost, submitData, createPostData };
