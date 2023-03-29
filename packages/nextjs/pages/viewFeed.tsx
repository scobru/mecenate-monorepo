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
  const [postPayment, setPostPayment] = useState<any>([]);
  const [symmetricKey, setSymmetricKey] = useState<any>([]);
  const [secretKey, setSecretKey] = useState<any>([]);
  const [valid, setValid] = useState<boolean>();
  const [punishment, setPunishment] = useState<any>(0);
  const [sellerStake, setSellerStake] = useState<any>(0);
  const [buyerStake, setBuyerStake] = useState<any>(0);
  const [buyerPayment, setBuyerPayment] = useState<any>("");
  const [totalStaked, setTotalStaked] = useState<any>(0);
  const [stakeAmount, setStakeAmount] = useState<any>(0);
  const [buyer, setBuyer] = useState<any>("");

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

  const fetchData = async function fetchData() {
    if (feedCtx && signer) {
      const data = await feedCtx?.post();
      const user = await usersCtx?.getUserData(signer?.getAddress());
      const sellerDeposit = await feedCtx?.getStake(data.postdata.settings.seller);
      const buyerDeposit = await feedCtx?.getStake(data.postdata.settings.buyer);
      const totalStaked = await feedCtx?.getTotalStaked();
      setSellerStake(formatEther(sellerDeposit));
      setBuyerStake(formatEther(buyerDeposit));
      setTotalStaked(formatEther(totalStaked));
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

    /* const abicoder = new AbiCoder();
    const proofOfHashEcnode = abicoder.encode(["string"], [dataSaved?.proofhash]); */

    const proofOfHashEncode = await ErasureHelper.multihash({
      input: dataSaved?.proofhash,
      inputType: "b58",
      outputType: "digest",
    });

    const tx = await feedCtx?.createPost(
      proofOfHashEncode,
      Number(postType),
      Number(postDuration),
      parseEther(buyerPayment),
      {
        value: parseEther(postStake),
      },
    );
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
    const proofhash = abiCoder.decode(["bytes32"], feedData[1][2].encryptedData);

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

    const responseDecodeHahJSON = await JSON.parse(JSON.stringify(responseDecodeHash.data));

    const encryptedSymKey = await JSON.parse(JSON.stringify(responseDecodeHahJSON.encryptedSymKey));

    console.log("Encrypted Symmetric Key: ", encryptedSymKey);

    const decrypted = crypto.decrypt(
      encryptedSymKey.ciphertext,
      encryptedSymKey.nonce,
      encryptedSymKey.ephemPubKey,
      secretKey,
    );

    console.log(decrypted);
    console.log(responseDecodeHahJSON.proofhash);

    var _decodeHash = await ErasureHelper.multihash({
      input: responseDecodeHahJSON.proofhash.toString(),
      inputType: "sha2-256",
      outputType: "b58",
    });

    const url = "https://gateway.pinata.cloud/ipfs/" + _decodeHash;

    console.log(url);

    const responseProofHash = await axios.get(url, {
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

  async function revealPost() {
    const symKeyHash = await ErasureHelper.multihash({
      input: JSON.stringify({ symmetricKey: symmetricKey }),
      inputType: "raw",
      outputType: "b58",
    });

    const rawDataHash = await ErasureHelper.multihash({
      input: JSON.stringify({ rawData: postRawData }),
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

    var pin = await pinata.pinJSONToIPFS({ symmetricKey: symmetricKey });

    // Saves the data to IPFS.

    pin = await pinata.pinJSONToIPFS({ rawData: postRawData });

    console.log("Data Saved.");

    const AbiCoder = new ethers.utils.AbiCoder();
    const dataEncoded = AbiCoder.encode(["string", "string"], [symKeyHash, rawDataHash]);

    const tx = await feedCtx?.revealData(dataEncoded);
    await tx.wait();
    await fetchData();

    if (tx.hash) {
      notification.success("Post Revealed");
    }
  }

  async function addStake() {
    console.log("Adding Stake...");
    const tx = await feedCtx?.addStake({ value: parseEther(stakeAmount) });
    await tx.wait();
    await fetchData();
  }

  async function takeStake() {
    console.log("Adding Stake...");
    const tx = await feedCtx?.takeStake(parseEther(stakeAmount));
    await tx.wait();
    await fetchData();
  }

  async function finalizePost() {
    console.log("Finalizing Data...");
    if (valid == true) {
      const tx = await feedCtx?.finalizePost(valid, parseEther("0"));
    } else {
      const tx = await feedCtx?.finalizePost(valid, parseEther(punishment));
    }

    await fetchData();
  }

  useEffect(() => {
    try {
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }, [feedCtx, router.isReady]);

  return (
    <div className="flex-1">
      {feedData[0] != null ? (
        <div className="flex flex-col px-5 py-5">
          <div className="flex flex-row gap-3 items-center justify-center w-full flex-1 px-20 text-center py-5">
            <label htmlFor="modal-create" className="btn modal-button">
              Create
            </label>
            <input type="checkbox" id="modal-create" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box rounded-lg shadow-xl">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Create Post</div>
                  <label htmlFor="modal-create" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body w-auto space-y-6 text-left">
                  <label className="block text-gray-700">Duration</label>
                  <select
                    className="form-select w-full"
                    value={postDuration}
                    onChange={e => setPostDuration(e.target.value)}
                  >
                    <option value="0">3 Days</option>
                    <option value="1">1 Week</option>
                    <option value="2">2 Weeks</option>
                    <option value="3">1 Month</option>
                  </select>
                  <label className="block text-gray-700">Stake</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Amount"
                    value={postStake}
                    onChange={e => setPostStake(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Put 0 to allow buyer decide the payment"
                    value={buyerPayment}
                    onChange={e => setBuyerPayment(e.target.value)}
                  />
                  <label className="block text-gray-700">Type</label>
                  <select className="form-select w-full" value={postType} onChange={e => setPostType(e.target.value)}>
                    <option value="0">Text</option>
                    <option value="1">Image</option>
                    <option value="2">Video</option>
                    <option value="3">Audio</option>
                    <option value="4">File</option>
                  </select>
                  <label className="block text-gray-700">Message</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Data"
                    value={postRawData}
                    onChange={e => setPostRawData(e.target.value)}
                  />

                  <button
                    className="btn btn-primary w-full mt-4"
                    onClick={async () => {
                      let postData = await createPost();
                      console.log(postData);
                    }}
                  >
                    Create Post
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-create" className="btn">
                    Accept
                  </label>
                  <label htmlFor="modal-create" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>

            <label for="modal-accept" className="btn  modal-button">
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
                <div className="modal-body space-y-4 text-left">
                  Amount to Pay for Data {""}
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Amount"
                    value={postPayment}
                    onChange={e => setPostPayment(e.target.value)}
                  />
                  <br />
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      let postData = await acceptPost();
                      console.log(postData);
                    }}
                  >
                    Accept Post
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-accept" className="btn ">
                    Accept
                  </label>
                  <label htmlFor="modal-accept" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>

            <label for="modal-submit" className="btn  modal-button">
              submit
            </label>
            <input type="checkbox" id="modal-submit" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Submit Post</div>
                  <label htmlFor="modal-submit" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Symmetric Key"
                    value={symmetricKey}
                    onChange={e => setSymmetricKey(e.target.value)}
                  />
                  <br />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Secret Key"
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                  />
                  <br />
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      let postData = await submitData();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-submit" className="btn ">
                    Accept
                  </label>
                  <label htmlFor="modal-submit" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>

            <label for="modal-retrieve" className="btn  modal-button">
              Retrieve
            </label>
            <input type="checkbox" id="modal-retrieve" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Retrieve Post</div>
                  <label htmlFor="modal-retrieve" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <br />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Secret Key"
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                  />
                  <br />
                  <button
                    className="btn  w-full"
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

            <label for="modal-finalize" className="btn  modal-button">
              Finalize
            </label>
            <input type="checkbox" id="modal-finalize" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Finalize Post</div>
                  <label htmlFor="modal-finalize" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <br />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Punishment"
                    disabled={valid}
                    value={punishment}
                    onChange={e => setPunishment(e.target.value)}
                  />
                  <br />
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={valid}
                    onChange={e => setValid(e.target.checked)}
                  />
                  <label className="ml-2">Valid</label>
                  <br />

                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      let postData = await finalizePost();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-finalize" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>

            <label for="modal-reveal" className="btn  modal-button">
              Reveal
            </label>
            <input type="checkbox" id="modal-reveal" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Reveal Post</div>
                  <label htmlFor="modal-reveal" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <br />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Symmetric Key"
                    value={symmetricKey}
                    onChange={e => setSymmetricKey(e.target.value)}
                  />
                  <br />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="RawData"
                    value={postRawData}
                    onChange={e => setPostRawData(e.target.value)}
                  />
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      let postData = await revealPost();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-reveal" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>

            {signer?.getAddress() == feedData.postdata.settings.seller ||
              (feedData.postdata.settings.buyer && (
                <div>
                  <label for="modal-stake" className="btn  modal-button">
                    Stake
                  </label>
                  <input type="checkbox" id="modal-stake" className="modal-toggle" />
                  <div className="modal">
                    <div className="modal-box">
                      <div className="modal-header">
                        <div className="modal-title text-2xl font-bold">Stake</div>
                        <label htmlFor="modal-stake" className="btn btn-ghost">
                          <i className="fas fa-times"></i>
                        </label>
                      </div>
                      <div className="modal-body space-y-4 text-left">
                        <br />
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Stake Amount"
                          value={stakeAmount}
                          onChange={e => setStakeAmount(e.target.value)}
                        />
                        <br />
                        <button
                          className="btn  w-full"
                          onClick={async () => {
                            let postData = await addStake();
                            console.log(postData);
                          }}
                        >
                          Add Stake
                        </button>
                        <button
                          className="btn  w-full"
                          onClick={async () => {
                            let postData = await takeStake();
                            console.log(postData);
                          }}
                        >
                          Take Stake
                        </button>
                      </div>
                      <div className="modal-action space-x-2 mt-4">
                        <label htmlFor="modal-stake" className="btn">
                          Close
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="divider" />
          <div className="flex flex-col  p-5 w-full items-left justify-center">
            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-xl font-bold">Creator Information</h2>
                <div className="mt-5">
                  <p className="text-lg">
                    <span className="font-bold">Post Status:</span>{" "}
                    {feedData.postdata.settings.status === 4
                      ? "Finalized"
                      : feedData.postdata.settings.status === 3
                      ? "Submitted"
                      : feedData.postdata.settings.status === 2
                      ? "Accepted"
                      : feedData.postdata.settings.status === 1
                      ? "Proposed"
                      : "Waiting for Creator"}
                  </p>
                  <div className="w-1/2">
                    <p className="text-lg">
                      <span className="font-bold">Seller Stake:</span> {sellerStake} ETH
                    </p>
                  </div>
                  <div className="w-1/2">
                    <p className="text-lg">
                      <span className="font-bold">Buyer Stake:</span> {buyerStake} ETH
                    </p>
                  </div>
                  <p className="text-lg">
                    <span className="font-bold">Mecenate ID:</span> {feedData[0][0].toString()}
                  </p>
                  <p className="text-lg">
                    <span className="font-bold">Wallet:</span> {feedData[0][1].toString()}
                  </p>
                  {/* <p className="text-lg">
        <span className="font-bold">Public Key:</span>{" "}
        {feedData[0][2].toString()}
      </p> */}
                </div>
              </div>
            </div>
            <div className="divider" />

            <div className="card w-full md:w-fit">
              <div className="card-body">
                <h2 className="text-xl font-bold">Post Settings</h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Buyer:</span> {feedData[1][0].buyer.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Buyer Public Key:</span>{" "}
                    <span className="break-all">{feedData[1][0].buyerPubKey.toString()}</span>
                  </p>
                  <p>
                    <span className="font-bold">Seller:</span> {feedData[1][0].seller.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Creation Timestamp:</span> {feedData[1][0].creationTimeStamp.toString()}
                  </p>
                  <p>
                    <span className="font-bold">End Timestamp:</span> {feedData[1][0].endTimeStamp.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Duration:</span> {feedData[1][0].duration.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Post Type:</span> {feedData[1][0].postType.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Status:</span> {feedData[1][0].status.toString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="divider" />

            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-xl font-bold">Punishments</h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Buyer Punishment:</span> {feedData[1][1].buyerPunishment.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Seller Punishment:</span> {feedData[1][1].punishment.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Seller Stake:</span> {feedData[1][1].stake.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Buyer Payment:</span> {feedData[1][1].payment.toString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="divider" />

            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-xl font-bold">Data</h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Encrypted Data:</span>{" "}
                    <span className="break-all">{feedData[1][2].encryptedData.toString()}</span>
                  </p>
                  <p>
                    <span className="font-bold">Encrypted Key:</span> {feedData[1][2].encryptedKey.toString()}
                  </p>
                  <p>
                    <span className="font-bold">Decrypted Data:</span>
                    <span className="break-all"> {feedData[1][2].decryptedData.toString()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default ViewFeed;
