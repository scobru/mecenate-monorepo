import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount, useDisconnect } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST, AuthType } from "./../sismo.config";
import { useTransactor } from "~~/hooks/scaffold-eth";
import Spinner from "~~/components/Spinner";
import { ProviderType } from "@lit-protocol/constants";
import {
  BaseProvider,
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  LitAuthClient,
  WebAuthnProvider,
  getProviderFromUrl,
  isSignInRedirect,
} from "@lit-protocol/lit-auth-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility, LitAccessControlConditionResource, newSessionCapabilityObject } from "@lit-protocol/auth-helpers";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { AuthMethod, AuthSig, ExecuteJsProps, IRelayPKP, PKPEthersWalletProp, SessionSigs } from "@lit-protocol/types";
import { getWalletAuthSig } from "../utils/lit/get-wallet-auth-sig";
import router from "next/router";

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
    if (pageState !== "verified") {
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
    }
  };

  /* *************************  Reset state **************************** */
  function resetApp() {
    window.location.href = "/";
  }

  /*  useEffect(() => {
    initializeState();
    if (!responseBytes) return;
    setPageState("responseReceived");
  }, [responseBytes]); */

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

  /* *************************  Lit PKPS **************************** */

  enum Views {
    SIGN_IN = "sign_in",
    HANDLE_REDIRECT = "handle_redirect",
    REQUEST_AUTHSIG = "request_authsig",
    REGISTERING = "webauthn_registering",
    REGISTERED = "webauthn_registered",
    AUTHENTICATING = "webauthn_authenticating",
    FETCHING = "fetching",
    FETCHED = "fetched",
    MINTING = "minting",
    MINTED = "minted",
    CREATING_SESSION = "creating_session",
    SESSION_CREATED = "session_created",
    ERROR = "error",
    DECRYPT = "decrypt",
  }

  const { disconnectAsync } = useDisconnect();

  const { isConnected, connector, address } = useAccount();
  const [litNodeClient, setLitNodeClient] = React.useState<LitNodeClient>();
  const [litAuthClient, setLitAuthClient] = React.useState<LitAuthClient>();
  const [currentProviderType, setCurrentProviderType] = React.useState<ProviderType>();
  const [authMethod, setAuthMethod] = React.useState<AuthMethod>();
  const [authSig, setAuthSig] = React.useState<AuthSig>();
  const [pkps, setPKPs] = React.useState<IRelayPKP[]>([]);
  const [view, setView] = useState<Views>(Views.SIGN_IN);
  const [currentPKP, setCurrentPKP] = React.useState<IRelayPKP>();
  const [sessionSigs, setSessionSigs] = React.useState<SessionSigs>();
  const [signature, setSignature] = React.useState<string>();
  const [recoveredAddress, setRecoveredAddress] = React.useState<string>();
  const [wallitDescription, setWallitDescription] = React.useState<string>();
  const [walletInstance, setWalletInstance] = React.useState<PKPEthersWalletProp>();
  const [message, setMessage] = useState<string>("Free the web!");
  const redirectUri = "https://localhost:3000";

  useEffect(() => {
    /**
     * Initialize LitNodeClient and LitAuthClient
     */
    async function initClients() {
      try {
        // Set up LitNodeClient and connect to Lit nodes
        const litNodeClient = new LitNodeClient({
          litNetwork: "serrano",
          debug: true,
        });
        await litNodeClient.connect();
        setLitNodeClient(litNodeClient);

        console.log("litNodeClient", litNodeClient);

        // Set up LitAuthClient
        const litAuthClient = new LitAuthClient({
          litRelayConfig: {
            relayApiKey: "test-api-key",
          },
          litNodeClient,
        });

        console.log("litAuthClient", litAuthClient);

        // Initialize providers
        litAuthClient.initProvider<GoogleProvider>(ProviderType.Google);
        litAuthClient.initProvider<DiscordProvider>(ProviderType.Discord);
        litAuthClient.initProvider<EthWalletProvider>(ProviderType.EthWallet);
        litAuthClient.initProvider<WebAuthnProvider>(ProviderType.WebAuthn);

        setLitAuthClient(litAuthClient);
      } catch (err) {
        console.error(err);
        setError(err);
        setView(Views.ERROR);
      }
    }

    if (!litNodeClient) {
      initClients();
    }
  }, [litNodeClient]);

  const handleRedirect = useCallback(
    async (providerName: string) => {
      setView(Views.HANDLE_REDIRECT);
      try {
        // Get relevant provider
        let provider: P;
        if (providerName === ProviderType.Google) {
          provider = litAuthClient?.getProvider(ProviderType.Google);
        } else if (providerName === ProviderType.Discord) {
          provider = litAuthClient?.getProvider(ProviderType.Discord);
        }
        setCurrentProviderType(providerName as ProviderType);

        // Get auth method object that has the OAuth token from redirect callback
        const authMethod: AuthMethod = await provider?.authenticate();
        setAuthMethod(authMethod);

        // Fetch PKPs associated with social account
        setView(Views.FETCHING);
        const pkps: IRelayPKP[] = await provider?.fetchPKPsThroughRelayer(authMethod);

        if (pkps.length > 0) {
          setPKPs(pkps);
        }

        const privateKey = process.env.NEXT_PUBLIC_SERVER_PRIVATE_KEY;

        const serverAuthSig = await getWalletAuthSig({
          privateKey: privateKey as string,
          chainId: 137,
        });

        const wallet = new PKPEthersWallet({
          pkpPubKey: currentPKP?.publicKey,
          controllerAuthSig: serverAuthSig,
          provider: provider,
        });

        //const _walletInstance: PKPEthersWalletProp = await wallet.init();

        setWalletInstance(wallet);
        console.log("walletInstance", wallet);
        setView(Views.FETCHED);
      } catch (err) {
        console.error(err);
        setError(err);
        setView(Views.ERROR);
      }

      // Clear url params once we have the OAuth token
      // Be sure to use the redirect uri route
      router.replace(window.location.pathname, undefined, { shallow: true });
    },
    [litAuthClient, router],
  );

  useEffect(() => {
    // Check if app has been redirected from Lit login server
    if (litAuthClient && !authMethod && isSignInRedirect(redirectUri)) {
      const providerName = getProviderFromUrl();
      handleRedirect(providerName!);
    }
  }, [litAuthClient, handleRedirect, authMethod]);

  async function authWithWallet(address: string, connector: Connector) {
    setView(Views.REQUEST_AUTHSIG);

    // Create a function to handle signing messages
    const signer = await connector.getSigner();

    const signAuthSig = async (message: string) => {
      const sig = await signer.signMessage(message);
      return sig;
    };

    // Get auth sig
    const provider = litAuthClient?.getProvider(ProviderType.EthWallet);
    const authMethod = await provider?.authenticate({
      address,
      signMessage: signAuthSig,
      chain: "baseGoerli",
    });

    setCurrentProviderType(ProviderType.EthWallet);
    setAuthMethod(authMethod);
    setAuthSig(JSON.parse(authMethod?.accessToken as string));

    // Fetch PKPs associated with eth wallet account
    setView(Views.FETCHING);
    const pkps: IRelayPKP[] = await provider?.fetchPKPsThroughRelayer(authMethod);
    if (pkps.length > 0) {
      setPKPs(pkps);
    }

    setView(Views.FETCHED);
  }

  async function mint() {
    setView(Views.MINTING);

    try {
      // Mint new PKP
      const provider = litAuthClient?.getProvider(currentProviderType!);
      const txHash: string = await provider?.mintPKPThroughRelayer(authMethod!);
      const response = await provider?.relay.pollRequestUntilTerminalState(txHash);
      if (response?.status !== "Succeeded") {
        throw new Error("Minting failed");
      }
      const newPKP: IRelayPKP = {
        tokenId: response.pkpTokenId!,
        publicKey: response.pkpPublicKey!,
        ethAddress: response.pkpEthAddress!,
      };

      // Add new PKP to list of PKPs
      const morePKPs: IRelayPKP[] = [...pkps, newPKP];
      setPKPs(morePKPs);

      const privateKey = process.env.NEXT_PUBLIC_SERVER_PRIVATE_KEY;

      const serverAuthSig = await getWalletAuthSig({
        privateKey: privateKey as string,
        chainId: 137,
      });

      const wallet = new PKPEthersWallet({
        pkpPubKey: newPKP?.publicKey,
        controllerAuthSig: serverAuthSig,
        provider: provider,
      });

      //const _walletInstance: PKPEthersWalletProp = await wallet.init();

      setWalletInstance(wallet);
      console.log("walletInstance", wallet);

      setView(Views.MINTED);
      setView(Views.CREATING_SESSION);

      // Get session sigs for new PKP
      await createSession(newPKP);
    } catch (err) {
      console.error(err);
      setError(err);
      setView(Views.ERROR);
    }
  }

  async function createSession(pkp: IRelayPKP) {
    setWallitDescription("");
    setView(Views.CREATING_SESSION);
    try {
      // Get session signatures

      const provider = litAuthClient?.getProvider(currentProviderType);

      // const sessionSigs = await provider?.getSessionSigs({
      //   pkpPublicKey: pkp.publicKey,
      //   authMethod,
      //   sessionSigsParams: {
      //     chain: chainName(),
      //     resources: [`litAction://*`],
      //   },
      // });

      setCurrentPKP(pkp);

      const litResource = new LitAccessControlConditionResource("*");

      console.log(authMethod);

      console.log(pkp);

      console.log(provider);

      console.log("Ciao");

      const sessionSigs = await provider?.getSessionSigs({
        pkpPublicKey: pkp?.publicKey as string,
        authMethod: {
          authMethodType: Number(authMethod?.authMethodType),
          accessToken: String(authMethod?.accessToken),
        },
        sessionSigsParams: {
          chain: "baseGoerli",
          resourceAbilityRequests: [
            {
              resource: litResource,
              ability: LitAbility.PKPSigning,
            },
          ],
          resources: [] as any[],
        },
        litNodeClient,
      });

      console.log(sessionSigs);

      setSessionSigs(sessionSigs);

      const privateKey = process.env.NEXT_PUBLIC_SERVER_PRIVATE_KEY;

      const serverAuthSig = await getWalletAuthSig({
        privateKey: privateKey as string,
        chainId: 84531,
      });

      const wallet = new PKPEthersWallet({
        pkpPubKey: pkp?.publicKey,
        controllerAuthSig: serverAuthSig,
        provider: provider,
      });

      //const _walletInstance: PKPEthersWalletProp = await wallet.init();

      setWalletInstance(wallet);
      console.log("walletInstance", wallet);

      setView(Views.SESSION_CREATED);
    } catch (err) {
      console.error(err);
      setError(err);
      setView(Views.ERROR);
    }
  }

  async function signMessageWithPKP() {
    try {
      const toSign = ethers.utils.arrayify(ethers.utils.hashMessage(message));
      const litActionCode = `
        const go = async () => {
          // this requests a signature share from the Lit Node
          // the signature share will be automatically returned in the response from the node
          // and combined into a full signature by the LitJsSdk for you to use on the client
          // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
          const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
        };
        go();
      `;
      // Sign message
      // @ts-ignore - complains about no authSig, but we don't need one for this action
      const results = await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs: sessionSigs,
        jsParams: {
          toSign: toSign,
          publicKey: currentPKP?.publicKey,
          sigName: "sig1",
        },
      });
      // Get signature
      const result = results.signatures["sig1"];
      const signature = ethers.utils.joinSignature({
        r: "0x" + result.r,
        s: "0x" + result.s,
        v: result.recid,
      });
      setSignature(signature);

      // Get the address associated with the signature created by signing the message
      const recoveredAddr = ethers.utils.verifyMessage(message, signature);
      setRecoveredAddress(recoveredAddr);
      console.log("recoveredAddr", recoveredAddr);
      // Check if the address associated with the signature is the same as the current PKP
      const verified = currentPKP?.ethAddress.toLowerCase() === recoveredAddr.toLowerCase();
      console.log("verified", verified);
      setVerified(verified);

      const authSig: AuthSig = {
        sig: signature,
        derivedVia: "web3.eth.personal.sign",
        signedMessage: message,
        address: recoveredAddr,
      };

      setView(Views.SESSION_CREATED);

      return authSig;
    } catch (err) {
      console.error(err);
      setError(err);
      setView(Views.ERROR);
    }
  }

  if (!litNodeClient) {
    return null;
  }

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20">
          <div className="flex items-center flex-col pt-10 text-center">
            {view === Views.ERROR && (
              <>
                <h1 className="text-4xl">🤖</h1>
                <p className="text-xl">{error.message}</p>
                <button
                  className="btn btn-primary my-5"
                  onClick={() => {
                    if (sessionSigs) {
                      setView(Views.SESSION_CREATED);
                    } else {
                      if (authMethod) {
                        setView(Views.FETCHED);
                      } else {
                        setView(Views.SIGN_IN);
                      }
                    }
                    setError(null);
                  }}
                >
                  Got it
                </button>
              </>
            )}
            {view === Views.SIGN_IN && (
              <>
                {/* <h1 className="text-8xl font-bold">WALLIT</h1> */}
                {/* Since eth wallet is connected, prompt user to sign a message or disconnect their wallet */}
                <>
                  {isConnected ? (
                    <>
                      {/* <div className="text-6xl font-bold mb-10">▣ WALLIT</div> */}

                      <button
                        className="btn btn-primary my-5"
                        disabled={!connector?.ready}
                        key={connector?.id}
                        onClick={async () => {
                          setError(null);
                          await authWithWallet(String(address), connector!);
                          //await handleConnectWallet({ connector });
                        }}
                      >
                        Sign with {connector?.name}
                      </button>
                      <button
                        className="btn btn-primary "
                        onClick={async () => {
                          setError(null);
                          await disconnectAsync();
                        }}
                      >
                        Disconnect wallet
                      </button>
                    </>
                  ) : (
                    <>
                      {/* If eth wallet is not connected, show all login options */}
                      <h1 className="animate-pulse text-lg">Connect Your Wallet First ⚠️</h1>
                      {/* <button className="btn btn-sm" onClick={authWithGoogle}>
                    Google
                  </button>
                  <button className="btn btn-sm" onClick={authWithDiscord}>
                    Discord
                  </button>
                  {connectors.map(connector => (
                    <button
                      className="btn btn-sm"
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={async () => {
                        setError(null);
                        await handleConnectWallet({ connector });
                      }}
                    >
                      {connector.name}
                    </button>
                  ))}
                  <button onClick={registerWithWebAuthn}>Register with WebAuthn</button> */}
                    </>
                  )}
                </>
              </>
            )}
            {view === Views.HANDLE_REDIRECT && (
              <>
                <h1>Verifying your identity...</h1>
              </>
            )}
            {view === Views.REQUEST_AUTHSIG && (
              <>
                <h1 className="text-2xl font-bold animate-ping">Check your wallet</h1>
              </>
            )}
            {view === Views.REGISTERING && (
              <>
                <h1>Register your passkey</h1>
                <p>Follow your browser&apos;s prompts to create a passkey.</p>
              </>
            )}
            {view === Views.REGISTERED && (
              <>
                <h1>Minted!</h1>
                <p>Authenticate with your newly registered passkey. Continue when you&apos;re ready.</p>
                <button onClick={authenticateWithWebAuthn}>Continue</button>
              </>
            )}
            {view === Views.AUTHENTICATING && (
              <>
                <h1>Authenticate with your passkey</h1>
                <p>Follow your browser&apos;s prompts to create a passkey.</p>
              </>
            )}
            {view === Views.FETCHING && (
              <>
                <h1 className="text-2xl font-bold animate-ping">Fetching your PKPs...</h1>
              </>
            )}
            {view === Views.FETCHED && (
              <>
                {pkps.length > 0 ? (
                  <>
                    <h1 className="text-xl">Select a PKP to continue</h1>
                    {/* Select a PKP to create session sigs for */}
                    <div>
                      {pkps.map(pkp => (
                        <button key={pkp.ethAddress} onClick={async () => await createSession(pkp)}>
                          {pkp.ethAddress}
                        </button>
                      ))}
                    </div>
                    <hr></hr>
                    {/* Or mint another PKP */}
                    <p>or mint another one:</p>
                    <button className="btn btn-primary" onClick={mint}>
                      Mint another PKP
                    </button>
                  </>
                ) : (
                  <>
                    <h1>Mint a PKP to continue</h1>
                    <button className="btn btn-primary" onClick={mint}>
                      Mint a PKP
                    </button>
                  </>
                )}
              </>
            )}
            {view === Views.MINTING && (
              <>
                <h1 className="text-2xl font-bold animate-ping">Minting your PKP...</h1>
              </>
            )}
            {view === Views.MINTED && (
              <>
                <h1 className="text-2xl font-bold animate-bounce">Minted!</h1>
              </>
            )}
            {view === Views.CREATING_SESSION && (
              <>
                <h1 className="text-2xl font-bold animate-zoom">Saving your session...</h1>
              </>
            )}
            {view === Views.SESSION_CREATED && <></>}
          </div>
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
                    signature={SIGNATURE_REQUEST}
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
                  <div className="status-wrapper">
                    <button
                      className="btn btn-primary bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
