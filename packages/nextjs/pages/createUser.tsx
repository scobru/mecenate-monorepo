import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
import { formatEther } from "ethers/lib/utils.js";
import { utils } from "ethers";
const bs58 = require("bs58");
const ErasureClient = require("@erasure/crypto-ipfs");

/* configure Infura auth settings */
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const projectGateway = process.env.IPFS_GATEWAY;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const DEBUG = true;

const CreateFeed: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "Feed_Factory");
  const deployedContractFeed = getDeployedContract(chain?.id.toString(), "Feed");
  const deployedContractPosts = getDeployedContract(chain?.id.toString(), "Erasure_Posts");

  const [operator, setOperator] = React.useState("");
  const [creator, setCreator] = React.useState("");
  const [metadata, setMetadata] = React.useState("");
  const [messageProof, setMessageProof] = React.useState("");
  const [updateHash, setUpdateHash] = React.useState("");
  const [transactionSubmitted, setTransactionSubmitted] = React.useState("");
  const [feeds, setFeeds] = React.useState([]);
  const [feedData, setFeedData] = React.useState([
    {
      factoryID: 0,
      creator: "",
      operator: "",
      instance: "",
      extradata: "",
    },
  ]);

  /* Create an instance of the client */
  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  let factoryAddress!: string;
  let factoryAbi: ContractInterface[] = [];

  let postsAddress!: string;
  let postsAbi: ContractInterface[] = [];

  let feedAddress!: string;
  let feedsAbi: ContractInterface = [];

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractPosts) {
    ({ address: postsAddress, abi: postsAbi } = deployedContractPosts);
  }

  if (deployedContractFeed) {
    ({ address: feedAddress, abi: feedsAbi } = deployedContractFeed);
  }

  const factory = useContract({
    address: factoryAddress,
    abi: factoryAbi,
    signerOrProvider: signer || provider,
  });

  const posts = useContract({
    address: postsAddress,
    abi: postsAbi,
    signerOrProvider: signer || provider,
  });

  const feed = useContract({
    address: "",
    abi: feedsAbi,
    signerOrProvider: signer || provider,
  });

  async function getFeeds() {
    const _feeds = await posts?.getInstances();
    setFeeds(_feeds);

    const len = _feeds.length;
    const _feedData = [
      {
        factoryID: 0,
        creator: "",
        operator: "",
        instance: "",
        extradata: "",
      },
    ];

    for (let i = 0; i < len; i++) {
      const feed = await posts?.getInstanceData(i);
      const feedInstance = new Contract(feed.instanceAddress, feedsAbi, signer || provider);
      const _operator = await feedInstance?.getOperator();
      const _creator = await feedInstance?.getCreator();
      _feedData.push({
        factoryID: feed.factoryID,
        creator: _operator,
        operator: _creator,
        instance: feed.instanceAddress,
        extradata: String(Number(feed.extraData)),
      });
      setFeedData(_feedData);
    }
  }

  async function getOperatorAndCreator() {
    const _operator = await signer?.getAddress();
    const _creator = await signer?.getAddress();
    setOperator(String(_operator));
    setCreator(String(_creator));
  }

  function createSelector(functionName: string, abiTypes: string[]): string {
    const joinedTypes = abiTypes.join(",");
    const functionSignature = `${functionName}(${joinedTypes})`;
    const selector = utils.hexDataSlice(utils.keccak256(utils.toUtf8Bytes(functionSignature)), 0, 4);
    return selector;
  }

  function abiEncodeWithSelector(
    functionName: string,
    abiTypes: readonly (string | utils.ParamType)[],
    abiValues: readonly ContractInterface[],
  ) {
    const abiEncoder = new ethers.utils.AbiCoder();
    const initData = abiEncoder.encode(abiTypes, abiValues);
    const selector = createSelector(functionName, abiTypes);
    const encoded = selector + initData.slice(2);
    return encoded;
  }

  async function deployFeed() {
    const trUpdate = Date.now() + Math.random().toString();

    setUpdateHash(trUpdate);

    // Create feed
    createFeed(trUpdate);
  }

  async function createKeyPair() {
    // get signature from metamask
    const sig = await signer?.signMessage("this is a message to sign");
    const salt =
      "this is a salt, which could be generated server side and stored on user table. only authenticated users should be able to GET their own salt from the server and nobody else's.";

    const keypair = await ErasureClient.crypto.asymmetric.generateKeyPair(sig, salt);
    console.log(keypair);
    const encryptedData = await ErasureClient.crypto.asymmetric.encryptMessage(messageProof, keypair.secretkey);
    const keyhash = ErasureClient.multihash(keypair, "sha256");
    const datahash = ErasureClient.multihash(messageProof, "sha256");
    const encryptedDatahash = ErasureClient.multihash(encryptedData, "sha256");
    // create json

    const json = {
      creator: creator,
      datahash: ErasureClient.multihashformat(datahash),
      keyhash: ErasureClient.multihashformat(keyhash),
      encryptedDatahash: ErasureClient.multihashformat(encryptedDatahash),
    };

    const json_proofhash_v120 = JSON.stringify(json);
    const proofhash = ErasureClient.multihash(json_proofhash_v120, "sha256");
    console.log(keypair);
  }

  async function createFeed(updateHash: string) {
    // Getting data from feedCreate Data
    await createKeyPair();
    return;
    const content = Buffer.from(messageProof);
    // generates symmetric encryption key
    const SymKey = CryptoJS.lib.WordArray.random(16);
    console.log("SymKey", SymKey);
    console.log("messageProof", messageProof);
    // encrypts the message
    // Convert to base64
    const encryptedData = CryptoJS.AES.encrypt(messageProof, SymKey).toString();
    const keyhash = CryptoJS.SHA256(SymKey).toString();
    const datahash = CryptoJS.SHA256(messageProof).toString();
    const encryptedDatahash = CryptoJS.SHA256(encryptedData).toString();
    const address_seller = creator;

    const multibase = require("Multibase");

    const multibaseformat = (hash: string) => {
      const bytes = Buffer.from(hash, "hex");
      return multibase.encode("base64urlpad", bytes).toString();
    };

    // Compute the json_proofhash_v120 value
    const json_proofhash_v120 = JSON.stringify({
      address_seller,
      datahash: multibaseformat(datahash),
      keyhash: multibaseformat(keyhash),
      encryptedDatahash: multibaseformat(encryptedDatahash),
    });

    const proofhash = CryptoJS.SHA256(json_proofhash_v120).toString();

    // Upload json_proofhash_v120 to IPFS
    const jsonProofHashV120Buffer = Buffer.from(json_proofhash_v120, "utf-8");
    const jsonProofHashV120CID = await client.add(jsonProofHashV120Buffer);

    // Upload encryptedData to IPFS
    const encryptedDataBuffer = Buffer.from(encryptedData, "utf-8");
    const encryptedDataCID = await client.add(encryptedDataBuffer);

    /* const hash = results.path; // "Qm...WW"
    const proofHash = "0x" + bs58.decode(hash).slice(2).toString("hex"); */

    console.log(proofhash);

    // proofHash:
    //
    //'0x2a1acd26847576a128e3dba3aa984feafffdf81f7c7b23bdf51e7bec1c15944c',
    //'0x12204f75fdc1bbaa5de8df38d55133046d84b7e95c27c70790c3ad4033a207309ee5'
    // // Get feed instance for Rinkeby deployed contract
    // Generate CallData for initalize function

    const callData = abiEncodeWithSelector(
      "initialize",
      ["address", "bytes32", "bytes"],
      [operator, proofhash, "0x00"],
    );

    // Execute contract call and set up events handlers
    const tx = await factory?.create(callData);
    if (tx) {
      setTransactionSubmitted(tx.hash);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        notification.success("Feed created");
      } else {
        notification.success("Feed creation failed");
      }
    }
  }

  useEffect(() => {
    if (factory && signer) {
      getOperatorAndCreator();
      getFeeds();
      console.log("Factory address: ", factory?.address, "Operator address: ", operator, "Creator address: ", creator);
    }
  }, [factory, signer]);
  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
      <div className="flex flex-col items-center justify-center w-full h-full my-5">
        <input
          className="w-1/2 p-2 border rounded-md shadow-sm"
          type="text"
          placeholder="Creator"
          value={creator}
          disabled={true}
        />
        <input
          className="w-1/2 p-2 border rounded-md shadow-sm"
          type="text"
          placeholder="Operator"
          value={operator}
          disabled={true}
        />
        <input
          className="w-1/2 p-2 border rounded-md shadow-sm"
          type="text"
          placeholder="Metadata"
          onChange={e => {
            e.preventDefault();
            setMetadata(e.target.value);
          }}
        />
        <input
          className="w-1/2 p-2 border rounded-md shadow-sm"
          type="text"
          placeholder="Message for proof"
          onChange={e => {
            e.preventDefault();
            setMessageProof(e.target.value);
          }}
        />
        <button
          className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700"
          onClick={() => {
            deployFeed();
          }}
        >
          Deploy Feed
        </button>
      </div>
      <div className="flex flex-col justify-center w-2/4  mx-auto h-full my-5">
        <h1 className="text-2xl font-bold mb-4">Feeds</h1>
        <ul className="divide-y divide-gray-300">
          {feedData?.map((feed, index) => (
            <li key={index} className="py-4">
              <p className="text-lg font-semibold">Factory ID: {feed.factoryID}</p>
              <p className="text-lg font-semibold">Creator: {feed.creator}</p>
              <p className="text-lg font-semibold">Operator: {feed.operator}</p>
              <p className="text-lg font-semibold">
                Instance:{" "}
                <a href={`/viewPost?addr=${feed.instance}`} className="text-indigo-600 hover:text-indigo-900">
                  {feed.instance}
                </a>
              </p>
              <p className="text-lg font-semibold">Extra Data: {feed.extradata}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateFeed;
