import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateInterface } from "../../hardhat/typechain-types/contracts/Mecenate";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";

const ViewMecenate: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();

  const router = useRouter();
  const { addr } = router.query;
  const [tier, setTier] = useState(1);
  const [currentTier, setCurrentTier] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [name, setName] = useState("");

  const deployedContract = getDeployedContract(chain?.id.toString(), "Mecenate");
  let ctxAbi: MecenateInterface[] = [];

  if (deployedContract) {
    ({ abi: ctxAbi } = deployedContract);
  }

  const ctx = useContract({
    address: String(addr),
    abi: ctxAbi,
    signerOrProvider: signer || provider,
  });

  useEffect(() => {
    async function fetchData() {
      if (ctx && signer) {
        const numTiers = await ctx.getNumberOfTiers();
        setTiers(Array.from({ length: numTiers }, (_, i) => i + 1));

        const fees = await Promise.all(
          tiers.map(async tier => {
            return ctx.getMonthlyFee(tier);
          }),
        );
        setMonthlyFees(fees);

        const subscriptionName = await ctx.name();
        setName(subscriptionName);
      }
    }

    fetchData();
  }, [ctx]);

  useEffect(() => {
    async function fetchData() {
      if (signer && ctx) {
        const [isSub, tier] = await ctx.getSubscriptionStatus(signer.getAddress());
        if (isSub) {
          setCurrentTier(tier);
        }
      }
    }

    fetchData();
  }, [ctx]);

  async function subscribe() {
    const monthlyFee = await ctx?.getMonthlyFee(tier);
    const tx = await ctx?.subscribe(tier, {
      value: monthlyFee,
    });
    await tx.wait();
    setCurrentTier(tier);
    alert("Subscribed successfully");
  }

  useEffect(() => {}, [ctx]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="flex flex-col items-center justify-center w-full max-w-md p-10 bg-white mt-6 text-black rounded-lg shadow-xl">
        <h1 className="text-3xl mb-10">{name}</h1>
        <p className="mb-5">
          Current tier: <span className="font-semibold">{currentTier ? `Tier ${currentTier}` : "Not subscribed"}</span>
        </p>
        <form
          onSubmit={e => {
            e.preventDefault();
            subscribe();
          }}
        >
          <label className="mb-5 block">
            <span className="text-lg mb-2">Tier:</span>
            <select
              className="form-select w-full text-xl py-2 px-4 rounded-lg shadow-lg border-0 text-black"
              value={tier}
              onChange={e => setTier(e.target.value)}
            >
              {tiers.map((tier, index) => (
                <option key={tier} value={tier}>
                  Tier {tier} ({String(monthlyFees[index])} ETH/month)
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={!account}>
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};
export default ViewMecenate;
