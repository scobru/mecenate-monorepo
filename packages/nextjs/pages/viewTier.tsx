import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers, utils } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { formatEther, parseEther } from "ethers/lib/utils";
import Image from "next/image";
import Snippet from "../assets/snippet.png";
import Snippet2 from "../assets/snippet2.png";
import Snippet3 from "../assets/snippet3.png";
import { useRouter } from "next/router";

const ViewTier: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();
  const router = useRouter();
  const { addr } = router.query;
  const [user, setUser] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("");
  const [duration, setDuration] = useState(0);
  const [isSub, setIsSub] = useState(false);
  const [lastPayment, setLastPayment] = useState(0);
  const [tierCid, setTierCid] = useState("");
  const [tierCidView, setTierCidView] = useState("");

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFee, setNewFee] = useState(0);

  const [nftData, setNftData] = useState<any>([]);

  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");
  const deployedContract = getDeployedContract(chain?.id.toString(), "MecenateTier");

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  let treasuryAddress!: string;
  let treasuryAbi: ContractInterface[] = [];

  let ctxAbi: ContractInterface[] = [];

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

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
    abi: ctxAbi,
    signerOrProvider: signer || provider,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  const fetchCid = async function fetchCid() {
    const _tierCidView = await ctx?.getTierCid();
    console.log(_tierCidView);
    const cidDecodedString = utils.parseBytes32String(_tierCidView);
    setTierCidView(cidDecodedString);
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

      if (_isSub) {
        await fetchCid();
      }

      setUser(String(await signer?.getAddress()));
      setOwner(String(await ctx?.owner()));
    }
  };

  const setCid = async function setCid() {
    const abiCoder = new ethers.utils.AbiCoder();
    const cidEncodedByte32 = utils.formatBytes32String(tierCid);
    const tx = await ctx?.setTierCid(cidEncodedByte32);
    await tx.wait();
  };

  const changeName = async function changeName() {
    const tx = await ctx?.changeName(newName);
    await tx.wait();
  };

  const changeDescription = async function changeDescription() {
    const tx = await ctx?.changeDescription(newDescription);
    await tx.wait();
  };

  const changeFee = async function changeFee() {
    const tx = await ctx?.changeFee(parseEther(String(newFee)));
    await tx.wait();
  };

  useEffect(() => {
    try {
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }, [ctx, owner, user, router.isReady]);

  async function subscribe() {
    event?.preventDefault();
    const tx = await ctx?.subscribe({
      value: String(fee),
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
      <div className="w-full max-w-md p-10 bg-slate-200 my-6 text-black rounded-lg shadow-xl">
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
                  Fee: <strong>{String(Number(fee) / 1e18)} ETH</strong>
                </span>
                <span className="text-lg mb-2 font-base">
                  Duration: <strong>{formatDate(Number(duration))}</strong>{" "}
                </span>
              </div>
              <span className="text-lg mb-2 font-base">{description}</span>
              <span className="text-lg mb-2 font-base">{tierCidView}</span>
            </div>
          </label>
          <label className="mb-5 block">
            Last Payment: <span className="font-base">{new Date(Number(lastPayment)).toLocaleString()}</span>
          </label>
          <button type="submit" className="btn btn-primary" disabled={!account || !signer || isSub}>
            Subscribe
          </button>
        </form>
      </div>
      {owner == user ? (
        <div className="w-full max-w-md p-10 bg-slate-200 mt-6 text-black rounded-lg shadow-xl">
          <p className="font-proxima text-base font-normal justify-start"> Share your IPFS CID to your subscribers</p>
          <input
            className="input mb-5"
            type="text"
            placeholder="CID"
            value={tierCid}
            onChange={e => setTierCid(e.target.value)}
          />
          <button className="btn btn-primary mx-2" onClick={setCid}>
            Set CID
          </button>

          <p className="font-normal justify-start"> Change Tier Name</p>
          <input
            className="input mb-5"
            type="text"
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button className="btn btn-primary mx-2" onClick={changeName}>
            Change
          </button>

          <p className="font-normal justify-start"> Change Tier Description</p>
          <input
            className="input mb-5"
            type="text"
            placeholder="Description"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
          />
          <button className="btn btn-primary mx-2" onClick={changeDescription}>
            Change
          </button>

          <p className="font-normal justify-start"> Change Tier Fee</p>
          <input
            className="input mb-5"
            type="text"
            placeholder="Fee"
            value={newFee}
            onChange={e => setNewFee(Number(e.target.value))}
          />
          <button className="btn btn-primary mx-2" onClick={changeFee}>
            Change
          </button>
        </div>
      ) : null}
      <div className="divider"></div>
      <div className=" flex flex-col text-3xl  my-5 font-bold justify-center text-justify p-4">
        Import your subscription in your dapp.
      </div>
      <div className="mockup-code">
        <pre data-prefix="">
          <code>
            <code className="text-warning">IMecenateTier</code>
            ('YOUR_TIER_CONTRACT').<code className="text-warning">isValidSubscription</code>('SUBSCRIBER_ADDRESS')
          </code>
        </pre>
        <pre data-prefix="">
          <code>
            <code className="text-warning">IMecenateTier</code>
            ('YOUR_TIER_CONTRACT').<code className="text-warning">subscribe</code>()
          </code>
        </pre>
        <pre data-prefix="">
          <code>
            <code className="text-warning">IMecenateTier</code>
            ('YOUR_TIER_CONTRACT').<code className="text-warning">fee</code>()
          </code>
        </pre>
      </div>
    </div>
  );
};
export default ViewTier;
