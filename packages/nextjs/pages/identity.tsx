import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { keccak256 } from "ethers/lib/utils.js";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST, AuthType, ClaimType } from "./../sismo.config";
import { useAppStore } from "~~/services/store/store";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { VerifiedBadge } from "~~/components/scaffold-eth";

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
    // await createPair();
    const seller = await signer?.getAddress();
    if (seller) {
      txData(usersCtx?.registerUser(store.sismoResponse));
    }
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
    setUserExists(_userExists);
  };

  const resetLocalStorage = async function resetLocalStorage() {
    localStorage.removeItem("verified");
    localStorage.removeItem("sismoData");
    localStorage.removeItem("sismoResponse");
  };

  useEffect(() => {
    const runEffect = async () => {
      await getContractData();
      await checkIfUserExists();
      setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
      setVerified(localStorage.getItem("verified"));
      setSismoResponse(localStorage.getItem("sismoResponse"));
    };

    if (localStorage.getItem("verified") == "verified") {
      runEffect();
      setPageState("verified");
    } else {
      runEffect();
      setPageState("init");
    }
  }, [sismoData, verified, sismoResponse, getContractData, checkIfUserExists]);

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20">
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8">Identity</h1>
            <p className="text-xl  mb-20">Register your identity with zk-proof</p>
          </div>
          <div className="p-4 ">
            {pageState == "init" ? (
              <>
                <div className="text-center">
                  <SismoConnectButton
                    config={CONFIG}
                    // Auths = Data Source Ownership Requests. (e.g Wallets, Github, Twitter, Github)
                    auths={AUTHS}
                    // Claims = prove group membership of a Data Source in a specific Data Group.
                    // (e.g ENS DAO Voter, Minter of specific NFT, etc.)
                    // Data Groups = [{[dataSource1]: value1}, {[dataSource1]: value1}, .. {[dataSource]: value}]
                    // Existing Data Groups and how to create one: https://factory.sismo.io/groups-explorer
                    // claims={CLAIMS}
                    // Signature = user can sign a message embedded in their zk proof
                    // encode the signature with abi.encode
                    signature={SIGNATURE_REQUEST}
                    text="Join With Sismo"
                    // Triggered when received Sismo Connect response from user data vault
                    onResponse={async (response: SismoConnectResponse) => {
                      setSismoConnectResponse(await response);
                      setPageState("verifying");
                      const verifiedResult = await fetch("/api/verify", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json", // Add this line
                        },
                        body: JSON.stringify(response),
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
                    }}
                  >
                    {" "}
                    RESET{" "}
                  </button>
                </div>
                <br></br>
                <div className="status-wrapper">
                  {pageState == "verifying" ? (
                    <span className="text-blue-500">Verifying ZK Proofs...</span>
                  ) : (
                    <>
                      {Boolean(error) ? (
                        <span className="text-red-500">Error verifying ZK Proofs: {error}</span>
                      ) : (
                        <div>
                          <span className="text-green-500 ">ZK Proofs verified!</span>
                          <div className="mt-5">
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
            {/* <div className="card bordered my-5">
              <div className="card-body">
                {sismoConnectVerifiedResult && (
                  <>
                    <h3>Verified Auths</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>AuthType</th>
                          <th>Verified UserId</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sismoConnectVerifiedResult.auths.map((auth, index) => (
                          <tr key={index}>
                            <td>{AuthType[auth.authType]}</td>
                            <td>{auth.userId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                <br />
                {sismoConnectVerifiedResult && (
                  <>
                    <h3>Verified Claims</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>groupId</th>
                          <th>ClaimType</th>
                          <th>Verified Value</th>
                        </tr>
                      </thead>
                    </table>
                  </>
                )}
              </div>
              <h3>Auths requested</h3>
              <table>
                <thead>
                  <tr>
                    <th>AuthType</th>
                    <th>Requested UserId</th>
                    <th>Optional?</th>
                    <th>ZK proof</th>
                  </tr>
                </thead>
                <tbody>
                  {AUTHS.map((auth, index) => (
                    <tr key={index}>
                      {console.log(auth)}
                      <td>{AuthType[auth.authType]}</td>
                      <td>{readibleHex(auth.vaultId || "No userId requested")}</td>
                      <td>{auth.isOptional ? "optional" : "required"}</td>
                      {sismoConnectResponse ? (
                        <td>{readibleHex(getProofDataForAuth(sismoConnectResponse, auth.authType)!)}</td>
                      ) : (
                        <td> ZK proof not generated yet </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <br />
              <h3>Claims requested</h3>
              <table>
                <thead>
                  <tr>
                    <th>GroupId</th>
                    <th>ClaimType</th>
                    <th>Requested Value</th>
                    <th>Can User Select Value?</th>
                    <th>Optional?</th>
                    <th>ZK proof</th>
                  </tr>
                </thead>
              </table>
              <h3>Signature requested and verified</h3>
              <table>
                <thead>
                  <tr>
                    <th>Message Requested</th>
                    <th>Can User Modify message?</th>
                    <th>Verified Signed Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{SIGNATURE_REQUEST.message}</td>
                    <td>{SIGNATURE_REQUEST.isSelectableByUser ? "yes" : "no"}</td>
                    <td>
                      {sismoConnectVerifiedResult
                        ? sismoConnectVerifiedResult.signedMessage
                        : "ZK proof not verified yet"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Identity;
