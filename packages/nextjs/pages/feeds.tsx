import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
const DEBUG = true;

const Feeds: NextPage = () => {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateFeedFactory");
  // const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateFeed");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");

  // const [pubKey, setPubKey] = React.useState<string>("");
  const [feeds, setFeeds] = React.useState<string[]>([]);
  const [feedsInfos, setFeedsInfos] = React.useState<Feed[]>([]);

  const [fixedFee, setFixedFee] = React.useState<string>("");

  type Feed = {
    operator: string;
    buyer: string;
    seller: string;
    buyerStake: string;
    sellerStake: string;
    totalStake: string;
    postCount: string;
    buyerPayment: string;
    sellerPayment: string;
  };

  let factoryAddress!: string;
  let factoryAbi: ContractInterface[] = [];

  let treasuryAddress: string;
  let treasuryAbi: ContractInterface[] = [];

  type UserData = {
    mecenateID: number;
    wallet: string;
    publicKey: string;
  };

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  const treasuryCtx = useContract({
    address: treasuryAddress!,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  const factoryCtx = useContract({
    address: factoryAddress!,
    abi: factoryAbi,
    signerOrProvider: signer || provider,
  });

  async function getFeeds() {
    const _feeds = await factoryCtx?.getContracts();
    const _feedsInfo = await factoryCtx?.getFeedsInfo();
    const _fixedFee = await factoryCtx?.getCreationFee();
    setFeedsInfos(_feedsInfo);
    setFeeds(_feeds);

    setFixedFee(_fixedFee);
    console.log(_fixedFee)
    console.log(_feedsInfo);
    if (DEBUG) console.log(feeds);
  }

  async function getFeedsOwned() {
    let _feeds = await factoryCtx?.getContractsOwnedBy(signer?.getAddress());
    // remove 0x0000000000000000000000000000000000000000 from _feeds
    _feeds = _feeds.filter((feed: string) => feed != "0x0000000000000000000000000000000000000000");

    setFeeds(_feeds);
    const _feedsInfo = await factoryCtx?.getFeedsInfo();
    const _tempFeedInfo: Feed[] = [];

    for (let i = 0; i < _feedsInfo.length; i++) {
      if (_feedsInfo[i].contractAddress == _feeds[i]) {
        _tempFeedInfo.push(_feedsInfo[i]);
      }
    }

    setFeedsInfos(_feedsInfo);

    if (DEBUG) console.log(feeds);
  }

  async function buildFeed() {
    const tx = await factoryCtx?.createContract({ value: fixedFee });
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
      factoryCtx.on("ContractCreated", (feedAddress: string, owner: string, event: any) => {
        if (DEBUG) console.log("ContractCreated", feedAddress, owner, event);
        notification.success("New Feed Created");
        getFeeds();
      });
    }
  });

  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black min-w-fit">
      <div className="max-w-3xl text-center my-2 text-base-content p-4">
        <h1 className="text-6xl font-bold mb-8">Data Privacy and Security Redefined.</h1>
        <p className="text-xl  mb-8">
          <strong>Mecenate Feeds </strong> allows me to securely and privately post my information and receive payments
          directly from interested parties without any intermediaries. With Mecenate Protocol, I can be confident that
          my information is protected and that I&apos;m getting fair compensation for it.
        </p>
        <p className="text-xl  mb-8">
          <strong>Mecenate Feeds</strong> is a base layer where <strong>Mecenate Bay</strong> is built on top of.
          Mecenate Bay is a marketplace where you can buy and sell data feeds.
        </p>
      </div>
      <div className="flex flex-col items-center mb-5">
        <button
          className="btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2"
          onClick={buildFeed}
        >
          Create
        </button>
        <button
          className="btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2"
          onClick={async () => {
            await getFeedsOwned();
          }}
        >
          <i className="fas fa-user-alt mr-2"></i> Your Feeds
        </button>
        <button
          className="btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2"
          onClick={async () => {
            await getFeeds();
          }}
        >
          <i className="fas fa-globe mr-2"></i> All Feeds
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 my-10">
        {feeds.map((feed, i) => (
          <div key={i} className="card bg-base-100 shadow-xl p-2 text-base-content">
            <a href={`/viewFeed?addr=${feed}`}>
              <div className="grid grid-cols-12 gap-4 border p-2">
                <div className="col-span-2 font-bold">Addr:</div>
                <div className="col-span-4 overflow-hidden text-truncate">{feed}</div>
                <div className="col-span-2 font-bold">Seller:</div>
                <div className="col-span-4 overflow-hidden text-truncate">{feedsInfos[i].seller}</div>
                <div className="col-span-2 font-bold">Seller Stake:</div>
                <div className="col-span-4 overflow-hidden text-truncate">
                  {formatEther(feedsInfos[i].sellerStake)} ETH
                </div>
                <div className="col-span-2 font-bold">Buyer:</div>
                <div className="col-span-4 overflow-hidden text-truncate">{feedsInfos[i].buyer}</div>
                <div className="col-span-2 font-bold">Buyer Stake:</div>
                <div className="col-span-4 overflow-hidden text-truncate">
                  {formatEther(feedsInfos[i].buyerStake)} ETH
                </div>
                <div className="col-span-2 font-bold">Operator:</div>
                <div className="col-span-4 overflow-hidden text-truncate">{feedsInfos[i].operator}</div>
                <div className="col-span-2 font-bold">Total:</div>
                <div className="col-span-4 overflow-hidden text-truncate">
                  {formatEther(String(feedsInfos[i].totalStake))} ETH
                </div>
                <div className="col-span-2 font-bold">Payment:</div>
                <div className="col-span-4 overflow-hidden text-truncate">{String(feedsInfos[i].buyerPayment)} ETH</div>
                <div className="col-span-2 font-bold">Count:</div>
                <div className="col-span-4 overflow-hidden text-truncate">{String(feedsInfos[i].postCount)}</div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feeds;
