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

/* configure Infura auth settings */
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

const CreateMecenate: NextPage = () => {
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

  const [subscriptions, setSubscriptions] = React.useState<Array<string>>([]);
  const [subscriptionName, setSubscriptionName] = React.useState("");
  const [subscriptionDescription, setSubscriptionDescription] = React.useState("");
  const [subscriptionFee, setSubscriptionFee] = React.useState(0);
  const [subscriptionDuration, setSubscriptionDuration] = React.useState(0);

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "Factory");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "Identity");

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

  let factoryAddress!: string;
  let factoryAbi: MecenateSubscriptionFactoryInterface[] = [];

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

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
  };

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
      const fee = await factory?.creationFee();
      const _identityFee = await identity?.identityCreationFee();
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
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
      <div className="max-w-lg mx-auto">
        <div className="bg-slate-200 rounded-lg shadow-lg px-2 py-2">
          <h1 className="text-3xl font-bold p-6 ">
            {nftBalance > 0 ? (
              <div className="flex items-center justify-center">Your ID</div>
            ) : (
              <div>Mint a Creator ID</div>
            )}
          </h1>
          <div className="p-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <div className="text-gray-700 font-bold mb-2">Identity Fee</div>
              <div className="text-gray-600">{identityFee ? `${formatEther(String(identityFee))} ETH` : "-"}</div>
            </div>
            <div>
              <div className="text-gray-700 font-bold mb-2">Subscription Fee</div>
              <div className="text-gray-600">{fee ? `${formatEther(String(fee))} ETH` : "-"}</div>
            </div>
            {/*  <div className="border-b lg:border-b-0">
              <div className="text-gray-700 font-bold mb-2">Balance</div>
              <div className="text-gray-600">{nftBalance ? Number(nftBalance) : "-"}</div>
            </div> */}
            <div>
              <div className="text-gray-700 font-bold mb-2">Name</div>
              <div className="text-gray-600">{nftMetadata ? nftMetadata["name"] : "-"}</div>
            </div>
            <div>
              <div className="text-gray-700 font-bold mb-2">Description</div>
              <div className="text-gray-600">{nftMetadata ? nftMetadata["description"] : "-"}</div>
            </div>
            <div>
              <div className="text-gray-600">
                {nftMetadata["image"] ? (
                  <Image
                    decoding="async"
                    loading="lazy"
                    width={80}
                    height={80}
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
            <div className="mb-4 my-5">
              <label htmlFor="name" className="block font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-2 rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={description}
                onChange={handleDescriptionChange}
                className="w-full px-4 py-2 rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
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
              className="bg-indigo-500 text-white font-medium py-2 px-6 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Mint
            </button>
          </form>
        ) : (
          <div></div>
        )}

        <div className="divider"></div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Create Subscription</h1>
        <form onSubmit={createMecenateSubscription} className="text-secondary">
          <label htmlFor="name" className="block font-medium">
            Subscription Name{" "}
          </label>
          <input
            type="text"
            name="subscriptionName"
            id="subscriptionName"
            className="block w-full px-3 py-2 mt-1 text-sm border-2 bg-transparent border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onChange={e => setSubscriptionName(e.target.value)}
          />
          <label htmlFor="name" className="block font-medium">
            Subscription Description{" "}
          </label>
          <input
            type="text"
            name="subscriptionDescription"
            id="subscriptionDescription"
            className="block w-full px-3 py-2 mt-1 text-sm border-2 bg-transparent border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onChange={e => setSubscriptionDescription(e.target.value)}
          />
          <label htmlFor="name" className="block font-medium">
            Subscription Duration{" "}
          </label>
          <input
            type="text"
            name="subscriptionDuration"
            id="subscriptionDuration"
            className="block w-full px-3 py-2 mt-1 text-sm border-2 bg-transparent border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onChange={e => setSubscriptionDuration(Number(e.target.value))}
          />
          <label htmlFor="name" className="block font-medium">
            Subscription Fee{" "}
          </label>{" "}
          <input
            type="text"
            name="subscriptionFee"
            id="subscriptionfee"
            className="block w-full px-3 py-2 mt-1 text-sm border-2 bg-transparent border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onChange={e => setSubscriptionFee(Number(e.target.value))}
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white font-medium py-2 px-6 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 my-5"
          >
            Create Subscription
          </button>
        </form>
        <div className="flex flex-col items-center justify-center w-full max-w-md p-10 bg-slate-200 mt-6">
          <h2 className="text-lg font-medium text-gray-900">Mecenate Subscriptions</h2>
          {subscriptions &&
            subscriptions.map((subscription, index) => (
              <div key={index} className="mt-2">
                <a href={`/viewMecenate?addr=${subscription}`} className="text-indigo-600 hover:text-indigo-900">
                  {subscription}
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CreateMecenate;
