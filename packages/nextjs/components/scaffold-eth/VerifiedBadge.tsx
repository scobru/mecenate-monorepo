import React, { useCallback, useEffect, useState } from "react";
import { getDeployedContract } from "./Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";
import { useContract, useNetwork, useProvider } from "wagmi";
import { formatEther } from "ethers/lib/utils";
import Address from "./Address";

type TVerifiedProps = {
  verified?: string;
  encryptedVaultId?: string;
  address?: string;
};

export default function VerifiedBadge({ verified, encryptedVaultId, address }: TVerifiedProps) {
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [depositedMuse, setDepositedMuse] = useState<number>(0);
  const [depositedDai, setDepositedDai] = useState<number>(0);

  const { chain } = useNetwork();
  const deployedContractWallet = getDeployedContract(chain?.id.toString(), "MecenateVault");

  const customProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const customWallet = new ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), customProvider);

  let walletAddress!: string;
  let walletAbi: ContractInterface[] = [];

  if (deployedContractWallet) {
    ({ address: walletAddress, abi: walletAbi } = deployedContractWallet);
  }

  const wallet = useContract({
    address: walletAddress,
    abi: walletAbi,
    signerOrProvider: customWallet,
  });

  const getDeposit = useCallback(async () => {
    try {
      if (encryptedVaultId) {
        const tx = await wallet?.getEthDeposit(encryptedVaultId);
        if (tx) setDepositedBalance(Number(formatEther(tx)));
        const tx2 = await wallet?.getTokenDeposit(process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE, encryptedVaultId);
        if (tx2) setDepositedMuse(Number(formatEther(tx2)));
        const tx3 = await wallet?.getTokenDeposit(process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE, encryptedVaultId);
        if (tx3) setDepositedDai(Number(formatEther(tx3)));
      }
    } catch (error) {
      console.error("Failed to get deposit:", error);
    }
  }, [encryptedVaultId, wallet]);

  useEffect(() => {
    const interval = setInterval(() => {
      getDeposit();
    }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <>
      <div className="relative group inline-block">
        <span className="font-semibold ml-2 cursor-pointer">
          <Address address={address} format="short" />
        </span>
        <div className="origin-top-right font-medium absolute right-0 mt-2 w-36 rounded-md shadow-lg text-black bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
          <div className="p-4">
            <div className="flex justify-between ">
              <span>
                <strong>ETH</strong>
              </span>
              <span>{depositedBalance.toFixed(3)}</span>
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
