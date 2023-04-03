import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateSubscriptionFactoryInterface } from "../../hardhat/typechain-types/contracts/MecenateSubscriptionFactory";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import Dropzone from "react-dropzone";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
import { formatEther } from "ethers/lib/utils.js";
import Image from "next/image";
import { utils } from "ethers";
import CopyToClipboard from "react-copy-to-clipboard";

const crypto = require("asymmetric-crypto");
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const projectGateway = process.env.IPFS_GATEWAY;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const DEBUG = true;

type nftMetadata = {
  name: string;
  image: string;
  description: string;
  owner: string;
};

type ImageProps = {
  cid: string;
};

const Identity: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();

  const [fee, setFee] = React.useState(0);
  const [identityFee, setIdentityFee] = React.useState(0);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null);
  const [image, setImage] = React.useState("");
  const [nftBalance, setNftBalance] = React.useState(0);
  const [nftMetadata, setNftMetadata] = React.useState<nftMetadata[]>([]);
  const [pubKey, setPubKey] = React.useState<string>("");

  const [subscriptions, setSubscriptions] = React.useState<Array<string>>([]);
  const [subscriptionName, setSubscriptionName] = React.useState("");
  const [subscriptionDescription, setSubscriptionDescription] = React.useState("");
  const [subscriptionFee, setSubscriptionFee] = React.useState(0);
  const [subscriptionDuration, setSubscriptionDuration] = React.useState(0);

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateTierFactory");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractUser = getDeployedContract(chain?.id.toString(), "MecenateUsers");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");

  const IPFS_HOST = "ipfs.infura.io";
  const IPFS_PORT = 5001;

  /* Create an instance of the client */
  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  let UsersAddress!: string;
  let UsersAbi: ContractInterface[] = [];

  type UserData = {
    mecenateID: Number;
    wallet: String;
    publicKey: String;
  };

  let factoryAddress!: string;
  let factoryAbi: MecenateSubscriptionFactoryInterface[] = [];

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  let treasuryAddress!: string;
  let treasuryAbi: ContractInterface[] = [];

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractUser) {
    ({ address: UsersAddress, abi: UsersAbi } = deployedContractUser);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  const usersCtx = useContract({
    address: UsersAddress,
    abi: UsersAbi,
    signerOrProvider: signer || provider,
  });

  const factory = useContract({
    address: factoryAddress,
    abi: factoryAbi,
    signerOrProvider: signer || provider,
  });

  const identity = useContract({
    address: identityAddress,
    abi: identityAbi,
    signerOrProvider: signer || provider,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  const uploadImageToIpfs = async (file: Blob | null) => {
    try {
      if (!file) {
        throw new Error("No file specified");
      }

      const added = await client.add({ content: file });
      const cid = added.cid.toString();

      DEBUG && console.log("added", added);
      DEBUG && console.log("cid", cid);
      DEBUG && console.log("path", added.path);

      const url = `https://scobru.infura-ipfs.io/ipfs/${added.cid}`;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          resolve(url);
        };
        reader.onerror = event => {
          reject(event.error);
        };
        console.log(url);
        notification.info(String(url));
        notification.success("Image uploaded to IPFS");
        setImage(url);
      });
    } catch (error) {
      notification.error(error.message);
    }
  };

  const fetchNFTBalance = async () => {
    try {
      const address = await signer?.getAddress();
      const balance = await identity?.balanceOf(address);
      const id = await identity?.identityByAddress(address);
      const metadata = await identity?.tokenURI(Number(id));
      const response = await fetch(metadata);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      DEBUG && console.log("id", Number(id));
      DEBUG && console.log("balance", balance);
      DEBUG && console.log("metadata", metadata);
      DEBUG && console.log("data", data);
      setNftMetadata(data);
      setNftBalance(balance);
    } catch (error) {
      console.error(error);
      // handle error
    }
  };

  const uploadJsonToIpfs = async (identityData: { name: any; description: any }, imageFile: null) => {
    try {
      await uploadImageToIpfs(imageFile);
    } catch (error) {
      notification.error(error.message);
    }
  };

  const convertBase64ToFile = (base64String: string, fileName: string) => {
    let arr = base64String.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let uint8Array = new Uint8Array(n);
    while (n--) {
      uint8Array[n] = bstr.charCodeAt(n);
    }
    let file = new File([uint8Array], fileName, { type: mime });
    return file;
  };

  const createIdentity = async (identityData: { name: any; description: any }, imageFile: null) => {
    const creator = await signer?.getAddress();
    const nftMetadataWrite = {
      name: identityData.name,
      image: image,
      description: identityData.description,
      owner: creator,
    };
    DEBUG && console.log(nftMetadataWrite);

    const tx = await identity?.mint(nftMetadataWrite, {
      value: identityFee,
    });
    if (tx?.hash) {
      notification.success("Identity minted successfully!");
    }
    fetchNFTBalance();
  };

  async function createPair() {
    console.log("Generating Key Pair...");
    const kp = crypto.keyPair();
    const keypairJSON = JSON.stringify({
      publicKey: kp.publicKey,
      secretKey: kp.secretKey,
    });
    console.log(keypairJSON);
    setPubKey(kp.publicKey.toString());
    notification.success("Key pair created");
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
          <h3 className="text-lg font-medium">Save Your Key Pair!</h3>
        </div>
        <div className="mt-2 mb-4 text-sm">
          <div>
            <p>
              PUBLIC KEY : <br /> {kp.publicKey.toString()}
            </p>
            <p>
              SECRET KEY : <br /> {kp.secretKey.toString()}
            </p>
          </div>
        </div>
        <div className="flex">
          <button
            type="button"
            className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={async () => {
              let data = {
                publicKey: await kp.publicKey.toString(),
                secretKey: await kp.secretKey.toString(),
              };
              navigator.clipboard.writeText(JSON.stringify(data));
              notification.success("Public key copied to clipboard");
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

    let data = {
      publicKey: await kp.publicKey.toString(),
      secretKey: await kp.secretKey.toString(),
    };

    downloadFile({
      data: JSON.stringify(data),
      fileName: "keyPair.json",
      fileType: "text/json",
    });
  }

  const downloadFile = ({ data, fileName, fileType }) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType });
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
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

  async function signIn() {
    const abicoder = new utils.AbiCoder();
    const publicKey = abicoder.encode(["string"], [pubKey]);
    const seller = await signer?.getAddress();
    const mecenateID = await identity?.identityByAddress(seller);
    console.log(publicKey);
    console.log(seller);
    console.log(mecenateID);

    if (seller) {
      const user: UserData = {
        mecenateID: mecenateID,
        wallet: seller,
        publicKey: publicKey,
      };
      const tx = await usersCtx?.registerUser(user);

      notification.success("User registered");

      notification.info("Transaction hash: " + tx.hash);
    }
  }

  const handleNameChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setDescription(event.target.value);
  };

  const handleImageDrop = (acceptedFiles: React.SetStateAction<null>[]) => {
    setImageFile(acceptedFiles[0]);
    uploadJsonToIpfs({ name: name, description: description }, acceptedFiles[0]);
  };

  const handleFormSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const identityData = { name, description };
    await createIdentity(identityData, imageFile);
    alert("Identity minted successfully!");
  };

  const getContractData = async function getContractData() {
    if (factory && identity && signer) {
      const subscriptions = await factory?.getSubscriptionsOwned(signer?.getAddress());
      const fee = await treasury?.fixedFee();
      const _identityFee = await treasury?.fixedFee();
      await fetchNFTBalance();
      setSubscriptions(subscriptions);
      setFee(fee);
      setIdentityFee(_identityFee);
    }
  };

  const createMecenateSubscription = async function createMecenateSubscription() {
    event?.preventDefault();
    if (factory) {
      const tx = await factory.createMecenateSubscription(
        signer?.getAddress(),
        subscriptionName,
        subscriptionDescription,
        subscriptionFee,
        subscriptionDuration,
        {
          value: fee,
        },
      );
      if (tx.hash) {
        notification.success("Mecenate Subscription Started");
      }
    }
  };

  // fetch smart contract event with wagmi

  React.useEffect(() => {
    if (factory) {
      factory.on("MecenateSubscriptionCreated", (owner: string, subscription: string, event: any) => {
        notification.success("Mecenate Subscription Created");
      });
      getContractData();
    }
  }, [signer]);

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20">
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8">Identity</h1>
            <p className="text-xl  mb-20">Mint your NFT. Become a member of the community.</p>
          </div>
          <div className="max-w-lg">
            <div className="card-body bg-secondary rounded-3xl shadow-lg border-2 shadow-primary text-base-content text-lg">
              <h1 className="text-3xl font-bold p-6 ">
                {nftBalance > 0 ? (
                  <div className="flex items-center justify-center text-3xl font-bold">Your ID</div>
                ) : (
                  <div className="text-primary-focus">Mint a Creator ID</div>
                )}
              </h1>
              <div className="p-2 justify-center items-center grid grid-cols-1 gap-2 lg:grid-cols-2">
                <div>
                  <div className="text-secondary-content font-bold mb-2">Identity Fee</div>
                  <div className="text-primary-content">
                    {identityFee ? `${formatEther(String(identityFee))} ETH` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-secondary-content font-bold mb-2">Name</div>
                  <div className="text-primary-content">{nftMetadata ? nftMetadata["name"] : "-"}</div>
                </div>
                <div>
                  <div className="text-secondary-content font-bold mb-2">Description</div>
                  <div className="text-primary-content">{nftMetadata ? nftMetadata["description"] : "-"}</div>
                </div>
                <div className="items-center mx-auto text-center">
                  <div className="text-primary-content">
                    {nftMetadata["image"] ? (
                      <Image
                        decoding="async"
                        loading="lazy"
                        width={100}
                        height={100}
                        alt="image"
                        src={nftMetadata["image"]}
                      />
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </div>
            {nftBalance == 0 ? (
              <form onSubmit={handleFormSubmit}>
                <div className="my-5">
                  <label htmlFor="name" className="block font-medium mb-5">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={handleNameChange}
                    className="input w-full px-4 py-2 rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block font-medium mb-5">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    className="input w-full px-4 py-2 rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="image" className="block font-medium mb-2">
                    Image
                  </label>
                  <Dropzone onDrop={handleImageDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className="flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer"
                      >
                        <input {...getInputProps()} />
                        {imageFile ? (
                          <p>{imageFile.name}</p>
                        ) : (
                          <p>Drag 'n' drop an image here, or click to select a file</p>
                        )}
                      </div>
                    )}
                  </Dropzone>
                </div>
                <button
                  type="submit"
                  className="btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700 my-2"
                >
                  Mint
                </button>
              </form>
            ) : (
              <div></div>
            )}
            <div className="max-w-3xl text-center my-20  text-base-content">
              <h1 className="text-6xl font-bold mb-8">Generate your KeyPair.</h1>
              <p className="text-xl  mb-8">
                Once you create your identity, you will be able to generate your own personal public and private key
                that will allow you to interact with the protocol. You can encrypt and decrypt the information you want
                to share with other users in a completely anonymous and decentralized manner.
              </p>
            </div>
            <div className="my-5 ">
              <button
                className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700 my-2"
                onClick={createPair}
                disabled={nftBalance == 0}
              >
                Create Key Pair
              </button>
              <button
                className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500  hover:bg-primary-700"
                onClick={async () => {
                  await signIn();
                }}
                disabled={nftBalance == 0 || pubKey == ""}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Identity;
