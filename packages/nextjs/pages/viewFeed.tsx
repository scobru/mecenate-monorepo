import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";
import { AbiCoder, base64, formatEther, parseEther } from "ethers/lib/utils";
import pinataSDK from "@pinata/sdk";
import axios from "axios";
import dotenv from "dotenv";
import Dropzone from "react-dropzone";
import { create } from "ipfs-http-client";
import { saveAs } from "file-saver";

const crypto = require("asymmetric-crypto");

dotenv.config();

const ErasureHelper = require("@erasure/crypto-ipfs");

const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinataApiKey = process.env.PINATA_API_KEY;
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const projectGateway = process.env.IPFS_GATEWAY;

const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const IPFS_HOST = "ipfs.infura.io";
const IPFS_PORT = 5001;

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const ViewFeed: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
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
  const [imageFile, setImageFile] = React.useState<any>("");
  const [image, setImage] = React.useState("");
  const [postCount, setPostCount] = useState<any>("");

  const user = "";
  const owner = "";

  const [feedData, setFeedData] = useState<any>([]);
  const deployedContractFeed = getDeployedContract(chain?.id.toString(), "MecenateFeed");

  const [userData, setUserData] = useState<any>([]);
  const deployedContractUsers = getDeployedContract(chain?.id.toString(), "MecenateUsers");

  let feedAddress!: string;
  let feedAbi: ContractInterface[] = [];

  let usersAddress!: string;
  let usersAbi: ContractInterface[] = [];

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

  async function decodeData() {
    if (feedData[1][2].decryptedData != "0x30783030") {
      const abiCoder = new AbiCoder();

      const decryptedData = abiCoder.decode(["string", "string"], feedData[1][2].decryptedData);

      const encryptedData = await ErasureHelper.multihash({
        input: feedData[1][2].encryptedData,
        inputType: "sha2-256",
        outputType: "b58",
      });

      const encryptedKey = await ErasureHelper.multihash({
        input: feedData[1][2].encryptedKey,
        inputType: "sha2-256",
        outputType: "b58",
      });

      notification.success(
        <div>
          {" "}
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${decryptedData[0]}`} target="_blank">
              <p>Decrypted Data[0]: {decryptedData[0]}</p>
            </a>
          </p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${decryptedData[1]}`} target="_blank">
              <p>Decrypted Data[1]: {decryptedData[1]}</p>
            </a>
          </p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${encryptedData}`} target="_blank">
              <p>Encrypted Data: {encryptedData}</p>
            </a>
          </p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${encryptedKey}`} target="_blank">
              <p>Encrypted Key: {encryptedKey}</p>
            </a>
          </p>{" "}
        </div>,
      );
    } else {
      const encryptedData = await ErasureHelper.multihash({
        input: feedData[1][2].encryptedData,
        inputType: "sha2-256",
        outputType: "b58",
      });

      notification.info(
        <div>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${encryptedData}`} target="_blank">
              <p>Encrypted Data: {encryptedData}</p>
            </a>
          </p>
        </div>,
      );
    }
  }

  async function renounce() {
    const tx = await feedCtx?.renouncePost();
    await tx?.wait();
    notification.success("Refund successful");
  }



  const uploadImageToIpfs = async (file: Blob | any) => {
    try {
      if (!file) {
        throw new Error("No file specified");
      }
      console.log(file);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // zip file
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setPostRawData(reader.result);
        };
        reader.onerror = event => {
          reject(event);
        };
        notification.success("File uploaded to IPFS");
        setImage(String(reader.result));
      });
    } catch (error) {
      notification.error('Error uploading file: "${error}');
    }
  };

  const uploadJsonToIpfs = async (imageFile: any) => {
    try {
      await uploadImageToIpfs(imageFile);
    } catch (error) {
      notification.error('Error uploading file: "${error}');
    }
  };

  const handleImageDrop = (acceptedFiles: React.SetStateAction<any>[]) => {
    setImageFile(acceptedFiles[0]);
    uploadJsonToIpfs(acceptedFiles[0]);
  };

  const fetchData = async function fetchData() {
    if (feedCtx && signer) {
      const data = await feedCtx?.post();
      const user = await usersCtx?.getUserData(signer?.getAddress());
      const sellerDeposit = await feedCtx?.getStake(data.postdata.settings.seller);
      const buyerDeposit = await feedCtx?.getStake(data.postdata.settings.buyer);
      const totalStaked = await feedCtx?.getTotalStaked();
      setSellerStake(String(sellerDeposit));
      setBuyerStake(formatEther(buyerDeposit));
      setTotalStaked(formatEther(totalStaked));
      setUserData(user);
      setFeedData(data);
      setPostCount(await feedCtx?.postCount());
      console.log(data);
      console.log(user);
    }
  };

  const createPost = async function createPost() {
    await fetchData();
    const pubKey = userData.publicKey;
    const dataSaved = await savePost(postRawData, String(signer?.getAddress()), pubKey);

    notification.warning(
      <div
        id="alert-additional-content-3"
        className="p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
        role="alert"
      >
        <div className="flex items-center">
          <svg
            aria-hidden="true"
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Info</span>
          <h3 className="text-lg font-medium">Save Symmetic Key!</h3>
        </div>
        {/*  <div className="mt-2 mb-4 text-sm">
          <div>
            <p>
              RESULT : <br /> {JSON.stringify(dataSaved)}
            </p>
          </div>
        </div> */}
        <div className="flex">
          <button
            type="button"
            className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={async () => {
              navigator.clipboard.writeText(JSON.stringify(dataSaved?.symmetricKey));
              notification.success("Symmetric key copied to clipboard");
            }}
          >
            <svg
              aria-hidden="true"
              className="-ml-0.5 mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Copy to clipboard
          </button>
        </div>
      </div>,
    );

    notification.warning("Save this data");

    //saveAs(JSON.stringify(dataSaved), String(postCount) + feedCtx?.address + "_sellData.json");

    downloadFile({
      data: JSON.stringify(dataSaved),
      fileName: String(postCount) + "_" + feedCtx?.address + "_sellData.json",
      fileType: "text/json",
    });

    const proofOfHashEncode = await ErasureHelper.multihash({
      input: dataSaved?.proofhash,
      inputType: "b58",
      outputType: "digest",
    });

    const tx = await feedCtx?.createPost(
      proofOfHashEncode,
      Number(postType),
      Number(postDuration),
      buyer,
      parseEther(buyerPayment),

      {
        value: parseEther(postStake),
      },
    );
  };

  async function acceptPost() {
    const tx = await feedCtx?.acceptPost(userData.publicKey, signer?.getAddress(), { value: parseEther(postPayment) });
  }

  async function createPostData(RawData: any, seller: string, sellerPubKey: string) {
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
    const pinataAuth = await pinata.testAuthentication();
    if (pinataAuth.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    // Creates post data - See createPostData function for more info on data format.
    const postData = await createPostData(RawData, seller, sellerPubKey);

    console.log("Saving encrypted data...");
    notification.success("Saving encrypted data...");
    // Saves the encrypted data to IPFS.

    let pin: any = await pinata
      .pinJSONToIPFS({
        encryptedData: postData?.encryptedData,
      })
      .catch(err => {
        console.log(err);
      });

    // Check that JSON proof does have the correct info.
    if (pin?.IpfsHash !== postData?.proofJson.encryptedDatahash) {
      console.log("Error with Encrypted Data Hash.");
      notification.error("Error with Encrypted Data Hash.");
      console.log(pin?.IpfsHash);
      console.log(postData?.proofJson.encryptedDatahash);
      return;
    }

    console.log("Saving proof JSON...");
    notification.success("Saving proof JSON...");
    // Saves the proof JSON to IPFS.
    pin = await pinata.pinJSONToIPFS(postData?.proofJson);
    // Check that JSON proof does have the correct info.
    if (pin.IpfsHash !== postData?.proofhash) {
      console.log("Error with proof Hash.");
      notification.error("Error with proof Hash.");
      console.log(pin.IpfsHash);
      console.log(postData?.proofhash);
      return;
    }
    console.log("Data Saved.");
    notification.success("Data Saved.");
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

    const pinataAuth = await pinata.testAuthentication();

    if (pinataAuth.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    console.log("Saving proof JSON...");
    notification.success("Saving proof JSON...");

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
    notification.success("Data Saved.");

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

    await fetchData();

    return {
      proofJson: json_selldata_v120,
      proofHash58: proofHash58,
      proofHash58Decode: proofHash58Digest,
    };
  }

  const downloadFile = ({ data, fileName, fileType }: { data: BlobPart; fileName: string; fileType: string }): void => {
    if (!data || !fileName || !fileType) {
      throw new Error("Invalid inputs");
    }

    const blob = new Blob([data], { type: fileType });
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);

    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    a.dispatchEvent(clickEvt);
    a.remove();
  };

  async function retrievePost() {
    console.log("Retrieving Data...");
    await fetchData();

    const decodeHash = await ErasureHelper.multihash({
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

    const _decodeHash = await ErasureHelper.multihash({
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

    const decryptFile = ErasureHelper.crypto.symmetric.decryptMessage(
      decrypted,
      response_Encrypteddatahash_JSON.encryptedData,
    );

    if (decryptFile) {
      // wait 10 seconds
      console.log("Decrypted Data: ", decryptFile);

      const dataHash = await ErasureHelper.multihash({
        input: decryptFile,
        inputType: "raw",
        outputType: "hex",
      });

      const hashCheck = responseProofHashJSON.datahash === dataHash;

      if (feedData[1][0].postType == 1 || 2 || 3 || 4) {
        const mimeType: any = base64Mime(decryptFile);

        // Repair malformed base64 data
        const file = convertBase64ToFile(
          decryptFile,
          String(postCount) + feedCtx?.address + "_decryptedData" + "." + mimeType?.split("/")[1],
        );

        saveAs(file, String(postCount) + feedCtx?.address + "_decryptedData" + "." + mimeType?.split("/")[1]);
      }

      await fetchData();

      return {
        rawData: decrypted,
        hashCheck: hashCheck,
      };
    } else {
      console.log("Error decrypting message.");
      return null;
    }
  }

  const convertBase64ToFile = (base64String: string, fileName: string) => {
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
  };

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
    <div className="flex flex-col items-center pt-2 p-2 m-2">
      {feedData[0] != null ? (
        <div className="flex flex-col py-5 justify-center  items-center">
          <div className="flex flex-wrap text-left  ">
            <div tabIndex={0} className="collapse">
              <div className="collapse-title text-xl font-medium hover:bg-primary">Seller</div>
              <div className="collapse-content">
                <label htmlFor="modal-create" className="btn modal-button mx-2 my-2">
                  Create (S)
                </label>
                <input type="checkbox" id="modal-create" className="modal-toggle " />
                <div className="modal">
                  <div className="modal-box rounded-lg shadow-xl">
                    <div className="modal-header">
                      <div className="modal-title text-2xl font-bold">Create Post</div>
                      <label htmlFor="modal-create" className="btn btn-ghost">
                        <i className="fas fa-times"></i>
                      </label>
                    </div>
                    <div className="modal-body w-auto space-y-6 text-left">
                      <label className="block text-base-500">Duration</label>
                      <select
                        className="form-select w-full mb-8"
                        value={postDuration}
                        onChange={e => setPostDuration(e.target.value)}
                      >
                        <option value="0">3 Days</option>
                        <option value="1">1 Week</option>
                        <option value="2">2 Weeks</option>
                        <option value="3">1 Month</option>
                      </select>
                      <label className="block text-base-500 mt-8">Stake</label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="Amount"
                        value={postStake}
                        onChange={e => setPostStake(e.target.value)}
                      />
                      <label className="block text-base-500 mt-8">Buyer Payment </label>

                      <input
                        type="text"
                        className="input w-full"
                        placeholder="Put 0 to allow buyer decide the payment"
                        value={buyerPayment}
                        onChange={e => setBuyerPayment(e.target.value)}
                      />
                      <label className="block text-base-500">Buyer Addreess </label>

                      <input
                        type="text"
                        className="input w-full"
                        placeholder="Put address 0 to make this public to anyone who wants to buy"
                        value={buyer}
                        onChange={e => setBuyer(e.target.value)}
                      />
                      <label className="block text-base-500">Type</label>
                      <select
                        className="form-select w-full"
                        value={postType}
                        onChange={e => setPostType(e.target.value)}
                      >
                        <option value="0">Text</option>
                        <option value="1">Image</option>
                        <option value="2">Video</option>
                        <option value="3">Audio</option>
                        <option value="4">File</option>
                      </select>
                      {postType == 0 ? (
                        <div>
                          <label className="block text-base-500">Message</label>
                          <input
                            type="text"
                            className="input w-full"
                            placeholder="Data"
                            value={postRawData}
                            onChange={e => setPostRawData(e.target.value)}
                          />
                        </div>
                      ) : postType == 1 || 2 || 3 || 4 ? (
                        <div>
                          <Dropzone onDrop={handleImageDrop}>
                            {({ getRootProps, getInputProps }) => (
                              <div
                                {...getRootProps()}
                                className="flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer"
                              >
                                <input {...getInputProps()} />
                                {imageFile ? (
                                  <p>{imageFile?.name}</p>
                                ) : (
                                  <p>Drag &apos;n&apos; drop an image here, or click to select a file</p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                        </div>
                      ) : null}
                      <button
                        className="btn btn-primary w-full mt-4"
                        onClick={async () => {
                          const postData = await createPost();
                          console.log(postData);
                        }}
                      >
                        Create Post
                      </button>
                    </div>
                    <div className="modal-action space-x-2 mt-4">
                      <label htmlFor="modal-create" className="btn">
                        Close
                      </label>
                    </div>
                  </div>
                </div>
                <label htmlFor="modal-submit" className="btn  modal-button mx-2 my-2">
                  Submit (S)
                </label>
                <input type="checkbox" id="modal-submit" className="modal-toggle " />
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
                        type="password"
                        className="input w-full"
                        placeholder="Symmetric Key"
                        value={symmetricKey}
                        onChange={e => setSymmetricKey(e.target.value)}
                      />
                      <br />
                      <input
                        type="password"
                        className="input w-full"
                        placeholder="Secret Key"
                        value={secretKey}
                        onChange={e => setSecretKey(e.target.value)}
                      />
                      <br />
                      <button
                        className="btn  w-full"
                        onClick={async () => {
                          const postData = await submitData();
                          console.log(postData);
                        }}
                      >
                        Submit
                      </button>
                    </div>
                    <div className="modal-action space-x-2 mt-4">
                      <label htmlFor="modal-submit" className="btn">
                        Close
                      </label>
                    </div>
                  </div>
                </div>
                <label htmlFor="modal-reveal" className="btn  modal-button mx-2 my-2">
                  Reveal (S)
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
                        type="password"
                        className="input w-full"
                        placeholder="Symmetric Key"
                        value={symmetricKey}
                        onChange={e => setSymmetricKey(e.target.value)}
                      />
                      <br />
                      <label className="block text-base-500">Type</label>
                      <select
                        className="form-select w-full"
                        value={postType}
                        onChange={e => setPostType(e.target.value)}
                      >
                        <option value="0">Text</option>
                        <option value="1">Image</option>
                        <option value="2">Video</option>
                        <option value="3">Audio</option>
                        <option value="4">File</option>
                      </select>
                      {postType == 0 ? (
                        <div>
                          <label className="block text-base-500">Message</label>
                          <input
                            type="text"
                            className="input w-full"
                            placeholder="Data"
                            value={postRawData}
                            onChange={e => setPostRawData(e.target.value)}
                          />
                        </div>
                      ) : postType == 1 || 2 || 3 || 4 ? (
                        <div>
                          <Dropzone onDrop={handleImageDrop}>
                            {({ getRootProps, getInputProps }) => (
                              <div
                                {...getRootProps()}
                                className="flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer"
                              >
                                <input {...getInputProps()} />
                                {imageFile ? (
                                  <p>{imageFile?.name}</p>
                                ) : (
                                  <p>Drag &apos;n&apos; drop an image here, or click to select a file</p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                        </div>
                      ) : null}
                      <button
                        className="btn  w-full"
                        onClick={async () => {
                          const postData = await revealPost();
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
                <label className="btn  modal-button mx-2 my-2" onClick={async () => {
                  await renounce();
                }}>
                  Renounce (S)
                </label>
              </div>
            </div>
            <div tabIndex={0} className="collapse">
              <div className="collapse-title text-xl font-medium hover:bg-primary">Buyer</div>
              <div className="collapse-content">
                <label htmlFor="modal-accept" className="btn  modal-button   mx-2 my-2">
                  Accept (B)
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
                        className="input w-full mt-8"
                        placeholder="Amount"
                        value={postPayment}
                        onChange={e => setPostPayment(e.target.value)}
                      />
                      <br />
                      <button
                        className="btn  w-full"
                        onClick={async () => {
                          const postData = await acceptPost();
                          console.log(postData);
                        }}
                      >
                        Accept Post
                      </button>
                    </div>
                    <div className="modal-action space-x-2 mt-4">
                      <label htmlFor="modal-accept" className="btn">
                        Close
                      </label>
                    </div>
                  </div>
                </div>

                <label htmlFor="modal-retrieve" className="btn    modal-button mx-2 my-2">
                  Retrieve (B)
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
                        type="password"
                        className="input w-full"
                        placeholder="Secret Key"
                        value={secretKey}
                        onChange={e => setSecretKey(e.target.value)}
                      />
                      <br />
                      <button
                        className="btn  w-full"
                        onClick={async () => {
                          const postData = await retrievePost();
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
                <label htmlFor="modal-finalize" className="btn   modal-button mx-2 my-2">
                  Finalize (B)
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
                          const postData = await finalizePost();
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
              </div>
            </div>

            {signer?.getAddress() == feedData.postdata.settings.seller ||
              (feedData.postdata.settings.buyer && (
                <div className="fleẋ flex-row">
                  <label htmlFor="modal-stake" className="btn   modal-button  mx-2 my-2">
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
                            const postData = await addStake();
                            console.log(postData);
                          }}
                        >
                          Add Stake
                        </button>
                        <button
                          className="btn  w-full"
                          onClick={async () => {
                            const postData = await takeStake();
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

            <button
              className="btn   modal-button  mx-2 my-2"
              onClick={() => {
                decodeData();
              }}
            >
              Decode
            </button>
          </div>

          <div className="flex flex-col  p-2 min-w-fit items-left justify-center">
            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-xl font-bold">Creator Information</h2>
                <div className="mt-5">
                  <p className="text-lg">
                    <span className="font-bold">Post Status:</span>{" "}
                    {feedData.postdata.settings.status === 6
                      ? "Revealed"
                      : feedData.postdata.settings.status === 5
                        ? "Punished"
                        : feedData.postdata.settings.status === 4
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
                      <span className="font-bold">Seller Stake:</span> {sellerStake / 1e18} ETH
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
                    <span className="font-bold">Encrypted Key:</span>{" "}
                    <span className="break-all"> {feedData[1][2].encryptedKey.toString()}</span>
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

function base64Mime(encoded: string) {
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

export default ViewFeed;
