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
        notification.success("New Feed Created");
        getFeeds();
      });
    }
  });

  return (
    <div className="flex flex-col items-center pt-10 text-black">
      <div className="flex items-center mb-5">
        <button className="bg-primary  hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2" onClick={buildFeed}>
          Create Feed
        </button>
        <button
          className="bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md mr-2"
          onClick={async () => {
            await getFeedsOwned();
          }}
        >
          <i className="fas fa-user-alt mr-2"></i> Your Feeds
        </button>
        <button
          className="bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md"
          onClick={async () => {
            await getFeeds();
          }}
        >
          <i className="fas fa-globe mr-2"></i> All Feeds
        </button>
      </div>

      <div className="w-full">
        {feeds.map((feed, i) => (
          <div key={i} className="card w-full bg-base-100 shadow-xl px-2 py-2 text-info">
            <a href={`/viewFeed?addr=${feed}`}>
              <div className="grid grid-cols-1 p-5">
                <div className="col-span-1">
                  <div className=" mb-2">
                    <strong>Address:</strong>
                    {feed}
                  </div>
                  <div className=" mb-2">
                    <strong>Seller:</strong> {feedsInfos[i].seller}
                  </div>
                  <div className=" mb-2">
                    <strong>Seller Stake</strong> {formatEther(feedsInfos[i].sellerStake)}
                  </div>
                  <div className=" mb-2">
                    <strong>Buyer:</strong> {feedsInfos[i].buyer}
                  </div>
                  <div className=" mb-2">
                    <strong>Buyer Stake</strong>
                    {formatEther(feedsInfos[i].buyerStake)}
                  </div>
                  <div className=" mb-2">
                    <strong>Operator::</strong> {feedsInfos[i].operator}
                  </div>
                  <div className=" mb-2">
                    <strong>Total Stake</strong> {feedsInfos[i].totalStaked}
                  </div>
                  <div className=" mb-2">
                    <strong>Hash count</strong> {feedsInfos[i].totalCount}
                  </div>
                </div>
                <div className="col-span-1"></div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feeds;
