import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, Wallet, ethers } from "ethers";
import { formatEther } from "ethers";
import Link from "next/link";
import { useTransactor } from "~~/hooks/scaffold-eth";

const Feeds: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateFeedFactory");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");
  const [feeds, setFeeds] = React.useState<string[]>([]);
  const [feedsInfos, setFeedsInfos] = React.useState<Feed[]>([]);
  const [onlyYourFeeds, setOnlyYourFeeds] = React.useState<boolean>(false);
  const [sismoData, setSismoData] = React.useState<any>(null);

  const txData = useTransactor(signer as Signer);

  type Feed = {
    operator: string;
    buyer: string;
    seller: string;
    buyerStake: string;
    sellerStake: string;
    totalStake: string;
    postCount: string;
    paymentRequested: string;
    sellerPayment: string;
    status: string;
    tokenId: string;
    version: string;
  };

  let factoryAddress!: string;
  let factoryAbi: ContractInterface[] = [];

  let treasuryAddress: string;
  let treasuryAbi: ContractInterface[] = [];

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  const treasuryCtx = useContract({
    address: deployedContractTreasury?.address,
    abi: treasuryAbi,
    signerOrProvider: signer,
  });

  const factoryCtx = useContract({
    address: deployedContractFactory?.address,
    abi: factoryAbi,
    signerOrProvider: signer,
  });

  const getFeeds = useCallback(async () => {
    if (!factoryCtx || !sismoData) return;

    let _feeds, _feedsInfo;

    if (onlyYourFeeds) {
      _feeds = await factoryCtx.getFeedsOwned(signer?.getAddress());
      console.log(_feeds);
      _feedsInfo = await factoryCtx.getFeedsInfoOwned(signer?.getAddress());
      console.log(_feedsInfo);
    } else {
      _feeds = await factoryCtx.getFeeds();
      _feedsInfo = await factoryCtx.getFeedsInfo();
    }

    // Batch state updates
    setFeeds(_feeds);
    setFeedsInfos(_feedsInfo);
  }, [onlyYourFeeds, factoryCtx]);

  useEffect(() => {
    if (factoryCtx) {
      getFeeds();
      const storedData = localStorage.getItem("sismoData");
      const storedSismoResponse = localStorage.getItem("sismoResponse");

      if (storedData && storedSismoResponse) {
        setSismoData(JSON.parse(storedData));
      } else {
        console.warn("Stored ethWallet or its privateKey is undefined.");
      }
    }
  }, [onlyYourFeeds]);

  const buildFeed = async () => {
    if (!factoryCtx || !treasuryCtx || !txData || !sismoData) return;
    const fee = await treasuryCtx?.fixedFee();
    txData(factoryCtx?.buildFeed({ value: fee }));
  };

  const formattedFeeds = useMemo(() => {
    return (
      feeds &&
      feedsInfos &&
      feeds.map((feed, i) => (
        <div key={i}>
          <Link href={`/viewFeed?addr=${feed}`} passHref>
            <div className="card card-shadow grid grid-cols-12 gap-4 border rounded-xl p-4 hover:bg-opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105  text-base-content ">
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Currency:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {Number(feedsInfos[i].tokenId) == 0 ? "ETH" : Number(feedsInfos[i].tokenId) == 1 ? "MUSE" : "DAI"}{" "}
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Addr:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {feed}
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Seller Stake:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {formatEther(feedsInfos[i]?.sellerStake)} ETH
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Total Locked:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {formatEther(String(feedsInfos[i].totalStake))} ETH
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Buyer Payment:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {formatEther(String(feedsInfos[i].paymentRequested))} ETH
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Count:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {String(feedsInfos[i].postCount)}
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Status:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {Number(feedsInfos[i].status) === 6
                  ? "Revealed"
                  : Number(feedsInfos[i].status) === 5
                  ? "Punished"
                  : Number(feedsInfos[i].status) === 4
                  ? "Finalized"
                  : Number(feedsInfos[i].status) === 3
                  ? "Submitted"
                  : Number(feedsInfos[i].status) === 2
                  ? "Accepted"
                  : Number(feedsInfos[i].status) === 1
                  ? "Proposed"
                  : "Waiting for Creator"}
              </div>
              <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Version:</div>
              <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                {String(feedsInfos[i].version)}
              </div>
            </div>
          </Link>
        </div>
      ))
    );
  }, [feeds, feedsInfos]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10  min-w-fit">
      {/*  <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-bold mb-8">FEEDS</h1>
        <p className="text-xl  mb-20">Create your feed and sell your data</p>
      </div> */}
      <div className="mx-auto  w-fit text-center items-center"></div>
      <div className="flex flex-row items-center mb-5  gap-4 text-lg p-5">
        <button className="link-hover font-bold" onClick={buildFeed}>
          Create
        </button>
        <button
          className="link-hover font-bold"
          onClick={async () => {
            setOnlyYourFeeds(true);
          }}
        >
          <i className="fas fa-user-alt mr-2"></i> Your Feeds
        </button>
        <button
          className="link-hover  font-bold"
          onClick={async () => {
            setOnlyYourFeeds(false);
          }}
        >
          <i className="fas fa-globe mr-2"></i> All Feeds
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 my-10 p-5">{formattedFeeds}</div>
    </div>
  );
};

export default Feeds;
