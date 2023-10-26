import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { formatEther } from "ethers/lib/utils";
import Address from "./Address";
import Blockies from "react-blockies";
import Link from "next/link";

// ABI standard per un token ERC-20
const erc20Abi = ["function balanceOf(address owner) view returns (uint256)"];

export default function WalletBadge() {
  const [depositedEth, setDepositedEth] = useState(0);
  const [depositedMuse, setDepositedMuse] = useState(0);
  const [depositedDai, setDepositedDai] = useState(0);

  const { chain } = useNetwork();
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const museContract = new ethers.Contract(String(process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE), erc20Abi, provider);
  const daiContract = new ethers.Contract(String(process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE), erc20Abi, provider);
  const [address, setAddress] = useState<string | null>(null);

  const getBalances = async () => {
    try {
      const address = JSON.parse(String(localStorage.getItem("wallet"))).address;
      setAddress(address);
      // Ottieni il saldo ETH
      const ethBalance = await provider.getBalance(address);
      setDepositedEth(Number(formatEther(ethBalance)));

      // Ottieni il saldo MUSE
      const museBalance = await museContract.balanceOf(address);
      setDepositedMuse(Number(formatEther(museBalance)));

      // Ottieni il saldo DAI
      const daiBalance = await daiContract.balanceOf(address);
      setDepositedDai(Number(formatEther(daiBalance)));

      console.log("Address:", address);
    } catch (error) {
      console.error("Failed to get balances:", error);
    }
  };

  useEffect(() => {
    getBalances();
    const poolInterval = setInterval(() => getBalances(), process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL);
    return () => clearInterval(poolInterval);
  }, [provider, depositedDai, depositedEth, depositedMuse]);

  return (
    <>
      <div className="relative group inline-block align-baseline mx-5">
        <Link href="/wallet">
          {" "}
          <Blockies className="rounded-full" seed={address?.toLowerCase() as string} />
        </Link>
        <div className="origin-top-right font-medium absolute right-0 mt-2  rounded-md shadow-lg text-black bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
          <div className="p-4">
            <div className="flex justify-between">
              <span>
                <Address address={address?.toLowerCase() as string} format="short" />
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                <strong>ETH</strong>
              </span>
              <span>{depositedEth.toFixed(3)}</span>
            </div>

            <div className="flex justify-between">
              <span>
                <strong>MUSE</strong>
              </span>
              <span>{depositedMuse.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                <strong>DAI</strong>
              </span>
              <span>{depositedDai.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}