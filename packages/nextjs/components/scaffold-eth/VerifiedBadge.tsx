import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { formatEther } from "ethers/lib/utils";
import Address from "./Address";

// ABI standard per un token ERC-20
const erc20Abi = ["function balanceOf(address owner) view returns (uint256)"];

export default function VerifiedBadge({ verified, encryptedVaultId, address }) {
  const [depositedEth, setDepositedEth] = useState(0);
  const [depositedMuse, setDepositedMuse] = useState(0);
  const [depositedDai, setDepositedDai] = useState(0);

  const { chain } = useNetwork();
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const museContract = new ethers.Contract(process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE, erc20Abi, provider);
  const daiContract = new ethers.Contract(process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE, erc20Abi, provider);

  const getBalances = useCallback(async () => {
    if (address) {
      try {
        // Ottieni il saldo ETH
        const ethBalance = await provider.getBalance(address);
        setDepositedEth(Number(formatEther(ethBalance)));

        // Ottieni il saldo MUSE
        const museBalance = await museContract.balanceOf(address);
        setDepositedMuse(Number(formatEther(museBalance)));

        // Ottieni il saldo DAI
        const daiBalance = await daiContract.balanceOf(address);
        setDepositedDai(Number(formatEther(daiBalance)));
      } catch (error) {
        console.error("Failed to get balances:", error);
      }
    }
  }, [address, provider]);

  useEffect(() => {
    getBalances();
  }, [getBalances]);

  return (
    <>
      <div className="relative group inline-block">
        <span className="font-semibold ml-2 cursor-pointer">
          <Address address={address} format="short" />
        </span>
        <div className="origin-top-right font-medium absolute right-0 mt-2 w-36 rounded-md shadow-lg text-black bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
          <div className="p-4">
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
