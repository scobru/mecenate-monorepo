import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, Wallet, ethers } from "ethers";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST } from "../sismo.config";
import { useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import Spinner from "~~/components/Spinner";
import { notification } from "~~/utils/scaffold-eth";
import { toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import Web3 from "web3";
import MecenateHelper from "@scobru/crypto-ipfs";
import type { IBaseProvider, IProvider } from "@web3auth/base";
import { useWeb3auth } from "../components/Web3authProvider"; // Aggiusta il percorso in base alla tua struttura di cartelle
import { useAppStore } from "~~/services/store/store";

const Identity: NextPage = () => {
  const { chain } = useNetwork();
  const { data: customSigner } = useSigner();
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] = React.useState<SismoConnectVerifiedResult>();
  const [sismoConnectResponse, setSismoConnectResponse] = React.useState<SismoConnectResponse>();
  const [responseBytes, setResponseBytes] = React.useState<string>();
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [pageState, setPageState] = React.useState<string>("init");
  const [error, setError] = React.useState<string>();
  const [fee, setFee] = React.useState(0);

  const deployedContractUser = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateUsers");
  const deployedContractTreasury = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateTreasury");
  const deployedContractVault = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateVault");

  const [userExists, setUserExists] = React.useState<boolean>(false);
  const [verified, setVerified] = React.useState<any>(null);
  const [userName, setUserName] = React.useState<any>(null);
  const [withdrawalAddress, setWithdrawalAddress] = React.useState<any>("");
  const [password, setPassword] = React.useState<any>(null);
  const [confirmPassword, setConfirmPassword] = React.useState<any>(null);
  const [userData, setUserData] = React.useState<any>(null);

  const [pubKey, setPubKey] = React.useState<any>(null);
  const publicProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const runTx = useTransactor();

  const { signer } = useAppStore();

  console.log(signer);
  let UsersAddress!: string;
  let UsersAbi: ContractInterface[] = [];

  let treasuryAddress!: string;
  let treasuryAbi: ContractInterface[] = [];

  let vaultAddress!: string;
  let vaultAbi: ContractInterface[] = [];

  if (deployedContractUser) {
    ({ address: UsersAddress, abi: UsersAbi } = deployedContractUser);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  if (deployedContractVault) {
    ({ address: vaultAddress, abi: vaultAbi } = deployedContractVault);
  }

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>pre");
    if (el) {
      el.innerHTML = JSON.parse(JSON.stringify(args || {}, null, 2));
    }
  }

  async function mintDai() {
    const daiAbi = ["function mint(address _to, uint256 _amount) public"];
    const daiContract = new ethers.Contract(String(process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE), daiAbi, signer);
    runTx(daiContract.mint(await signer?.getAddress(), ethers.utils.parseEther("1")), signer);
  }

  async function mintMuse() {
    const museAbi = ["function mint(address _to, uint256 _amount) public"];
    const daiContract = new ethers.Contract(String(process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE), museAbi, signer);
    runTx(daiContract.mint(await signer?.getAddress(), ethers.utils.parseEther("1")), signer);
  }

  const usersCtx = useContract({
    address: UsersAddress,
    abi: UsersAbi,
    signerOrProvider: signer,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer,
  });

  const signIn = async () => {
    console.log("Signing in...");
    runTx(usersCtx?.registerUser(responseBytes, toUtf8Bytes(String(pubKey))), signer as Signer);
  };

  const changePublicKey = async () => {
    console.log("Signing in...");
    runTx(usersCtx?.changePublicKey(responseBytes, toUtf8Bytes(String(pubKey))), signer as Signer);
  };

  const getContractData = async function getContractData() {
    if (signer) {
      const fee = await treasury?.fixedFee();
      setFee(fee);
    }
  };

  const checkIfUserExists = async function checkIfUserExists() {
    if (!signer) return;
    const _userExists = await usersCtx?.checkifUserExist(await signer?.getAddress());
    console.log("User exists", _userExists);
    setUserExists(_userExists);
    if (_userExists && signer) {
      const user = await usersCtx?.getUserMetadata(await signer?.getAddress());
      console.log("User", user);
      setUserData(user);
    }
  };

  const resetLocalStorage = async function resetLocalStorage() {
    localStorage.removeItem("verified");
    localStorage.removeItem("sismoData");
    localStorage.removeItem("sismoResponse");
  };

  // Funzione per inizializzare lo stato
  const initializeState = async () => {
    await getContractData();

    const sismoDataFromLocalStorage = localStorage.getItem("sismoData");
    const sismoResponseFromLocalStorage = localStorage.getItem("sismoResponse");
    const verifiedFromLocalStorage = localStorage.getItem("verified");

    if (sismoDataFromLocalStorage) {
      setSismoData(JSON.parse(sismoDataFromLocalStorage));
    }

    if (verifiedFromLocalStorage) {
      setVerified(verifiedFromLocalStorage);
    }
    if (sismoResponseFromLocalStorage) {
      setResponseBytes(sismoResponseFromLocalStorage);
    }

    const pageStateToSet = verifiedFromLocalStorage === "verified" ? "verified" : "init";
    setPageState(pageStateToSet);
  };

  /* *************************  Reset state *****************************/
  function resetApp() {
    window.location.href = "/";
  }

  async function createPair() {
    if (password != confirmPassword) {
      notification.error("Password is not the same");
      return;
    }

    const kp = MecenateHelper.crypto.asymmetric.keyPair();

    if (!kp) return;

    setPubKey(kp?.publicKey.toString());
    const keyPairJSON = JSON.stringify(kp);

    console.log("KeyPairJson", keyPairJSON);

    // encrypt KeyPair With password and save into db
    if (typeof keyPairJSON === "string" && keyPairJSON !== null && keyPairJSON !== undefined) {
      const encryptedKeyPair = await MecenateHelper.crypto.aes.encryptObject(kp, password);
      console.log("await signer?.getAddress()", await signer?.getAddress());
      console.log(encryptedKeyPair);

      const verifiedResult = await fetch("/api/storeKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: await signer?.getAddress(),
          salt: encryptedKeyPair.salt,
          iv: encryptedKeyPair.iv,
          ciphertext: encryptedKeyPair.ciphertext,
        }),
      });

      console.log(verifiedResult);
    } else {
      // handle the case where keypairJSON is not a string, or is null or undefined
      notification.error("Error creating key pair");
    }

    notification.success("Key pair created");

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
          <h3 className="text-lg font-medium">Save Your Key Pair!</h3>
        </div>
        <div className="mt-2 mb-4 text-sm">
          <div>
            <p>
              PUBLIC KEY : <br /> {JSON.parse(keyPairJSON).publicKey.toString()}
            </p>
            <p>
              SECRET KEY : <br /> {JSON.parse(keyPairJSON).secretKey.toString()}
            </p>
          </div>
        </div>
        <div className="flex">
          <button
            type="button"
            className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={async () => {
              const data = {
                publicKey: await JSON.parse(keyPairJSON).publicKey.toString(),
                secretKey: await JSON.parse(keyPairJSON).secretKey.toString(),
              };
              navigator.clipboard.writeText(JSON.stringify(data));
              notification.success("Public key copied to clipboard");
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

    const data = {
      publicKey: await JSON.parse(keyPairJSON).publicKey.toString(),
      secretKey: await JSON.parse(keyPairJSON).secretKey.toString(),
    };

    downloadFile({
      data: JSON.stringify(data),
      fileName: (await signer?.getAddress()) + "_keyPair.json",
      fileType: "text/json",
    });

    uiConsole(JSON.parse(JSON.stringify(keyPairJSON)));
  }

  async function decryptPair() {
    const walletAddress = await signer?.getAddress();

    // Verifica che walletAddress sia stato ottenuto correttamente
    if (!walletAddress) {
      // Gestisci l'errore come preferisci
      console.error("Wallet address not available");
      return;
    }

    // Esegui la richiesta fetch
    const url = `/api/storeKey?wallet=${encodeURIComponent(walletAddress)}`;

    // Esegui la richiesta fetch
    const verifiedResult = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Converti la risposta in JSON
    const resultJson = await verifiedResult.json();

    const parsedResult = JSON.parse(JSON.stringify(resultJson.data));

    const decryptedPair = await MecenateHelper.crypto.aes.decryptObject(
      parsedResult.salt,
      parsedResult.iv,
      parsedResult.ciphertext,
      password,
    );

    uiConsole(JSON.parse(JSON.stringify(decryptedPair)));

    // Mostra una notifica con il risultato

    // Gestisci ulteriormente la risposta qui, se necessario
  }

  const downloadFile = ({ data, fileName, fileType }: { data: BlobPart; fileName: string; fileType: string }): void => {
    if (!data || !fileName || !fileType) {
      throw new Error("Invalid inputs");
    }

    const blob = new Blob([data], { type: fileType });
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);

    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    a.dispatchEvent(clickEvt);
    a.remove();
  };

  /*   useEffect(() => {
    const run = async () => {
      console.log("Initializing signer...");
      try {
        let _signer;
        const cachedAdapter = String(localStorage.getItem("Web3Auth-cachedAdapter"));

        if (cachedAdapter !== "metamask") {
          const pk = localStorage.getItem("pk");
          if (pk) {
            _signer = new ethers.Wallet(pk, publicProvider);
            console.log("Signer", _signer);
          } else {
            throw new Error("Private key not found in local storage.");
          }
        } else {
          const webauthProvider: IProvider = JSON.parse(String(localStorage.getItem("web3AuthProvider"))) as IProvider;
          console.log("webauthProvider", webauthProvider);
          const signer = JSON.parse(String(localStorage.getItem("signer")));
          console.log("signer", signer);
          const ethersProvider = new ethers.providers.Web3Provider(webauthProvider as IBaseProvider<unknown>);
          console.log("ethersProvider", ethersProvider);

          if (signer) {
            _signer = signer;
            console.log("Signer", signer);
          } else {
            throw new Error("Invalid web3Auth object in local storage.");
          }
        }
        setSigner(_signer);
        setawait signer?.getAddress()(String(localStorage.getItem("accountAddress")));
      } catch (error) {
        console.error("Failed to initialize signer:", error);
      }

      initializeState();
    };

    run();
  }, []); */

  useEffect(() => {
    if (signer) {
      initializeState();
    }
  }, [signer]);

  useEffect(() => {
    if (signer) {
      checkIfUserExists();
    }
  }, [signer]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <h1 className="text-2xl  mb-8 my-10 font-heading  ">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          JOIN MECENATE{" "}
        </a>
        WITHOUT REVEALING YOUR IDENTITY
      </h1>
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col  items-center mb-20">
          {/*  <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8 mt-10">IDENTITY</h1>
            <p className="text-2xl  ">Verify your identity with zk-proof</p>
            <p className="text-xl  ">Create a Key Pair and sign-in</p>
          </div> */}
          <div className="text-center w-full">
            {pageState == "init" && !sismoData ? (
              <>
                <div className="text-center sm:p-2 lg:p-4">
                  <SismoConnectButton
                    config={CONFIG}
                    auths={AUTHS}
                    signature={SIGNATURE_REQUEST}
                    text="Join With Sismo"
                    onResponse={async (response: SismoConnectResponse) => {
                      console.log("Verify");

                      setSismoConnectResponse(response);

                      setPageState("verifying");
                      try {
                        const verifiedResult = await fetch("/api/verify", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...response,
                          }),
                        });

                        const data = await verifiedResult.json();

                        if (verifiedResult.ok) {
                          setSismoConnectVerifiedResult(data);
                          localStorage.setItem("sismoData", JSON.stringify(await data));
                          setPageState("verified");
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
                    onResponseBytes={async (responseBytes: string) => {
                      setResponseBytes(responseBytes);
                      localStorage.setItem("sismoResponse", responseBytes);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  {pageState == "verifying" ? (
                    <div className="text-center items-center flex flex-row gap-3">
                      <Spinner></Spinner>{" "}
                      <div className="text-blue-500 text-center font-semibold">Verifying ZK Proofs...</div>
                    </div>
                  ) : (
                    <>
                      {Boolean(error) ? (
                        <div className="text-red-500 font-bold">Error verifying ZK Proofs: {error}</div>
                      ) : (
                        <div className="flex flex-col ">
                          <div className="status-wrapper">
                            <button
                              className="btn btn-custom  hover:bg-red-700  font-semibold py-2 px-4 hover:text-white focus:outline-none focus:shadow-outline"
                              onClick={() => {
                                window.location.href = "/user";
                                resetLocalStorage();
                                resetApp();
                              }}
                            >
                              {" "}
                              RESET ZKP{" "}
                            </button>
                          </div>
                          <div className="font-headgin text-sl">Go to Connect</div>
                          {userExists && userData && (
                            <div>
                              {userData[0] && (
                                <div className="card card-shadow break-all">
                                  <div className="card card-title font-semibold font-heading">User Data</div>
                                  <div className="card-body">
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                      <div className="font-semibold">Address:</div>
                                      <div>{userData[0]}</div>
                                      <div className="font-semibold">Encrypted Sismo VaultID:</div>
                                      <div>{userData[1]}</div>
                                      <div className="font-semibold">Public Key:</div>
                                      <div>{toUtf8String(userData[2])}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div>
                                <div className="card  card-shadow  ">
                                  <div className="text-center font-heading text-xl">Faucet mDAI/MUSE</div>
                                  <button
                                    className="btn btn-custom"
                                    onClick={async () => {
                                      await mintDai();
                                    }}
                                  >
                                    Mint test DAI
                                  </button>
                                  <button
                                    className="btn btn-custom"
                                    onClick={async () => {
                                      await mintMuse();
                                    }}
                                  >
                                    Mint MUSE
                                  </button>
                                </div>
                                <div className="card  card-shadow mb-10">
                                  <div className="text-center font-heading text-xl">Create Key Pair</div>
                                  <div>
                                    <input
                                      type="password"
                                      name="password"
                                      id="password"
                                      placeholder="Password"
                                      className="input input-text my-5"
                                      onChange={e => {
                                        setPassword(e.target.value);
                                      }}
                                    />
                                    <input
                                      type="password"
                                      name="password"
                                      id="password"
                                      placeholder="Re-type"
                                      className="input input-text my-5"
                                      onChange={e => {
                                        setConfirmPassword(e.target.value);
                                      }}
                                    />
                                    <button className="btn btn-custom" onClick={createPair}>
                                      Create{" "}
                                    </button>
                                    <div id="console" className="p-4 break-all">
                                      <pre className="whitespace-pre-line mt-3"></pre>
                                    </div>
                                    <button className="btn btn-custom" onClick={changePublicKey}>
                                      Change pubKey{" "}
                                    </button>
                                  </div>
                                </div>
                                <div className="card  card-shadow mb-10">
                                  <div className="text-center font-heading text-xl">Recover Key Pair</div>
                                  <div>
                                    <input
                                      type="password"
                                      name="password"
                                      id="password"
                                      placeholder="Password"
                                      className="input input-text my-5"
                                      onChange={e => {
                                        setPassword(e.target.value);
                                      }}
                                    />
                                    <button className="btn btn-custom" onClick={decryptPair}>
                                      Recover{" "}
                                    </button>
                                    <div id="console" className="p-4 break-all">
                                      <pre className="whitespace-pre-line mt-3"></pre>
                                    </div>
                                  </div>
                                </div>
                                <div className="card  card-shadow mb-10">
                                  <div className="text-center font-heading text-xl">Sign in</div>
                                  <button
                                    className="btn btn-custom"
                                    onClick={signIn}
                                    disabled={userExists && withdrawalAddress != "" && userName != ""}
                                  >
                                    Join{" "}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
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
