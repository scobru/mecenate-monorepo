const Box = require("3box");
const ErasureHelper = require("@erasure/crypto-ipfs");
const pinataSDK = require("@pinata/sdk");
const axios = require("axios");

/**
 * Helper for Numerai posts.
 * @param {string} SpaceName For 3Box - name for public space that data will be stored. Suggest numerai.
 * @param {string} EthAddress Post creator Ethereum address. Will also be used for 3Box.
 */
function NumeraiHelper(SpaceName, EthAddress) {
  this.spaceName = SpaceName;
  this.ethAddress = EthAddress;
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
NumeraiHelper.prototype.savePost = async function (RawData, StorageMethod, PinataApiKey, PinataApiSecret) {
  if (StorageMethod === "3Box") {
    console.log("Saving Data To 3Box");
    // Creates post data - See createPostData function for more info on data format.
    var postData = await this.createPostData(RawData);
    console.log("Saving encrypted data to hash key: " + postData.proofJson.encryptedDatahash);
    // Saves the encrypted data to 3Box public space under key matching encryptedDatahash.
    await SaveTo3Box(this.spaceName, postData.proofJson.encryptedDatahash, postData.encryptedData);

    console.log("Saving proof JSON to hash key: " + postData.proofhash);
    // Saves Proof JSON data to 3Box public space under key matching proofhash.
    await SaveTo3Box(this.spaceName, postData.proofhash, JSON.stringify(postData.proofJson));
    console.log("Data Saved.");
    return postData;
  } else {
    // IPFS needs Pinata account credentials.
    if (PinataApiKey === undefined || PinataApiSecret === undefined) {
      console.log("Please call with Pinata Account Credentials");
      return;
    }

    // Make sure Pinata is authenticating.
    const pinata = pinataSDK(PinataApiKey, PinataApiSecret);
    var pinataAuth = await pinata.testAuthentication();
    if (pinataAuth.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    // Creates post data - See createPostData function for more info on data format.
    postData = await this.createPostData(RawData);

    console.log("Saving encrypted data...");
    // Saves the encrypted data to IPFS.
    var pin = await pinata.pinJSONToIPFS({ encryptedData: postData?.encryptedData });
    // Check that JSON proof does have the correct info.
    if (pin.IpfsHash !== postData?.proofJson.encryptedDatahash) {
      console.log("Error with Encrypted Data Hash.");
      console.log(pin.IpfsHash);
      console.log(postData.proofJson.encryptedDatahash);
      return;
    }

    console.log("Saving proof JSON...");
    // Saves the proof JSON to IPFS.
    pin = await pinata.pinJSONToIPFS(postData.proofJson);
    // Check that JSON proof does have the correct info.
    if (pin.IpfsHash !== postData.proofhash) {
      console.log("Error with proof Hash.");
      console.log(pin.IpfsHash);
      console.log(postData.proofhash);
      return;
    }
    console.log("Data Saved.");
    return postData
  }
};

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
NumeraiHelper.prototype.createPostData = async function (RawData) {
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
    creator: this.ethAddress,
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

  console.log(RawData);
  console.log(encryptedFile);
  console.log(symmetricKey);
  console.log(symmetricKeyHash);
  console.log(dataHash);
  console.log(encryptedDataHash);
  console.log(proofHash58);

  return {
    proofJson: jsonblob_v1_2_0,
    proofhash: proofHash58,
    symmetricKey: symmetricKey,
    encryptedData: encryptedFile,
  };
};

/**
 * Retrieves encrypted data from selected storage method, decrypts and checks against hash.
 * @param {string} JsonHash Hash of proofJson - normally retrieved from On-Chain.
 * @param {string} SymmetricKey SymmetricKey used to decrypt data.
 * @param {string} StorageMethod 3Box or IPFS via Pinata. (Others can be added).
 * @return {object} { rawData: rawMessage, hashCheck: hashCheck }
 */
NumeraiHelper.prototype.retrievePost = async function (JsonHash, SymmetricKey, StorageMethod) {
  if (StorageMethod === "3Box") {
    console.log("Retrieving Data From 3Box space: " + this.spaceName);
    // Data stored publically so no auth required.
    var jsonAllData = await Box.getSpace(this.ethAddress, this.spaceName);
    // Get JSON proof object - this gives location of encrypted data via hash.
    var jsonStr = jsonAllData[JsonHash];
    var json = JSON.parse(jsonStr);
    // Get encrypted data.
    var encryptedData = jsonAllData[json.encryptedDatahash];
    // Decode encrypted data.
    const rawMessage = ErasureHelper.crypto.symmetric.decryptMessage(SymmetricKey, encryptedData);
    console.log(rawMessage);

    const dataHash = await ErasureHelper.multihash({
      input: rawMessage,
      inputType: "raw",
      outputType: "hex",
    });

    var hashCheck = json.datahash === dataHash;
    return {
      rawData: rawMessage,
      hashCheck: hashCheck,
    };
  } else {
    console.log("Retrieving IPFS Data...");
    var response = await axios.get("https://ipfs.io/ipfs/" + JsonHash);
    console.log(response.data);
    var hashCheck = response.data.datahash;
    response = await axios.get("https://ipfs.io/ipfs/" + response.data.encryptedDatahash);
    console.log("Encrypted Data: ");
    console.log(response.data);
    const rawMessage = ErasureHelper.crypto.symmetric.decryptMessage(SymmetricKey, response.data.encryptedData);
    console.log(rawMessage);

    const dataHash = await ErasureHelper.multihash({
      input: rawMessage,
      inputType: "raw",
      outputType: "hex",
    });

    var hashCheck = hashCheck === dataHash;
    return {
      rawData: rawMessage,
      hashCheck: hashCheck,
    };
  }
};

/**
 * Saves data to 3Box. Requires user to authenticate - currently via MetaMask.
 * @param {string} spaceName Name for public space that data will be stored. Suggest numerai.
 * @param {string} DataKey Key, this will match IPFS hash of the data.
 * @param {string} DataValue Data being saved.
 */
async function SaveTo3Box(spaceName, DataKey, DataValue) {
  // For MetaMask the user must give permission for application.
  const accounts = await window.ethereum.enable();
  // Open account 3Box. Will require user to sign via MetaMask.
  const box = await Box.openBox(accounts[0], window.ethereum);
  console.log("Opening space: " + spaceName);
  // Open app space - where the data will be stored (public space). Will require user to sign via MetaMask.
  const space = await box.openSpace(spaceName);
  // Wait for 3Box to sync.
  await space.syncDone;
  console.log("Opened");
  console.log("Saving...");
  // Save the data.
  await space.public.set(DataKey, DataValue);
  console.log("Saved");
}

/**
 * Allows data owner to reveal post by saving data & key to selected storage.
 * @param {string} SymKey Symmetric Key.
 * @param {string} RawData Raw data from creator.
 * @param {string} StorageMethod 3Box or IPFS via Pinata. (Others can be added)
 * @param {string} PinataApiKey Only for IPFS.
 * @param {string} PinataApiSecret Only for IPFS.
 */
NumeraiHelper.prototype.revealPost = async function (SymKey, RawData, StorageMethod, PinataApiKey, PinataApiSecret) {
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

  if (StorageMethod === "3Box") {
    console.log("Saving Data To 3Box");
    // Saves the symmetricKey to 3Box public space under key matching IPFS hash.
    await SaveTo3Box(this.spaceName, symKeyHash, SymKey);
    // Saves raw data to 3Box public space under key matching IPFS hash.
    await SaveTo3Box(this.spaceName, rawDataHash, RawData);
    console.log("Data Saved.");
  } else {
    // IPFS needs Pinata account credentials.
    if (PinataApiKey === undefined || PinataApiSecret === undefined) {
      console.log("Please call with Pinata Account Credentials");
      return;
    }

    // Make sure Pinata is authenticating.
    const pinata = pinataSDK(PinataApiKey, PinataApiSecret);
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
};

module.exports = NumeraiHelper;
