import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateInterface } from "../../hardhat/typechain-types/contracts/Mecenate";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";
import { AbiCoder, formatEther, parseEther } from "ethers/lib/utils";
import pinataSDK from "@pinata/sdk";
import axios from "axios";
import dotenv from "dotenv";
import utils from "ethers";

dotenv.config();
const crypto = require("asymmetric-crypto");
const ErasureHelper = require("@erasure/crypto-ipfs");
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinataApiKey = process.env.PINATA_API_KEY;

const ViewFeed: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();
  const router = useRouter();
  const { addr } = router.query;

  const [postType, setPostType] = useState<any>([]);
  const [postDuration, setPostDuration] = useState<any>([]);
  const [postStake, setPostStake] = useState<any>([]);
  const [postRawData, setPostRawData] = useState<any>([]);
  const [postProofHash, setPostProofHash] = useState<any>([]);
  const [postPayment, setPostPayment] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symmetricKey, setSymmetricKey] = useState<any>([]);
  const [encryptedData, setEncryptedData] = useState<any>([]);
  const [secretKey, setSecretKey] = useState<any>([]);

  let user = "";
  let owner = "";

  const [feedData, setFeedData] = useState<any>([]);
  const deployedContractFeed = getDeployedContract(chain?.id.toString(), "MecenateFeed");

  const [userData, setUserData] = useState<any>([]);
  const deployedContractUsers = getDeployedContract(chain?.id.toString(), "MecenateUsers");

  let feedAddress!: string;
  let feedAbi: ContractInterface[] = [];

  let usersAddress!: string;
  let usersAbi: MecenateInterface[] = [];

  if (deployedContractUsers) {
    ({ address: usersAddress, abi: usersAbi } = deployedContractUsers);
  }

  if (deployedContractFeed) {
    ({ address: feedAddress, abi: feedAbi } = deployedContractFeed);
  }

  const feedCtx = useContract({
    address: addr?.toString(),
    abi: feedAbi,
    signerOrProvider: signer || provider,
  });

  const usersCtx = useContract({
    address: usersAddress,
    abi: usersAbi,
    signerOrProvider: signer || provider,
  });

  function showModal() {
    setIsModalOpen(true);
  }

  function hideModal() {
    setIsModalOpen(false);
  }

  const fetchData = async function fetchData() {
    if (feedCtx && signer) {
      const data = await feedCtx?.post();
      const user = await usersCtx?.getUserData(signer?.getAddress());
      setUserData(user);
      setFeedData(data);
      console.log(data);
      console.log(user);
    }
  };

  const createPost = async function createPost() {
    await fetchData();
    const pubKey = userData.publicKey;
    const dataSaved = await savePost(postRawData, String(signer?.getAddress()), pubKey);
    notification.success("SYMMETIC KEY: " + dataSaved?.symmetricKey);
    notification.success("ENCRYPTED DATA: " + dataSaved?.encryptedData);
    notification.success("PROOF OF HASH: " + dataSaved?.proofhash);
    notification.warning("Save this data");

    const abicoder = new AbiCoder();
    const proofOfHashEcnode = abicoder.encode(["string"], [dataSaved?.proofhash]);

    const tx = await feedCtx?.createPost(proofOfHashEcnode, Number(postType), Number(postDuration), {
      value: parseEther(postStake),
    });
  };

  async function acceptPost() {
    const tx = await feedCtx?.acceptPost(userData.publicKey, { value: parseEther(postPayment) });
  }

  async function createPostData(RawData: any, seller: string, sellerPubKey: string) {
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

  async function savePost(RawData: string, seller: string, sellerPubKey: string) {
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
      .catch(err => {
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

  async function submitData() {
    const abiCoder = new ethers.utils.AbiCoder();
    const buyerPubKeyDecoded = abiCoder.decode(["string"], feedData[1][0].buyerPubKey);
    const proofhash = abiCoder.decode(["string"], feedData[1][2].encryptedData);

    //const proofhash = abiCoder.decode(["string"], feedData[1][2].encryptedData);
    const sellerPubKeyDecoded = abiCoder.decode(["string"], userData.publicKey);
    const encrypted = crypto.encrypt(symmetricKey, buyerPubKeyDecoded, secretKey);
    console.log(encrypted);

    const encryptedSymKey_Buyer = {
      ciphertext: encrypted.data,
      ephemPubKey: sellerPubKeyDecoded,
      nonce: encrypted.nonce,
      version: "v1.0.0",
    };

    console.log("Encrypted Symmetric Key", encryptedSymKey_Buyer);

    const json_selldata_v120 = {
      esp_version: "v1.2.0",
      proofhash: proofhash,
      sender: signer?.getAddress(),
      senderPubKey: sellerPubKeyDecoded,
      receiver: feedData[1][0].buyer,
      receiverPubKey: feedData[1][0].buyerPubKey,
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

    const proofHash58Digest = await ErasureHelper.multihash({
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

    //CHeck Fetch data
    const response = await axios.get("https://gateway.pinata.cloud/ipfs/" + pin.IpfsHash, {
      headers: {
        Accept: "text/plain",
      },
    });

    // check response is ipfs valid content
    if (response.data.esp_version !== "v1.2.0") {
      console.log("Error with proof Hash.");
      console.log(response.data.esp_version);
      console.log("v1.2.0");
      return;
    }

    const tx = await feedCtx?.submitHash(proofHash58Digest);
    await tx.wait();

    return {
      proofJson: json_selldata_v120,
      proofHash58: proofHash58,
      proofHash58Decode: proofHash58Digest,
    };
  }

  async function retrievePost() {
    console.log("Retrieving Data...");
    await fetchData();
    const abiCoder = new ethers.utils.AbiCoder();
    console.log(feedData[1][2].encryptedKey);

    var decodeHash = await ErasureHelper.multihash({
      input: feedData[1][2].encryptedKey,
      inputType: "sha2-256",
      outputType: "b58",
    });

    console.log("Decoded Hash: ", decodeHash);

    //#endregion
    const responseDecodeHash = await axios.get("https://gateway.pinata.cloud/ipfs/" + decodeHash, {
      headers: {
        Accept: "text/plain",
      },
    });

    const responseDecodeHahJSON = JSON.parse(JSON.stringify(responseDecodeHash.data));

    const encryptedSymKey = JSON.parse(JSON.stringify(responseDecodeHahJSON.encryptedSymKey));

    console.log("Encrypted Symmetric Key: ", encryptedSymKey);

    const decrypted = crypto.decrypt(
      encryptedSymKey.ciphertext,
      encryptedSymKey.nonce,
      encryptedSymKey.ephemPubKey,
      secretKey,
    );

    console.log(decrypted);
    console.log(responseDecodeHahJSON.proofhash);

    const responseProofHash = await axios.get("https://gateway.pinata.cloud/ipfs/" + responseDecodeHahJSON.proofhash, {
      headers: {
        Accept: "text/plain",
      },
    });

    console.log(responseProofHash);

    const responseProofHashJSON = JSON.parse(JSON.stringify(responseProofHash.data));

    console.log(responseProofHashJSON);

    const response_Encrypteddatahash = await axios.get(
      "https://gateway.pinata.cloud/ipfs/" + responseProofHashJSON.encryptedDatahash,
      {
        headers: {
          Accept: "text/plain",
        },
      },
    );

    const response_Encrypteddatahash_JSON = JSON.parse(JSON.stringify(response_Encrypteddatahash.data));

    const decriptFile = ErasureHelper.crypto.symmetric.decryptMessage(
      decrypted,
      response_Encrypteddatahash_JSON.encryptedData,
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
      notification.success(decriptFile);
      return {
        rawData: decrypted,
        hashCheck: hashCheck,
      };
    } else {
      console.log("Error decrypting message.");
      return null;
    }
  }

  useEffect(() => {
    try {
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }, [feedCtx, router.isReady]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {feedData[0] != null ? (
        <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <label for="modal-create" className="btn btn-primary modal-button">
            create
          </label>
          <input type="checkbox" id="modal-create" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <div className="modal-header">
                <div className="modal-title text-2xl font-bold">Create Post</div>
                <label htmlFor="modal-create" className="btn btn-ghost">
                  <i className="fas fa-times"></i>
                </label>
              </div>
              <div className="modal-body space-y-4">
                Duration {""}
                <select className="form-select" value={postDuration} onChange={e => setPostDuration(e.target.value)}>
                  <option value="0">3 Day</option>
                  <option value="1">1 Week</option>
                  <option value="2">2 Weeks</option>
                  <option value="3">1 Month</option>
                </select>
                <br />
                Stake Amount {""}
                <input
                  type="text"
                  className="form-input"
                  placeholder="Stake"
                  value={postStake}
                  onChange={e => setPostStake(e.target.value)}
                />
                <br />
                Filé Type {""}
                <select className="form-select" value={postType} onChange={e => setPostType(e.target.value)}>
                  <option value="0">Text</option>
                  <option value="1">Image</option>
                  <option value="2">Video</option>
                  <option value="3">Audio</option>
                  <option value="4">File</option>
                </select>
                <br />
                Rawdata {""}
                <input
                  type="text"
                  className="form-input"
                  placeholder="Data"
                  value={postRawData}
                  onChange={e => setPostRawData(e.target.value)}
                />
                <br />
                <button
                  className="btn btn-primary w-full"
                  onClick={async () => {
                    let postData = await createPost();
                    console.log(postData);
                  }}
                >
                  Create Post
                </button>
              </div>
              <div className="modal-action space-x-2 mt-4">
                <label htmlFor="modal-create" className="btn btn-primary">
                  Accept
                </label>
                <label htmlFor="modal-create" className="btn">
                  Close
                </label>
              </div>
            </div>
          </div>

          <label for="modal-accept" className="btn btn-primary modal-button">
            accept
          </label>
          <input type="checkbox" id="modal-accept" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <div className="modal-header">
                <div className="modal-title text-2xl font-bold">Accept Post</div>
                <label htmlFor="modal-accept" className="btn btn-ghost">
                  <i className="fas fa-times"></i>
                </label>
              </div>
              <div className="modal-body space-y-4">
                Amount to Pay for Data {""}
                <input
                  type="text"
                  className="form-input"
                  placeholder="Amount"
                  value={postPayment}
                  onChange={e => setPostPayment(e.target.value)}
                />
                <br />
                <button
                  className="btn btn-primary w-full"
                  onClick={async () => {
                    let postData = await acceptPost();
                    console.log(postData);
                  }}
                >
                  Accept Post
                </button>
              </div>
              <div className="modal-action space-x-2 mt-4">
                <label htmlFor="modal-accept" className="btn btn-primary">
                  Accept
                </label>
                <label htmlFor="modal-accept" className="btn">
                  Close
                </label>
              </div>
            </div>
          </div>

          <label for="modal-submit" className="btn btn-primary modal-button">
            submit
          </label>
          <input type="checkbox" id="modal-submit" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <div className="modal-header">
                <div className="modal-title text-2xl font-bold">Accept Post</div>
                <label htmlFor="modal-submit" className="btn btn-ghost">
                  <i className="fas fa-times"></i>
                </label>
              </div>
              <div className="modal-body space-y-4">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Symmetric Key"
                  value={symmetricKey}
                  onChange={e => setSymmetricKey(e.target.value)}
                />
                <br />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Secret Key"
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                />
                <br />
                <button
                  className="btn btn-primary w-full"
                  onClick={async () => {
                    let postData = await submitData();
                    console.log(postData);
                  }}
                >
                  Submit
                </button>
              </div>
              <div className="modal-action space-x-2 mt-4">
                <label htmlFor="modal-submit" className="btn btn-primary">
                  Accept
                </label>
                <label htmlFor="modal-submit" className="btn">
                  Close
                </label>
              </div>
            </div>
          </div>
          <label for="modal-retrieve" className="btn btn-primary modal-button">
            Retrieve
          </label>
          <input type="checkbox" id="modal-retrieve" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <div className="modal-header">
                <div className="modal-title text-2xl font-bold">Accept Post</div>
                <label htmlFor="modal-retrieve" className="btn btn-ghost">
                  <i className="fas fa-times"></i>
                </label>
              </div>
              <div className="modal-body space-y-4">
                <br />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Secret Key"
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                />
                <br />
                <button
                  className="btn btn-primary w-full"
                  onClick={async () => {
                    let postData = await retrievePost();
                    console.log(postData);
                  }}
                >
                  Submit
                </button>
              </div>
              <div className="modal-action space-x-2 mt-4">
                <label htmlFor="modal-retrieve" className="btn">
                  Close
                </label>
              </div>
            </div>
          </div>
          <div className="card w-full">
            <div className="card-body">
              <h2 className="text-xl font-bold">Creator</h2>
              <p>Mecenate ID: {feedData[0][0].toString()}</p>
              <p>Wallet: {feedData[0][1].toString()}</p>
              {/* <p>PubKey: {feedData[0][2].toString()}</p> */}
            </div>
          </div>
          <div className="divider my-4"></div>
          <div className="card w-full">
            <div className="card-body">
              <h2 className="text-xl font-bold">Settings</h2>
              <p>Buyer: {feedData[1][0].buyer.toString()}</p>
              <p>Buyer PubKey: {feedData[1][0].buyerPubKey.toString()}</p>
              <p>Seller: {feedData[1][0].seller.toString()}</p>
              <p>Creation Timestamp: {feedData[1][0].creationTimeStamp.toString()}</p>
              <p>End Timestamp: {feedData[1][0].endTimeStamp.toString()}</p>
              <p>Duration: {feedData[1][0].duration.toString()}</p>
              <p>Post Type: {feedData[1][0].postType.toString()}</p>
              <p>Status: {feedData[1][0].status.toString()}</p>
            </div>
          </div>
          <div className="divider my-4"></div>
          <div className="card w-full">
            <div className="card-body">
              <h2 className="text-xl font-bold">Punishments</h2>
              <p>Buyer Punishment: {feedData[1][1].buyerPunishment.toString()}</p>
              <p>Seller Punishment: {feedData[1][1].punishment.toString()}</p>
              <p>Seller Stake: {feedData[1][1].stake.toString()}</p>
              <p>Buyer Payment: {feedData[1][1].payment.toString()}</p>
            </div>
          </div>
          <div className="divider my-4"></div>
          <div className="card w-full">
            <div className="card-body">
              <h2 className="text-xl font-bold">Data</h2>
              <p>Encrypted Data: {feedData[1][2].encryptedData.toString()}</p>
              <p>Encrypted Key: {feedData[1][2].encryptedKey.toString()}</p>
              <p>Decrypted Data: {feedData[1][2].decryptedData.toString()}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default ViewFeed;
