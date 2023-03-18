import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
const DEBUG = true;

const Feeds: NextPage = () => {
  const network = useNetwork();
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateFeedFactory");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateFeed");

  const [pubKey, setPubKey] = React.useState<string>("");
  const [feeds, setFeeds] = React.useState<string[]>([]);
  const [feedsInfos, setFeedsInfos] = React.useState<Feed[]>([]);

  type Feed = {
    operator: string;
    buyer: string;
    seller: string;
    buyerStake: string;
    sellerStake: string;
    totalStaked: string;
    totalCount: string;
  };

  let factoryAddress!: string;
  let factoryAbi: ContractInterface[] = [];

  type UserData = {
    mecenateID: Number;
    wallet: String;
    publicKey: String;
  };

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  const factoryCtx = useContract({
    address: factoryAddress,
    abi: factoryAbi,
    signerOrProvider: signer || provider,
  });

  async function getFeeds() {
    const _feeds = await factoryCtx?.getFeeds();
    const _feedsInfo = await factoryCtx?.getFeedsInfo();
    setFeeds(_feeds);
    setFeedsInfos(_feedsInfo);
    if (DEBUG) console.log(feeds);
  }

  async function getFeedsOwned() {
    let _feeds = await factoryCtx?.getFeedsOwned(signer?.getAddress());
    // remove 0x0000000000000000000000000000000000000000 from _feeds
    _feeds = _feeds.filter((feed: string) => feed != "0x0000000000000000000000000000000000000000");

    setFeeds(_feeds);
    if (DEBUG) console.log(feeds);
  }

  async function buildFeed() {
    const tx = await factoryCtx?.buildFeed();
    if (DEBUG) console.log(tx);
  }

  useEffect(() => {
    if (factoryCtx) {
      getFeeds();
    }
  }, [signer, factoryCtx]);

  // listen for events FeedCreated
  useEffect(() => {
    if (factoryCtx) {
      factoryCtx.on("FeedCreated", (feedAddress: string, owner: string, event: any) => {
        if (DEBUG) console.log("FeedCreated", feedAddress, owner, event);
        notification.info("New Feed Created");
        getFeeds();
      });
    }
  }, [factoryCtx, feeds]);

  return (
    <div className="flex flex-col items-center pt-10 text-black">
      <div className="flex items-center mb-5">
        <button
          className="bg-primary-500 hover:bg-primary-700  font-bold py-2 px-4 rounded-md mr-2"
          onClick={buildFeed}
        >
          <i className="fas fa-plus mr-2"></i> Create Feed
        </button>
        <button
          className="bg-primary-500 hover:bg-primary-700  font-bold py-2 px-4 rounded-md mr-2"
          onClick={async () => {
            await getFeedsOwned();
          }}
        >
          <i className="fas fa-user-alt mr-2"></i> Your Feeds
        </button>
        <button
          className="bg-primary-500 hover:bg-primary-700  font-bold py-2 px-4 rounded-md"
          onClick={async () => {
            await getFeeds();
          }}
        >
          <i className="fas fa-globe mr-2"></i> All Feeds
        </button>
      </div>

      <div className="w-full max-w-3xl">
        {feeds.map((feed, i) => (
          <div key={i} className="bg-white shadow-sm rounded-md my-5">
            <a href={`/viewFeed?addr=${feed}`} className="text-indigo-600 hover:text-indigo-900">
              <div className="grid grid-cols-2 gap-5 p-5">
                <div className="col-span-1">
                  <div className="font-bold text-lg mb-2">Feed Address:</div>
                  <div className="text-gray-700 mb-2">{feed}</div>
                  <div className="text-gray-700 mb-2">Seller: {feedsInfos[i].seller}</div>
                  <div className="text-gray-700 mb-2">Buyer: {feedsInfos[i].buyer}</div>
                  <div className="text-gray-700 mb-2">Operator: {feedsInfos[i].operator}</div>
                </div>
                <div className="col-span-1">
                  <div className="font-bold text-lg mb-2">Feed Info:</div>
                  <div className="text-gray-700 mb-2">Seller Stake: {formatEther(feedsInfos[i].sellerStake)}</div>
                  <div className="text-gray-700 mb-2">Buyer Stake: {formatEther(feedsInfos[i].buyerStake)}</div>
                  <div className="text-gray-700 mb-2">Total Stake: {feedsInfos[i].totalStaked}</div>
                  <div className="text-gray-700 mb-2">Hash Count: {feedsInfos[i].totalCount}</div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feeds;
