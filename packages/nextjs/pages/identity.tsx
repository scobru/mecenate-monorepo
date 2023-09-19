import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST, AuthType } from "./../sismo.config";
import { useTransactor } from "~~/hooks/scaffold-eth";
import Spinner from "~~/components/Spinner";
import crypto from "crypto";
import { decodeAbiParameters, encodeAbiParameters } from "viem";

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
  const [customPK, setCustomPK] = React.useState<any>(null);
  const [ethWallet, setEthWallet] = React.useState<any>(null);
  const [wallets, setWallets] = React.useState<any[]>([]);

  const customWallet = new ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);

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

  let vaultAddress!: string;
  let vaultAbi: ContractInterface[] = [];

  if (deployedContractVault) {
    ({ address: vaultAddress, abi: vaultAbi } = deployedContractVault);
  }

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

  const identity = useContract({
    address: identityAddress,
    abi: identityAbi,
    signerOrProvider: customWallet || provider,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: customWallet || provider,
  });

  async function signIn() {
    const iface = new ethers.utils.Interface(deployedContractUser?.abi as any[]);
    const data = iface.encodeFunctionData("registerUser", [
      sismoResponse,
      keccak256(String(vaultCtx?.address)),
      userName,
    ]);
    console.log(sismoData?.auths[0]?.userId);
    txData(vaultCtx?.execute(usersCtx?.address, data, 0, keccak256(String(sismoData?.auths[0]?.userId))));
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

    console.log("pageState", pageState);
    const sismoDataFromLocalStorage = localStorage.getItem("sismoData");
    const verifiedFromLocalStorage = localStorage.getItem("verified");
    const sismoResponseFromLocalStorage = localStorage.getItem("sismoResponse");
    const ethWalletFromLocalStorage = localStorage.getItem("ethWallet");

    if (sismoDataFromLocalStorage) {
      setSismoData(JSON.parse(sismoDataFromLocalStorage));
    }

    if (verifiedFromLocalStorage) {
      setVerified(verifiedFromLocalStorage);
    }
    if (sismoResponseFromLocalStorage) {
      setSismoResponse(sismoResponseFromLocalStorage);
    }

    if (ethWalletFromLocalStorage) {
      setEthWallet(JSON.parse(ethWalletFromLocalStorage));
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

  /* *************************  Helpers *********************/
  function encryptMessage(secretKey: string, message: string): string {
    const algorithm = "aes-256-cbc"; // Algoritmo di cifratura
    const key = crypto.createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta
    const iv = crypto.randomBytes(16); // Vettore di inizializzazione casuale

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Concatenare il vettore di inizializzazione e il messaggio cifrato
    return iv.toString("hex") + encrypted;
  }

  function decryptMessage(secretKey: string, encryptedMessage: string): string {
    const algorithm = "aes-256-cbc"; // Algoritmo di cifratura
    const key = crypto.createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta

    // Separare il vettore di inizializzazione dal messaggio cifrato
    const iv = Buffer.from(encryptedMessage.slice(0, 32), "hex");
    const encrypted = encryptedMessage.slice(32);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
  /* *************************  Account Abstraction *********************/

  const downloadObjectAsJson = (exportObj: any, exportName: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  async function addWallet(vaultId: string, address: string, encryptedPK: string) {
    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: vaultId,
          address: address,
          encryptedPK: encryptedPK,
        }),
      });

      // Parse JSON data from the HTTP response
      const data = await response.json();

      if (response.status === 201) {
        console.log("Successfully added the wallet:", data);
      } else {
        console.error("Failed to add the wallet:", data.error);
      }

      return data;
    } catch (error) {
      console.error("An error occurred while fetching:", error);
    }
  }

  const [selectedAddress, setSelectedAddress] = React.useState<string | null>(null);

  function filterAddressesByVaultId(data, vaultId) {
    return data.filter(item => item.vaultId === vaultId).map(item => item.address);
  }

  const generateETHWallet = async (): Promise<any> => {
    try {
      const ethWallet = await ethers.Wallet.createRandom(provider);
      setEthWallet(ethWallet);
      const privateKey = ethWallet.privateKey;

      const wallet = {
        address: ethWallet.address,
        key: privateKey,
      };

      downloadObjectAsJson(wallet, ethWallet.address);

      const encyptedVaultId = keccak256(sismoData?.auths[0].userId);
      const encryptedPK = encryptMessage(sismoData?.auths[0].userId, privateKey);
      await addWallet(encyptedVaultId, ethWallet.address, encryptedPK);

      localStorage.setItem("ethWallet", JSON.stringify(wallet));

      return ethWallet.address;
    } catch (error) {
      console.error("An error occurred:", error);
      return null;
    }
  };

  const restoreWalletFromPK = async (): Promise<any> => {
    try {
      if (!customPK) {
        const pk = localStorage.getItem("ethWallet");
        const ethWallet = new ethers.Wallet(pk.privateKey as string, provider);

        const wallet = {
          address: ethWallet.address,
          key: pk,
        };

        setEthWallet(wallet);

        return ethWallet;
      } else {
        const ethWallet = new ethers.Wallet(customPK, provider);
        const wallet = {
          address: ethWallet.address,
          key: customPK,
        };
        setEthWallet(wallet);
        localStorage.setItem("ethWallet", JSON.stringify(ethWallet));
        console.log("Wallet restored with custom PK");
        return ethWallet;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return null;
    }
  };

  /* *************************  Reset state *****************************/
  function resetApp() {
    window.location.href = "/";
  }

  useEffect(() => {
    initializeState();
    setPageState("verified");
  }, [responseBytes]);

  useEffect(() => {
    initializeState();
  }, []);
  useEffect(() => {
    let isMounted = true; // flag to keep track of component mounted state

    // your async operations
    async function fetchData() {
      if (isMounted) {
        // set state only if component is still mounted
        const data = await initializeState();
      }
    }

    fetchData();

    return () => {
      isMounted = false; // cleanup toggles mounted flag
    };
  }, []);

  useEffect(() => {
    // Esegui la chiamata API quando il componente viene montato
    async function fetchWallets() {
      try {
        const res = await fetch("/api/read");
        if (res.ok) {
          const data = await res.json();
          setWallets(data);
        } else {
          console.error("Errore durante il recupero dei dati.");
        }
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      }
    }

    fetchWallets();
  }, []);

  const signMessage = () => {
    if (!vaultAddress) return;
    return encodeAbiParameters([{ type: "bytes32", name: "_to" }], [keccak256(String(vaultAddress)) as `0x${string}`]);
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
                <div className="text-center">
                  <SismoConnectButton
                    config={CONFIG}
                    auths={AUTHS}
                    signature={{ message: String(signMessage()) }}
                    text="Join With Sismo"
                    disabled={!signer}
                    onResponse={async (response: SismoConnectResponse) => {
                      setSismoConnectResponse(response);
                      setPageState("verifying");
                      try {
                        const verifiedResult = await fetch("/api/verify", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
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
                  <br></br>
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
                              className="btn btn-primary my-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
                          <div className="mt-10">
                            <input
                              className="input input-bordered my-5 w-full"
                              type="text"
                              placeholder="Set UserName"
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                            />
                            <button
                              className="btn btn-primary w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={signIn}
                              /* disabled={userExists} */
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
