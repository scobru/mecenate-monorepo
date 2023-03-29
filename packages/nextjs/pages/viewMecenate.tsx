import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateInterface } from "../../hardhat/typechain-types/contracts/Mecenate";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";
import mecenateABI from "../generated/mecenateABI.json";
import { formatEther, parseEther } from "ethers/lib/utils";

const ViewMecenate: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();
  const router = useRouter();
  const { addr } = router.query;
  let user = "";
  let owner = "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSub, setIsSub] = useState(false);
  const [lastPayment, setLastPayment] = useState(0);

  const [nftData, setNftData] = useState<any>([]);

  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  const deployedContract = getDeployedContract(chain?.id.toString(), "MecenateTier");
  let ctxAbi: MecenateInterface[] = [];

  if (deployedContract) {
    ({ abi: ctxAbi } = deployedContract);
  }

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  const identity = useContract({
    address: identityAddress,
    abi: identityAbi,
    signerOrProvider: signer || provider,
  });

  const ctx = useContract({
    address: String(addr),
    abi: mecenateABI,
    signerOrProvider: signer || provider,
  });

  const fetchData = async function fetchData() {
    if (ctx && signer && provider && router.isReady) {
      const name = await ctx?.name();
      setName(name);
      const description = await ctx?.description();
      setDescription(description);
      const fee = await ctx?.fee();
      setFee(fee);
      const duration = await ctx?.subscriptionDuration();
      setDuration(duration);
      const lastPayment = await ctx?.lastPaymentTime(signer?.getAddress());
      setLastPayment(lastPayment);
      fetchDataIdentity();
      const _isSub = await ctx?.getSubscriptionStatus(signer?.getAddress());
      console.log(_isSub);
      setIsSub(_isSub);

      user = String(signer?.getAddress());
      owner = String(ctx?.owner());
    }
  };

  const fetchDataIdentity = async function fetchDataIdentity() {
    const owner = await ctx?.owner();
    const _id = await identity?.identityByAddress(owner);
    console.log(_id);
    const _nftData = await identity?.tokenURI(await _id);
    console.log(_nftData);
    // fetch url content
    const res = await fetch(_nftData);
    const _nftDataJson = await res.json();
    setNftData(_nftDataJson);
    console.log(_nftData);
  };

  useEffect(() => {
    try {
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }, [ctx, router.isReady]);

  async function subscribe() {
    event.preventDefault();
    const tx = await ctx?.subscribe({
      value: Number(fee),
    });
    await tx.wait();
  }

  function formatDate(date: number) {
    // convert timestamp to days
    const days = Math.floor((date % 2629743) / 86400);

    return `${days} days`;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="w-full max-w-md p-10 bg-slate-200 mt-6 text-black rounded-lg shadow-xl">
        <h1 className="text-3xl mb-10 font-semibold">{name}</h1>
        <p className="mb-5">
          Status: <span className="font-semibold">{isSub ? `Subscribed` : "Not subscribed"}</span>
        </p>
        <p className=" mb-5 font-medium uppercase"> {nftData.name}</p>
        <img className="mb-5" width={50} height={50} src={nftData.image}></img>
        <form onSubmit={subscribe}>
          <label className="mb-5 block">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <span className="text-lg mb-2 font-base">
                  Fee: <strong>{formatEther(fee)} ETH</strong>
                </span>
                <span className="text-lg mb-2 font-base">
                  Duration: <strong>{formatDate(Number(duration))}</strong>{" "}
                </span>
              </div>
              <span className="text-lg mb-2 font-base">{description}</span>
            </div>
          </label>
          <label className="mb-5 block">
            Last Payment: <span className="font-base">{Date(Number(lastPayment))}</span>
          </label>
          <button type="submit" className="btn btn-primary" disabled={!account || !signer || isSub}>
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};
export default ViewMecenate;
