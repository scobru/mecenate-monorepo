import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
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
    buyerPayment: string;
    sellerPayment: string;
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
    <div className="flex flex-col items-center pt-10">
      <div className="max-w-3xl text-center my-20 text-base-content">
        <h1 className="text-6xl font-bold mb-8">Data Privacy and Security Redefined with Mecenate Protocol</h1>
        <p className="text-xl  mb-8">
          Introducing my personal feed, powered by Mecenate Protocol, where I can share information and find anonymous,
          trustless buyers. Mecenate Protocol allows me to securely and privately post my information and receive
          payments directly from interested parties without any intermediaries. With Mecenate Protocol, I can be
          confident that my information is protected and that I'm getting fair compensation for it. Join me in
          revolutionizing the way we share information with Mecenate Protocol.
        </p>
      </div>
      <div className="flex items-center mb-5">
        <button
          className="btn-wide text-base-content bg-secondary hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={buildFeed}
        >
          Create
        </button>
        <button
          className="btn-wide text-base-content bg-secondary hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={async () => {
            await getFeedsOwned();
          }}
        >
          <i className="fas fa-user-alt mr-2"></i> Your Feeds
        </button>
        <button
          className="btn-wide text-base-content bg-secondary hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={async () => {
            await getFeeds();
          }}
        >
          <i className="fas fa-globe mr-2"></i> All Feeds
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 my-10">
        {feeds.map((feed, i) => (
          <div key={i} className="card bg-base-100 shadow-xl p-2">
            <a href={`/viewFeed?addr=${feed}`}>
              <table className="w-full border border-base-300">
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Address:</strong>
                    </td>
                    <td className="px-2 py-1">{feed}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Seller:</strong>
                    </td>
                    <td className="px-2 py-1">{feedsInfos[i].seller}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Seller Stake:</strong>
                    </td>
                    <td className="px-2 py-1">{formatEther(feedsInfos[i].sellerStake)} ETH</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Buyer:</strong>
                    </td>
                    <td className="px-2 py-1">{feedsInfos[i].buyer}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Buyer Stake:</strong>
                    </td>
                    <td className="px-2 py-1">{formatEther(feedsInfos[i].buyerStake)} ETH</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Operator:</strong>
                    </td>
                    <td className="px-2 py-1">{feedsInfos[i].operator}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Total Stake:</strong>
                    </td>
                    <td className="px-2 py-1">{feedsInfos[i].totalStaked} ETH</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>BuyerPayment:</strong>
                    </td>
                    <td className="px-2 py-1">{String(feedsInfos[i].buyerPayment)} ETH</td>
                  </tr>

                  <tr>
                    <td className="px-2 py-1 border-r border-base-300">
                      <strong>Hash Count:</strong>
                    </td>
                    <td className="px-2 py-1">{feedsInfos[i].totalCount}</td>
                  </tr>
                </tbody>
              </table>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feeds;
