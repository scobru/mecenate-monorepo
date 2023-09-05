import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { formatEther, keccak256, parseEther, toUtf8Bytes } from "ethers/lib/utils.js";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST, AuthType, ClaimType } from "../sismo.config";
import { useAppStore } from "~~/services/store/store";
import { VerifiedBadge } from "~~/components/scaffold-eth/";

const DEBUG = true;

type nftMetadata = {
  name: string;
  image: string;
  description: string;
  owner: string;
};

type ImageProps = {
  cid: string;
};

function readibleHex(userId: string, startLength = 6, endLength = 4, separator = "...") {
  if (!userId?.startsWith("0x")) {
    return userId; // Return the original string if it doesn't start with "0x"
  }
  return userId.substring(0, startLength) + separator + userId.substring(userId.length - endLength);
}

function getProofDataForAuth(sismoConnectResponse: SismoConnectResponse, authType: AuthType): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.auths) {
      for (const auth of proof.auths) {
        if (auth.authType === authType) {
          return proof.proofData;
        }
      }
    }
  }

  return null; // returns null if no matching authType is found
}

function getProofDataForClaim(
  sismoConnectResponse: SismoConnectResponse,
  claimType: number,
  groupId: string,
  value: number,
): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.claims) {
      for (const claim of proof.claims) {
        if (claim.claimType === claimType && claim.groupId === groupId && claim.value === value) {
          return proof.proofData;
        }
      }
    }
  }

  return null; // returns null if no matching claimType, groupId and value are found
}

const Vault: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] = React.useState<SismoConnectVerifiedResult>();
  const [sismoConnectResponse, setSismoConnectResponse] = React.useState<SismoConnectResponse>();
  const [pageState, setPageState] = React.useState<string>("init");
  const [error, setError] = React.useState<string>();
  const [fee, setFee] = React.useState(0);
  const [responseBytes, setResponseBytes] = React.useState<string>();
  const deployedContractUser = getDeployedContract(chain?.id.toString(), "MecenateUsers");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");
  const deployedContractWallet = getDeployedContract(chain?.id.toString(), "MecenateVault");
  const [signature, setSignature] = React.useState<string>();
  const [amount, setAmount] = React.useState(0);
  const [depositedBalance, setDepositedBalance] = React.useState(0);
  const [to, setTo] = React.useState<any>("");
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);
  const store = useAppStore();

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

  useEffect(() => {
    getDeposit();
    setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
    setVerified(localStorage.getItem("verified"));
    setSismoResponse(localStorage.getItem("sismoResponse"));
  }, [signer]);

  const deposit = async () => {
    console.log("Start Deposit");
    console.log(store);
    const tx = await wallet?.deposit(keccak256(sismoData.auths[0].userId), {
      value: parseEther(String(amount)),
    });
    if (tx?.hash) {
      notification.success("Deposit successful!");
    }
  };

  const withdraw = async () => {
    const tx = await wallet?.withdraw(to, parseEther(String(amount)), keccak256(sismoData.auths[0].userId));
    if (tx?.hash) {
      notification.success("Deposit successful!");
    }
  };

  const getDeposit = async () => {
    if (sismoData) {
      const tx = await wallet?.getDeposit(keccak256(sismoData.auths[0].userId));
      if (tx) setDepositedBalance(Number(formatEther(tx)));
    }
  };

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-5">
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8">Vault</h1>
            <p className="text-xl  mb-10">Where Zero-Knowledge Proofs Meet Secure Deposits.</p>
          </div>
          <div className="p-4 ">
            <div className="w-full">
              <div className="card card-bordered border-2 bg-secondary my-10 p-10 w-full mx-auto flex flex-col  text-left">
                {depositedBalance && wallet && (
                  <p className="text-left text-lg mb-5">Balance: {depositedBalance} ETH</p>
                )}
                <span className="text-base font-semibold my-2 ">Deposit</span>
                <div className="w-full mb-5">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Amount to Deposit"
                    onChange={e => setAmount(Number(e.target.value))}
                  />
                </div>
                <div className="w-full mb-5">
                  <button
                    className="btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700"
                    onClick={async () => {
                      await deposit();
                    }}
                    disabled={sismoResponse != null ? false : true}
                  >
                    Deposit
                  </button>
                </div>
                <span className="text-base font-semibold my-2 ">Withdraw</span>
                <div className="w-full mb-5">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Amount to Withdraw"
                    onChange={e => setAmount(Number(e.target.value))}
                  />
                </div>
                <div className="w-full mb-5">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="To"
                    onChange={e => setTo(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <button
                    className="btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700"
                    onClick={async () => {
                      await withdraw();
                    }}
                    disabled={sismoResponse != null ? false : true}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
