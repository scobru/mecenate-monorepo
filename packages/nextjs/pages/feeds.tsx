import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { AbiCoder, formatEther, keccak256 } from "ethers/lib/utils.js";
import Link from "next/link";
import { useTransactor } from "~~/hooks/scaffold-eth";

const Feeds: NextPage = () => {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateFeedFactory");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");

  const [feeds, setFeeds] = React.useState<string[]>([]);
  const [feedsInfos, setFeedsInfos] = React.useState<Feed[]>([]);
  const [onlyYourFeeds, setOnlyYourFeeds] = React.useState<boolean>(false);
  const txData = useTransactor(signer as Signer);
  const [ethWallet, setEthWallet] = React.useState<any>(null);
  const [customSigner, setCustomSigner] = React.useState<any>(null);
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);
  const deployedContractVault = getDeployedContract(chain?.id.toString(), "MecenateVault");

  const customProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

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

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  const treasuryCtx = useContract({
    address: deployedContractTreasury?.address,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  const factoryCtx = useContract({
    address: deployedContractFactory?.address,
    abi: factoryAbi,
    signerOrProvider: signer || provider,
  });

  let vaultAddress!: string;
  let vaultAbi: ContractInterface[] = [];

  if (deployedContractVault) {
    ({ address: vaultAddress, abi: vaultAbi } = deployedContractVault);
  }

  const vaultCtx = useContract({
    address: vaultAddress,
    abi: vaultAbi,
    signerOrProvider: signer || provider,
  });

  useEffect(() => {
    const getFeeds = async function getFeeds() {
      if (onlyYourFeeds == false) {
        const _feeds = await factoryCtx?.getFeeds();
        const _feedsInfo = await factoryCtx?.getFeedsInfo();
        setFeeds(_feeds);
        setFeedsInfos(_feedsInfo);
      } else {
        const _feeds = await factoryCtx?.getFeedsOwned(keccak256(sismoData.auths[0].userId));
        const _feedsInfo = await factoryCtx?.getFeedsInfoOwned(keccak256(sismoData.auths[0].userId));
        setFeeds(_feeds);
        setFeedsInfos(_feedsInfo);
      }
    };
    if (factoryCtx) {
      getFeeds();
      setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
      setVerified(localStorage.getItem("verified"));
      setSismoResponse(localStorage.getItem("sismoResponse"));
      const storedEthWallet = JSON.parse(String(localStorage.getItem("ethWallet")));

      setEthWallet(storedEthWallet);

      console.log("Stored ethWallet: ", storedEthWallet);

      // Check if storedEthWallet and its privateKey are not null or undefined
      if (storedEthWallet && storedEthWallet?.key) {
        // Create new ethers.Wallet instance
        const instance = new ethers.Wallet(storedEthWallet?.key, customProvider);
        console.log("Instance: ", instance);
        setCustomSigner(instance);
      } else {
        console.warn("Stored ethWallet or its privateKey is undefined.");
      }
    }
  }, [onlyYourFeeds]);

  async function buildFeed() {
    //await factoryCtx?.buildFeed(String(sismoResponse), { value: treasuryCtx?.fixedFee() });

    // encode abi call
    const abiCoder = new AbiCoder();
    // Encode the function call
    const iface = new ethers.utils.Interface(deployedContractFactory?.abi as ContractInterface[]);
    const data = iface.encodeFunctionData("buildFeed", [sismoResponse, keccak256(String(vaultCtx?.address))]);

    txData(vaultCtx?.execute(factoryCtx?.address, data, treasuryCtx?.fixedFee(), keccak256(sismoData.auths[0].userId)));
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10  min-w-fit">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-bold mb-8">FEEDS</h1>
        <p className="text-xl  mb-20">Create your feed and sell your data</p>
      </div>
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
      <div className="grid grid-cols-1 gap-4 my-10 p-5">
        {feeds &&
          feedsInfos &&
          feeds.length > 0 &&
          sismoData?.auths &&
          sismoData?.auths?.length > 0 &&
          feeds.map((feed, i) => (
            <div key={i}>
              <Link href={`/viewFeed?addr=${feed}`} passHref>
                <div className="grid grid-cols-12 gap-4 border rounded-xl p-4 hover:bg-base-200 transition-all duration-300 ease-in-out transform hover:scale-105 bg-base-300 text-base-content">
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
                    {formatEther(String(feedsInfos[i].buyerPayment))} ETH
                  </div>
                  <div className="col-span-2 font-bold animate__animated animate__fadeInLeft">Count:</div>
                  <div className="col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight">
                    {String(feedsInfos[i].postCount)}
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Feeds;
