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
      <div className="inline-flex items-start max-w-fit border-1 p-1 rounded-lg bg-gradient-to-t border-slate-700 shadow-md shadow-slate-600">
        <span className="font-semibold ml-2">
          <Address address={address} format="short" /> {depositedBalance.toFixed(3)} ETH
        </span>
      </div>
    </>
  );
}
