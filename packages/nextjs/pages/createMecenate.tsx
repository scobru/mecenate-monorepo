import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateSubscriptionFactoryInterface } from "../../hardhat/typechain-types/contracts/MecenateSubscriptionFactory";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";

const CreateMecenate: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();
  const [subscriptions, setSubscriptions] = React.useState<Array<string>>([]);
  const [subscriptionName, setSubscriptionName] = React.useState("");
  const [subscriptionTier, setSubscriptionTier] = React.useState<number[]>([]);
  const [fee, setFee] = React.useState(0);
  const deployedContract = getDeployedContract(chain?.id.toString(), "MecenateSubscriptionFactory");

  let ctxAddress!: string;
  let ctxAbi: MecenateSubscriptionFactoryInterface[] = [];

  if (deployedContract) {
    ({ address: ctxAddress, abi: ctxAbi } = deployedContract);
  }

  const ctx = useContract({
    address: ctxAddress,
    abi: ctxAbi,
    signerOrProvider: signer || provider,
  });

  const getContractData = async function getContractData() {
    if (ctx) {
      const subscriptions = await ctx.getSubscriptions();
      const fee = await ctx.creationFee();
      setSubscriptions(subscriptions);
      setFee(fee);
    }
  };

  const createMecenateSubscriptoin = async function createMecenateSubscriptoin() {
    if (ctx) {
      for (let i = 0; i < subscriptionTier.length; i++) {
        subscriptionTier[i] = Number(subscriptionTier[i]);
      }
      console.log(subscriptionTier);
      const tx = await ctx.createMecenateSubscription(signer?.getAddress(), subscriptionName, subscriptionTier, {
        value: fee,
      });
      if (tx.hash) {
        notification.success("Mecenate Subscription Created");
      }
    }
  };

  useEffect(() => {
    getContractData();
  }, [ctx]);
  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl p-10 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-primary">Create Mecenate Subscription</h1>
        <div className="flex flex-col items-center justify-center w-full max-w-md p-10 bg-white rounded-lg shadow-xl">
          <div className="flex flex-col items-center justify-center w-full max-w-md p-10 bg-white ">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Name</label>
            <input
              type="text"
              name="subscriptionName"
              id="subscriptionName"
              className="block w-full px-3 py-2 mt-1 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={e => setSubscriptionName(e.target.value)}
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
            <input
              type="text"
              name="subscriptionTier"
              id="subscriptionTier"
              className="block w-full px-3 py-2 mt-1 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={e => setSubscriptionTier(e.target.value.split(",").map(x => Number(x)))}
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {fee ? <div>Fee: {Number(fee)} wei ETH</div> : null}
            </label>
            <button
              type="button"
              className="inline-flex items-center justify-center w-full px-4 py-2 mt-6 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              onClick={createMecenateSubscriptoin}
            >
              Create Mecenate Subscription
            </button>
          </div>
          <div className="flex flex-col items-center justify-center w-full max-w-md p-10 bg-white mt-6">
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
    </div>
  );
};

export default CreateMecenate;
