import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST, AuthType } from "./../sismo.config";
import { useTransactor } from "~~/hooks/scaffold-eth";
import Spinner from "~~/components/Spinner";
const Identity: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] = React.useState<SismoConnectVerifiedResult>();
  const [sismoConnectResponse, setSismoConnectResponse] = React.useState<SismoConnectResponse>();
  const [pageState, setPageState] = React.useState<string>("");
  const [error, setError] = React.useState<string>();
  const [fee, setFee] = React.useState(0);
  const [responseBytes, setResponseBytes] = React.useState<string>();
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractUser = getDeployedContract(chain?.id.toString(), "MecenateUsers");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");
  const txData = useTransactor(signer as Signer);
  const [userExists, setUserExists] = React.useState<boolean>(false);
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);
  const [userName, setUserName] = React.useState<any>(null);

  let UsersAddress!: string;
  let UsersAbi: ContractInterface[] = [];

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  let treasuryAddress!: string;
  let treasuryAbi: ContractInterface[] = [];

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractUser) {
    ({ address: UsersAddress, abi: UsersAbi } = deployedContractUser);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  const usersCtx = useContract({
    address: UsersAddress,
    abi: UsersAbi,
    signerOrProvider: signer || provider,
  });

  const identity = useContract({
    address: identityAddress,
    abi: identityAbi,
    signerOrProvider: signer || provider,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  async function signIn() {
    txData(usersCtx?.registerUser(localStorage.getItem("sismoResponse"), userName));
  }

  const getContractData = async function getContractData() {
    if (identity && signer) {
      const fee = await treasury?.fixedFee();
      setFee(fee);
    }
  };

  const checkIfUserExists = async function checkIfUserExists() {
    const localSismoData = localStorage.getItem("sismoData");
    if (!localSismoData) return;
    const localSismoDataConverted = JSON.parse(String(localSismoData));
    const _userExists = await usersCtx?.checkifUserExist(keccak256(String(localSismoDataConverted?.auths[0].userId)));
    const _userName = await usersCtx?.getUserName(keccak256(String(localSismoDataConverted?.auths[0].userId)));
    setUserExists(_userExists);
    setUserName(_userName);
  };

  const resetLocalStorage = async function resetLocalStorage() {
    localStorage.removeItem("verified");
    localStorage.removeItem("sismoData");
    localStorage.removeItem("sismoResponse");
  };

  // Funzione per inizializzare lo stato
  const initializeState = async () => {
    await getContractData();
    await checkIfUserExists();
    const sismoDataFromLocalStorage = localStorage.getItem("sismoData");
    const verifiedFromLocalStorage = localStorage.getItem("verified");
    const sismoResponseFromLocalStorage = localStorage.getItem("sismoResponse");

    if (sismoDataFromLocalStorage) {
      setSismoData(JSON.parse(sismoDataFromLocalStorage));
    }
    if (verifiedFromLocalStorage) {
      setVerified(verifiedFromLocalStorage);
    }
    if (sismoResponseFromLocalStorage) {
      setSismoResponse(sismoResponseFromLocalStorage);
    }

    const pageStateToSet = verifiedFromLocalStorage === "verified" ? "verified" : "init";
    setPageState(pageStateToSet);

    if (!sismoData) return;

    if (userName) {
      localStorage.setItem("userName", userName);
    } else {
      const _username = await usersCtx?.getUserName(keccak256(String(sismoData?.auths[0].userId)));
      localStorage.setItem("userName", _username);
      setUserName(_username);
    }
  };

  /* *************************  Reset state **************************** */
  function resetApp() {
    window.location.href = "/";
  }

  useEffect(() => {
    initializeState();
    if (!responseBytes) return;
    setPageState("responseReceived");
  }, [responseBytes]);

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20">
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8">IDENTITY</h1>
            <p className="text-xl  mb-20">Register your identity with zk-proof</p>
          </div>
          <div className="p-4 ">
            {pageState == "init" ? (
              <>
                <div className="text-center">
                  <SismoConnectButton
                    config={CONFIG}
                    auths={AUTHS}
                    signature={SIGNATURE_REQUEST}
                    text="Join With Sismo"
                    onResponse={async (response: SismoConnectResponse) => {
                      setSismoConnectResponse(await response);
                      setPageState("verifying");
                      const verifiedResult = await fetch("/api/verify", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(await response),
                      });

                      const data = await verifiedResult.json();
                      if (verifiedResult.ok) {
                        setSismoConnectVerifiedResult(data);
                        localStorage.setItem("verified", "verified");
                        localStorage.setItem("sismoData", JSON.stringify(await data));
                        setPageState("verified");
                      } else {
                        setPageState("error");
                        setError(data);
                      }
                    }}
                    onResponseBytes={(responseBytes: string) => {
                      setResponseBytes(responseBytes);
                      localStorage.setItem("sismoResponse", responseBytes);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <button
                    className="btn btn-ghost bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      window.location.href = "/identity";
                      resetLocalStorage();
                      resetApp();
                    }}
                  >
                    {" "}
                    RESET{" "}
                  </button>
                </div>
                <br></br>
                <div className="status-wrapper">
                  {pageState == "verifying" ? (
                    <div className="text-center items-center flex flex-row gap-3">
                      <Spinner></Spinner>{" "}
                      <div className="text-blue-500 text-center font-semibold">Verifying ZK Proofs...</div>
                    </div>
                  ) : (
                    <>
                      {Boolean(error) ? (
                        <span className="text-red-500 font-bold">Error verifying ZK Proofs: {error}</span>
                      ) : (
                        <div>
                          <span className="text-green-500 font-bold ">ZK Proofs verified!</span>
                          <div className="mt-5">
                            <input
                              className="input input-bordered mx-5"
                              type="text"
                              placeholder="Set UserName"
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                            />
                            <button
                              className="btn btn-primary  py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={signIn}
                              disabled={userExists}
                            >
                              Sign In{" "}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Identity;
