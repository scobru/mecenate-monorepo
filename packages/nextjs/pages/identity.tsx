import type { NextPage } from "next";
import React, { use, useCallback, useEffect, useMemo } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST, AuthType } from "./../sismo.config";
import { useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import Spinner from "~~/components/Spinner";
import crypto from "crypto";
import { Address } from "~~/components/scaffold-eth";
import { TokenAmount } from "@uniswap/sdk";

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
  const deployedContractVault = getDeployedContract(chain?.id.toString(), "MecenateVault");
  const txData = useTransactor(signer as Signer);
  const [userExists, setUserExists] = React.useState<boolean>(false);
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);
  const [userName, setUserName] = React.useState<any>(null);
  const [withdrawalAddress, setWithdrawalAddress] = React.useState<any>("");
  const [nonce, setNonce] = React.useState<any>(null);
  const [forwarderAddress, setForwarderAddress] = React.useState<string>("");
  const deployedContractDepositorFactory = getDeployedContract(chain?.id.toString(), "MecenateForwarderFactory");
  const deployedContractForwarder = getDeployedContract(chain?.id.toString(), "MecenateForwarder");

  const customWallet = new ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);
  const [tokenAddress, setTokenAddress] = React.useState<string>("");
  const [tokenAmount, setTokenAmount] = React.useState<string>("");

  let UsersAddress!: string;
  let UsersAbi: ContractInterface[] = [];

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  let treasuryAddress!: string;
  let treasuryAbi: ContractInterface[] = [];

  let depositorAddress: string;
  let depositorAbi: ContractInterface[] = [];

  let vaultAddress!: string;
  let vaultAbi: ContractInterface[] = [];

  let forwarderAddressOriginal!: string;
  let forwarderAbi: ContractInterface[] = [];

  if (deployedContractForwarder) {
    ({ address: forwarderAddressOriginal, abi: forwarderAbi } = deployedContractForwarder);
  }

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractUser) {
    ({ address: UsersAddress, abi: UsersAbi } = deployedContractUser);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  if (deployedContractVault) {
    ({ address: vaultAddress, abi: vaultAbi } = deployedContractVault);
  }

  if (deployedContractDepositorFactory) {
    ({ address: depositorAddress, abi: depositorAbi } = deployedContractDepositorFactory);
  }

  const { writeAsync: mintDai } = useScaffoldContractWrite(
    "MockDai",
    "mint",
    [forwarderAddress, ethers.utils.parseEther("1")],
    0,
  );

  const { writeAsync: mintMuse } = useScaffoldContractWrite(
    "MUSE",
    "mint",
    [forwarderAddress, ethers.utils.parseEther("1")],
    0,
  );

  const vaultCtx = useContract({
    address: vaultAddress,
    abi: vaultAbi,
    signerOrProvider: customWallet || provider,
  });

  const usersCtx = useContract({
    address: UsersAddress,
    abi: UsersAbi,
    signerOrProvider: customWallet || provider,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: customWallet || provider,
  });

  const depositorFactory = useContract({
    address: deployedContractDepositorFactory?.address,
    abi: depositorAbi,
    signerOrProvider: customWallet || provider,
  });

  const forwarder = useContract({
    address: forwarderAddress,
    abi: forwarderAbi,
    signerOrProvider: customWallet || provider,
  });

  const generateNonce = useCallback(async () => {
    if (localStorage.getItem("nonce")) setNonce(localStorage.getItem("nonce"));
    if (localStorage.getItem("withdrawalAddress")) setWithdrawalAddress(localStorage.getItem("withdrawalAddress"));
    if (localStorage.getItem("nonce") && localStorage.getItem("withdrawalAddress")) return;

    const nonce = keccak256(ethers.utils.randomBytes(32));
    setNonce(nonce);

    localStorage.setItem("nonce", nonce);
  }, [nonce, withdrawalAddress]);

  const signIn = async () => {
    const iface = new ethers.utils.Interface(deployedContractUser?.abi as any[]);
    const data = iface.encodeFunctionData("registerUser", [
      sismoResponse,
      String(localStorage.getItem("withdrawalAddress")),
      String(localStorage.getItem("nonce")),
      userName,
    ]);
    txData(vaultCtx?.execute(usersCtx?.address, data, 0, keccak256(String(sismoData?.auths[0]?.userId))));
  };

  const getContractData = async function getContractData() {
    if (signer) {
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
    const nonceFromLocalStorage = localStorage.getItem("nonce");
    const withdrawalAddressFromLocalStorage = localStorage.getItem("withdrawalAddress");

    if (sismoDataFromLocalStorage) {
      setSismoData(JSON.parse(sismoDataFromLocalStorage));
    }

    if (verifiedFromLocalStorage) {
      setVerified(verifiedFromLocalStorage);
    }
    if (sismoResponseFromLocalStorage) {
      setSismoResponse(sismoResponseFromLocalStorage);
    }

    if (nonceFromLocalStorage) {
      setNonce(nonceFromLocalStorage);
    } else {
      const nonce = keccak256(ethers.utils.randomBytes(32));
      setNonce(nonce);
      localStorage.setItem("nonce", nonce);
    }

    if (withdrawalAddressFromLocalStorage) {
      setWithdrawalAddress(withdrawalAddressFromLocalStorage);
    } else {
      setWithdrawalAddress("");
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

  /* *************************  Account Abstraction *********************/

  const createForwarder = async () => {
    if (sismoData) {
      txData(depositorFactory?.createforwarder(keccak256(sismoData?.auths[0]?.userId)));
    }
  };

  const getForwarder = async () => {
    if (depositorFactory && sismoData) {
      const result = await depositorFactory?.getforwarders(keccak256(sismoData?.auths[0]?.userId));
      setForwarderAddress(result);
      localStorage.setItem("forwarderAddress", result);
    }
  };

  /* *************************  Reset state *****************************/
  function resetApp() {
    window.location.href = "/";
  }

  useEffect(() => {
    initializeState();
    setPageState("verified");
  }, []);

  useEffect(() => {
    const run = async () => {
      initializeState();
      generateNonce();
      getForwarder();
    };

    // pooling run
    const interval = setInterval(async () => {
      await run();
    }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));

    return () => clearInterval(interval);
  });

  const signMessage = () => {
    if (!withdrawalAddress || !nonce) return;
    const result = ethers.utils.defaultAbiCoder.encode(
      ["address", "bytes32"],
      [String(withdrawalAddress), String(nonce)],
    );
    return result;
  };

  const handleDepositToken = async () => {
    if (!forwarder) return;
    const iface = new ethers.utils.Interface(deployedContractForwarder?.abi as any[]);
    const data = iface.encodeFunctionData("depositToken", [tokenAddress, ethers.utils.parseEther(tokenAmount)]);

    console.log("TokenAddress", tokenAddress);
    console.log("TokenAmount", tokenAmount);

    txData(vaultCtx?.execute(forwarderAddress, data, 0, keccak256(String(sismoData?.auths[0]?.userId))));
  };

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20">
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8">IDENTITY</h1>
            <p className="text-xl  mb-20">Register your identity with zk-proof</p>
          </div>
          <div className="p-4 ">
            {!signer?.provider && <div className="text-center font-bold text-xl my-5">Please connect your wallet</div>}
            {pageState == "init" ? (
              <>
                <div className="mt-10">
                  <input
                    className="input input-bordered my-5 w-full"
                    type="text"
                    placeholder="Set Withdrawal Address"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setWithdrawalAddress(e.target.value);
                      localStorage.setItem("withdrawalAddress", e.target.value);
                    }}
                  />
                </div>
                <div className="text-center">
                  <SismoConnectButton
                    config={CONFIG}
                    auths={AUTHS}
                    signature={{
                      message: String(signMessage()),
                    }}
                    disabled={withdrawalAddress !== "" ? false : true}
                    text="Join With Sismo"
                    onResponse={async (response: SismoConnectResponse) => {
                      setSismoConnectResponse(response);
                      setPageState("verifying");
                      getForwarder();
                      try {
                        const verifiedResult = await fetch("/api/verify", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...response,
                            address: localStorage.getItem("withdrawalAddress"),
                            nonce: localStorage.getItem("nonce"),
                          }),
                        });
                        const data = await verifiedResult.json();

                        if (verifiedResult.ok) {
                          setSismoConnectVerifiedResult(data);
                          localStorage.setItem("verified", "verified");
                          localStorage.setItem("sismoData", JSON.stringify(await data));
                          setPageState("verified");
                          getForwarder();
                        } else {
                          setPageState("error");
                          setError(data.error.toString()); // or JSON.stringify(data.error)
                        }
                      } catch (error) {
                        console.error("Error:", error);
                        setPageState("error");
                        setError(error as any);
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
                        <div className="flex flex-col">
                          <div className="status-wrapper">
                            <button
                              className="btn btn-primary my-10 text-base-content border-2 border-secondary-focus rounded-xl  hover:bg-red-700  font-bold py-2 px-4 hover:text-white focus:outline-none focus:shadow-outline"
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
                          <div className="text-green-500 font-bold my-5 ">ZK Proofs verified!</div>
                          <div className="card  card-shadow ">
                            <div className="text-center font-semibold text-xl">Faucet mDAI/MUSE</div>
                            <button
                              className="btn btn-large"
                              onClick={async () => {
                                await mintDai();
                              }}
                              disabled={!Boolean(forwarderAddress != ethers.constants.AddressZero && forwarderAddress)}
                            >
                              Mint mDAI
                            </button>

                            <button
                              className="btn btn-large"
                              onClick={async () => {
                                await mintMuse();
                              }}
                              disabled={!Boolean(forwarderAddress != ethers.constants.AddressZero && forwarderAddress)}
                            >
                              Mint MUSE
                            </button>
                          </div>
                          <div className="card  card-shadow ">
                            <div className="font-semibold text-xl">Deposit</div>
                            <div>
                              <button
                                className="btn btn-large"
                                onClick={async () => {
                                  await createForwarder();
                                }}
                                disabled={Boolean(forwarderAddress != ethers.constants.AddressZero)}
                              >
                                Create
                              </button>
                              {forwarderAddress == ethers.constants.AddressZero && forwarderAddress ? (
                                <p className="text-lg mb-10">Create forwarder address</p>
                              ) : (
                                <div>
                                  <div>
                                    {" "}
                                    <p className="text-lg mb-10"> [1] Send ETH or ERC20 at this forwarder address</p>
                                    <Address address={forwarderAddress} format="long" />
                                    <br />
                                  </div>
                                  <div>
                                    {" "}
                                    <p className="text-lg mb-10">
                                      [2] Select ERC20 you want transfer into Mecenate Vault.
                                    </p>
                                    <select
                                      className="select select-bordered w-full max-w-xs mb-5"
                                      name="tokens"
                                      id="tokens"
                                      onChange={async e => {
                                        setTokenAddress(e.target.value);
                                      }}
                                    >
                                      <option value={""}>Select Token</option>
                                      <option value={process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE}>DAI</option>
                                      <option value={process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE}>MUSE</option>
                                    </select>
                                    <input
                                      type="text"
                                      className="input input-primary"
                                      onChange={async e => {
                                        setTokenAmount(e.target.value);
                                      }}
                                      placeholder="Amount sent"
                                    />
                                    <button
                                      className="btn btn-large"
                                      onClick={async () => {
                                        await handleDepositToken();
                                      }}
                                      disabled={!Boolean(forwarderAddress != ethers.constants.AddressZero)}
                                    >
                                      Deposit Token
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="card  card-shadow ">
                            <div className="card card-title">Sign in</div>

                            <input
                              className="input input-bordered my-5 w-full"
                              type="text"
                              placeholder="Set UserName"
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                            />
                            <button
                              className="btn btn-large"
                              onClick={signIn}
                              disabled={userExists && withdrawalAddress != "" && userName != ""}
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
