import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateSubscriptionFactoryInterface } from "../../hardhat/typechain-types/contracts/MecenateSubscriptionFactory";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
import { formatEther, parseEther } from "ethers/lib/utils.js";

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

const Tiers: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [fee, setFee] = React.useState(0);
  const [identityFee, setIdentityFee] = React.useState(0);
  const [nftBalance, setNftBalance] = React.useState(0);
  const [nftMetadata, setNftMetadata] = React.useState<nftMetadata[]>([]);

  const [subscriptions, setSubscriptions] = React.useState<Array<string>>([]);
  const [subscriptionName, setSubscriptionName] = React.useState("");
  const [subscriptionDescription, setSubscriptionDescription] = React.useState("");
  const [subscriptionFee, setSubscriptionFee] = React.useState("");
  const [subscriptionDuration, setSubscriptionDuration] = React.useState(0);

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateTierFactory");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");

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

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
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

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

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
    }
  };

  const getContractData = async function getContractData() {
    if (factory && identity && signer) {
      const subscriptions = await factory?.getSubscriptionsOwned(signer?.getAddress());
      const _sub = subscriptions.filter(
        (feed: string) => subscriptions != "0x0000000000000000000000000000000000000000",
      );

      const fee = await treasury?.fixedFee();
      const _identityFee = await identity?.identityCreationFee();
      await fetchNFTBalance();
      setSubscriptions(_sub);
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
        parseEther(subscriptionFee),
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
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4">
      <div className="max-w-3xl text-center my-2">
        <h1 className="text-6xl font-bold mb-20">
          Monetize your products, DApps, or content with our Tier Subscription
        </h1>
        <p className="text-xl  mb-2">
          Increase user loyalty by offering premium content and exclusive rewards to subscribers, unlocking a new
          revenue stream for your business. Try our Patreon-like service now and enjoy guaranteed, recurring income for
          your app
        </p>
      </div>

      <div className="min-w-fit">
        <div className="text-xl mb-8">
          <div className="text-base-content font-bold mb-2">Protocol Fee</div>
          <div className="text-base-content">{fee ? `${formatEther(String(fee))} ETH` : "-"}</div>
        </div>
        <div className="card min-w-fit mx-auto items-center bg-primary shadow-2xl px-5 py-5 mb-20">
          <h1 className="card-title text-base-content text-4xl text-left">Create Tier</h1>
          <form onSubmit={createMecenateSubscription} className="text-secondary w-full my-2">
            <label htmlFor="name" className="block font-medium text-base-content">
              Subscription Name{" "}
            </label>
            <input
              type="text"
              name="subscriptionName"
              id="subscriptionName"
              className="text-neutral-500 input-lg text-xl block w-full px-3 py-3 my-5  border-2 bg-transparent border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={e => setSubscriptionName(e.target.value)}
            />
            <label htmlFor="name" className="block font-medium text-base-content">
              Subscription Description{" "}
            </label>
            <input
              type="text"
              name="subscriptionDescription"
              id="subscriptionDescription"
              className="text-neutral-500 input-lg text-xl block w-full px-3 py-3 my-5  border-2 bg-transparent border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={e => setSubscriptionDescription(e.target.value)}
            />
            <label htmlFor="name" className="block font-medium text-base-content">
              Subscription Duration{" "}
            </label>
            <input
              type="text"
              name="subscriptionDuration"
              id="subscriptionDuration"
              className="text-neutral-500 input-lg text-xl block w-full px-3 py-3 my-5  border-2 bg-transparent border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={e => setSubscriptionDuration(Number(e.target.value))}
            />
            <label htmlFor="name" className="block font-medium text-base-content">
              Subscription Fee{" "}
            </label>{" "}
            <input
              type="text"
              name="subscriptionFee"
              id="subscriptionfee"
              className="text-neutral-500 input-lg text-xl block w-full px-3 py-3 my-5  border-2 bg-transparent border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={e => setSubscriptionFee(e.target.value)}
            />
            <div className="text-center">
              <button
                type="submit"
                className="btn-wide text-center items-center justify-center text-base-content bg-secondary hover:bg-accent font-bold py-2 px-4 my-5 rounded-md"
              >
                Create Subscription
              </button>
            </div>
          </form>
          <div className="flex flex-col items-center justify-center w-full max-w-md p-10 px-20  text-primary mt-6">
            <h2 className="text-lg font-medium">Mecenate Tiers</h2>
            {subscriptions &&
              subscriptions.map((subscription, index) => (
                <div
                  key={index}
                  className="card bg-secondary hover:bg-accent text-base-content py-2 px-2 mx-2 font-semibold"
                >
                  <a href={`/viewTier?addr=${subscription}`} className="text-indigo-600 hover:text-indigo-900">
                    {subscription}
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tiers;
