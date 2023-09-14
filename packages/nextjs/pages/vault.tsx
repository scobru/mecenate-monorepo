import type { NextPage } from "next";
import React, { useCallback, useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { formatEther, keccak256, parseEther } from "ethers/lib/utils.js";
import { SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { AuthType } from "../sismo.config";
import { useAppStore } from "~~/services/store/store";

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
  const [tokenAddress, setTokenAddress] = React.useState<string>("");
  const [userCommitment, setUserCommitment] = React.useState<string>("");
  const [randomBytes32Hash, setRandomBytes32Hash] = React.useState<string>("");

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
    if (sismoData?.auths[0].userId == null) return;
    const commitment = userCommitment || keccak256(sismoData.auths[0].userId);
    if (commitment) {
      const tx = await wallet?.getEthDeposit(commitment);
      if (tx) setDepositedBalance(Number(formatEther(tx)));
    }
  }, [sismoData, userCommitment, wallet]);

  useEffect(() => {
    getDeposit();
    setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
    setVerified(localStorage.getItem("verified"));
    setSismoResponse(localStorage.getItem("sismoResponse"));
  }, [getDeposit, signer]);

  const deposit = async () => {
    const commitment = userCommitment || keccak256(sismoData.auths[0].userId);
    const tx = await wallet?.depositETH(commitment, {
      value: parseEther(String(amount)),
    });
    if (tx?.hash) {
      notification.success("Deposit successful!");
    }
  };

  const withdraw = async () => {
    const commitment = userCommitment || keccak256(sismoData.auths[0].userId);
    const tx = await wallet?.withdrawETH(to, parseEther(String(amount)), commitment);
    if (tx?.hash) {
      notification.success("Withdrawal successful!");
    }
  };

  // Nuove funzioni per gestire i token ERC20
  const depositToken = async (tokenAddress: string) => {
    const commitment = userCommitment || keccak256(sismoData.auths[0].userId);
    const tx = await wallet?.depositToken(tokenAddress, parseEther(String(amount)), commitment);
    if (tx?.hash) {
      notification.success("Token Deposit successful!");
    }
  };

  const withdrawToken = async (tokenAddress: string) => {
    const commitment = userCommitment || keccak256(sismoData.auths[0].userId);
    const tx = await wallet?.withdrawToken(tokenAddress, to, parseEther(String(amount)), commitment);
    if (tx?.hash) {
      notification.success("Token Withdrawal successful!");
    }
  };

  const getDepositToken = async (tokenAddress: string) => {
    const commitment = userCommitment || keccak256(sismoData.auths[0].userId);
    if (commitment) {
      const tx = await wallet?.getTokenDeposit(tokenAddress, commitment);
      if (tx) {
        // Aggiorna il saldo del token depositato
      }
    }
  };

  function generateRandomBytes32() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const result =
      "0x" +
      Array.from(array)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    setRandomBytes32Hash(result);
    setUserCommitment(result);

    notification.warning(
      <div
        id="alert-additional-content-3"
        className="p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
        role="alert"
      >
        <div className="flex items-center">
          <svg
            aria-hidden="true"
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Info</span>
          <h3 className="text-lg font-medium">Save Commitment!</h3>
        </div>
        <div className="flex">
          <button
            type="button"
            className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={async () => {
              navigator.clipboard.writeText(result);
              notification.success("Symmetric key copied to clipboard");
            }}
          >
            <svg
              aria-hidden="true"
              className="-ml-0.5 mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Copy to clipboard
          </button>
        </div>
      </div>,
    );

    return (
      "0x" +
      Array.from(array)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
    );
  }

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
                <span className="text-base font-semibold my-5 ">Deposit</span>
                <div className="w-full mb-5">
                  <button
                    className="btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700"
                    onClick={() => generateRandomBytes32()}
                  >
                    Generate Commitment
                  </button>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Commitment Hash (Leave empty for sismo commitment)"
                    onChange={e => setUserCommitment(e.target.value)}
                    value={userCommitment}
                  />
                </div>
                <div className="w-full mb-5">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Token Address (Leave empty for ETH)"
                    onChange={e => setTokenAddress(e.target.value)}
                  />
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
                      if (tokenAddress) {
                        await depositToken(tokenAddress);
                      } else {
                        await deposit();
                      }
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
                      if (tokenAddress) {
                        await withdrawToken(tokenAddress);
                      } else {
                        await withdraw();
                      }
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
