import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";
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
    setFeeds(_feeds);
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
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
      <button
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700 my-2"
        onClick={buildFeed}
      >
        Build Feed
      </button>
      <div>
        <button
          className="btn w-2/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700 mx-2"
          onClick={async () => {
            await getFeedsOwned();
          }}
        >
          Your Feeds
        </button>
        <button
          className="btn w-2/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700 mx-2"
          onClick={async () => {
            await getFeeds();
          }}
        >
          All Feeds
        </button>
      </div>
      <div className="flex flex-col w-full text-secondary items-center my-2 ">
        {feeds.map((feed, i) => (
          <div key={i} className="card border-2 py-2 px-2 my-2">
            <a href={`/viewFeed?addr=${feed}`} className="text-indigo-600 hover:text-indigo-900">
              {feed}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feeds;
