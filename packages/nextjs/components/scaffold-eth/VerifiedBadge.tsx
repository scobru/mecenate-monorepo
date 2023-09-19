import { useCallback, useEffect } from "react";
import React from "react";
import { getDeployedContract } from "./Contract/utilsContract";
import { ContractInterface } from "ethers";
import { useContract, useNetwork, useProvider, useSigner } from "wagmi";
import { formatEther } from "ethers/lib/utils.js";

type TVerifiedProps = {
  verified?: string;
  encryptedVaultId?: string;
};

export default function VerifiedBadge({ verified, encryptedVaultId }: TVerifiedProps) {
  const [newVerified, setNewVerified] = React.useState("");
  const { chain } = useNetwork();
  const deployedContractWallet = getDeployedContract(chain?.id.toString(), "MecenateVault");
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [depositedBalance, setDepositedBalance] = React.useState<number>(0);
  const [response, setResponse] = React.useState<any>(null);
  let walletAddress!: string;
  let walletAbi: ContractInterface[] = [];

  if (deployedContractWallet) {
    ({ address: walletAddress, abi: walletAbi } = deployedContractWallet);
  }

  const wallet = useContract({
    address: walletAddress,
    abi: walletAbi,
    signerOrProvider: signer || provider,
  });

  const getDeposit = useCallback(async () => {
    const tx = await wallet?.getEthDeposit(encryptedVaultId);
    if (tx) setDepositedBalance(Number(formatEther(tx)));
  }, [encryptedVaultId, wallet]);

  useEffect(() => {
    if (verified == "verified") {
      setNewVerified("verified");
    }
    if (encryptedVaultId) {
      getDeposit();
    }
  }, [verified, getDeposit, encryptedVaultId, depositedBalance]);

  return (
    <>
      <div className="flex items-center hover:text-black">
        <div className="font-base">Verified</div>
        {newVerified === "verified" ? (
          <span className="font-semibold ml-2"> 🟩 {depositedBalance} ETH</span>
        ) : (
          <div className="verification-fail font-semibold ml-2">❌</div>
        )}
      </div>
    </>
  );
}
