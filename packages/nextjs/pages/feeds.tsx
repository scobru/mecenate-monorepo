import type { NextPage } from "next";
import React, { useCallback, useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { formatEther, keccak256, toUtf8Bytes } from "ethers/lib/utils.js";
import { useAppStore } from "~~/services/store/store";
import Link from "next/link";
import { VerifiedBadge } from "~~/components/scaffold-eth";
import { relative } from "path";
import { notification } from "~~/utils/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";

const DEBUG = true;

const Feeds: NextPage = () => {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateFeedFactory");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");
  const deployedContractWallet = getDeployedContract(chain?.id.toString(), "MecenateWallet");

  const [feeds, setFeeds] = React.useState<string[]>([]);
  const [feedsInfos, setFeedsInfos] = React.useState<Feed[]>([]);
  const [onlyYourFeeds, setOnlyYourFeeds] = React.useState<boolean>(false);
  const txData = useTransactor(signer as Signer);

  const store = useAppStore();

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

  let walletAddress: string;
  let walletAbi: ContractInterface[] = [];

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

  if (deployedContractWallet) {
    ({ address: walletAddress, abi: walletAbi } = deployedContractWallet);
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

  const walletCtx = useContract({
    address: walletAddress!,
    abi: walletAbi,
    signerOrProvider: signer || provider,
  });

  const getFeeds = async function getFeeds() {
    if (onlyYourFeeds == false) {
      const _feeds = await factoryCtx?.getFeeds();
      const _feedsInfo = await factoryCtx?.getFeedsInfo();
      setFeeds(_feeds);
      setFeedsInfos(_feedsInfo);
      if (DEBUG) console.log(_feeds);
      if (DEBUG) console.log(_feedsInfo);
    } else {
      const _feeds = await factoryCtx?.getFeedsOwned(keccak256(store.sismoData.auths[0].userId));
      const _feedsInfo = await factoryCtx?.getFeedsInfoOwned(keccak256(store.sismoData.auths[0].userId));
      setFeeds(_feeds);
      setFeedsInfos(_feedsInfo);
      if (DEBUG) console.log(_feeds);
      if (DEBUG) console.log(_feedsInfo);
    }
    console.log(onlyYourFeeds);
  };

  useEffect(() => {
    if (factoryCtx) {
      getFeeds();
    }
  }, [onlyYourFeeds]);

  async function buildFeed() {
    const id = notification.loading("Transaction sent, waiting for confirmation");
    // Esegui la transazione
    txData(factoryCtx?.buildFeed(store.sismoResponse, { value: treasuryCtx?.fixedFee() }));
  }

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
      {store.sismoData && store.sismoData.auths && store.sismoData.auths.length > 0 && store.verified && (
        <VerifiedBadge sismoData={store.sismoData.auths[1]} verified={String(store.verified)} />
      )}
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
            setOnlyYourFeeds(true);
          }}
        >
          <i className="fas fa-user-alt mr-2"></i> Your Feeds
        </button>
        <button
          className="btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2"
          onClick={async () => {
            setOnlyYourFeeds(false);
          }}
        >
          <i className="fas fa-globe mr-2"></i> All Feeds
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 my-10">
        {feeds &&
          feedsInfos &&
          feeds.length > 0 &&
          store?.sismoData?.auths &&
          store?.sismoData?.auths?.length > 0 &&
          feeds.map((feed, i) => (
            <div key={i} className="card bg-base-100 shadow-xl p-2 text-base-content">
              <Link href={`/viewFeed?addr=${feed}`} passHref>
                <div className="grid grid-cols-12 gap-4 border p-2">
                  <div className="col-span-2 font-bold">Addr:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">{feed}</div>
                  <div className="col-span-2 font-bold">Seller Stake:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">
                    {formatEther(feedsInfos[i]?.sellerStake)} ETH
                  </div>
                  <div className="col-span-2 font-bold">Buyer Payment:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">
                    {formatEther(feedsInfos[i]?.buyerStake)} ETH
                  </div>
                  {/* <div className="col-span-2 font-bold">Operator:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">{feedsInfos[i].operator}</div> */}
                  <div className="col-span-2 font-bold">Total:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">
                    {formatEther(String(feedsInfos[i].totalStake))} ETH
                  </div>
                  <div className="col-span-2 font-bold">Payment:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">
                    {formatEther(String(feedsInfos[i].buyerPayment))} ETH
                  </div>
                  <div className="col-span-2 font-bold">Count:</div>
                  <div className="col-span-4 overflow-hidden text-truncate">{String(feedsInfos[i].postCount)}</div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Feeds;
