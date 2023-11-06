/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
"use client";
import { FaUser, FaWallet, FaMoneyBillAlt, FaKey, FaSignOutAlt } from "react-icons/fa";

import { CHAIN_NAMESPACES, IAdapter, IProvider } from "@web3auth/base";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { Web3Auth } from "@web3auth/modal";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";
// import RPC from ".api/ethersRPC"; // for using ethers.js

// Plugins
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

// Adapters
// import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { WalletConnectV2Adapter, getWalletConnectV2Settings } from "@web3auth/wallet-connect-v2-adapter";
import { useEffect, useState } from "react";

import RPC from "../utils/ethersRPC"; // for using web3.js
import { Wallet, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import { NextPage } from "next";
import Spinner from "~~/components/Spinner";

import { useWeb3auth } from "../components/Web3authProvider"; // Aggiusta il percorso in base alla tua struttura di cartelle
import { useAppStore } from "~~/services/store/store";

const clientId = "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk"; // get from https://dashboard.web3auth.io

const Connect: NextPage = () => {
  const {
    login,
    logout,
    getPrivateKey,
    getBalance,
    getAccounts,
    setLoggedIn,
    loggedIn,
    setLoading,
    loading,
    provider,
    setProvider,
    web3auth,
    setWeb3auth,
    torusPlugin,
    setTorusPlugin,
  } = useWeb3auth();

  const { signer, setSigner } = useAppStore(state => state);

  const publicProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x14a33",
            rpcTarget: "https://goerli.base.org", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
          // uiConfig refers to the whitelabeling options, which is available only on Growth Plan and above
          // Please remove this parameter if you're on the Base Plan
          uiConfig: {
            appName: "Mecenate Protocol",
            mode: "light",
            //loginMethodsOrder: ["apple", "google", "twitter"],
            logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
            logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
            loginGridCol: 3,
            primaryButton: "socialLogin", // "externalLogin" | "socialLogin" | "emailLogin"
            displayErrorsOnModal: true,
          },
          web3AuthNetwork: "cyan",
        });

        // plugins and adapters are optional and can be added as per your requirement
        // read more about plugins here: https://web3auth.io/docs/sdk/web/plugins/

        // adding torus wallet connector plugin

        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: {
            buttonPosition: "bottom-left",
          },
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: true, colors: { primary: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
            useWalletConnect: true,
            enableLogging: true,
          },
        });
        setTorusPlugin(torusPlugin);
        await web3auth.addPlugin(torusPlugin);

        // read more about adapters here: https://web3auth.io/docs/sdk/web/adapters/

        // adding wallet connect v1 adapter
        // const walletConnectV1Adapter = new WalletConnectV1Adapter({
        //   adapterSettings: {
        //     bridge: "https://bridge.walletconnect.org",
        //   },
        //   clientId,
        // });

        // web3auth.configureAdapter(walletConnectV1Adapter);

        // adding wallet connect v2 adapter
        const defaultWcSettings = await getWalletConnectV2Settings("eip155", [1], "04309ed1007e77d1f119b85205bb779d");
        const walletConnectV2Adapter = new WalletConnectV2Adapter({
          adapterSettings: { ...defaultWcSettings.adapterSettings },
          loginSettings: { ...defaultWcSettings.loginSettings },
        });

        web3auth.configureAdapter(walletConnectV2Adapter as any);

        // adding metamask adapter

        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: "cyan",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x14a33",
            rpcTarget: "https://goerli.base.org", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        });

        /* const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: "cyan",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x1",
            rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        });

        
        // we can change the above settings using this function
        metamaskAdapter.setAdapterSettings({
          sessionTime: 86400, // 1 day in seconds
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x14a33",
            rpcTarget: "https://goerli.base.org", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
          web3AuthNetwork: "cyan",
        }); */

        // it will add/update  the metamask adapter in to web3auth class
        web3auth.configureAdapter(metamaskAdapter as any);

        const torusWalletAdapter = new TorusWalletAdapter({
          clientId,
        });

        // it will add/update  the torus-evm adapter in to web3auth class
        web3auth.configureAdapter(torusWalletAdapter as unknown as IAdapter<unknown>);

        setWeb3auth(web3auth);
        setProvider(web3auth.provider as IProvider);
        setLoading(false);

        await web3auth.initModal();

        const rpc = new RPC(web3auth?.provider as IProvider);
        const account = await rpc.getAccounts();
        const accountAddress = account;

        if (web3auth?.status === "connected") {
          setLoggedIn(true);
          createWallet();
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    console.log(web3auth?.status);
    if (web3auth?.status == "connected") {
      setLoggedIn(true);
      getPrivateKey();
      setTorusPlugin(torusPlugin)
    } else if (web3auth?.status == "not_ready") {
      setLoggedIn(false);
    }
  }, [loading, loggedIn, web3auth?.status]);

  const createWallet = async () => {
    const cachedAdapter = web3auth?.cachedAdapter;
    if (cachedAdapter == "metamask" && web3auth && web3auth.provider) {
      console.log("metamask");
      const rpc = new RPC(web3auth?.provider);
      const ethersProvider = new ethers.providers.Web3Provider(web3auth?.provider);
      setSigner(ethersProvider.getSigner());
      const signer = ethersProvider.getSigner();
      console.log(web3auth?.provider);
    } else if (cachedAdapter == "openlogin" && web3auth?.provider) {
      const rpc = new RPC(web3auth?.provider);
      const privateKey = await rpc.getPrivateKey();
      const wallet = new Wallet(String(privateKey), publicProvider);
      setSigner(wallet);
    }
  };

  /* const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    localStorage.setItem("Web3Auth-loggedIn", "true");
  }; */

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const showWCM = async () => {
    if (!torusPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    torusPlugin.showWalletConnectScanner();
    uiConsole();
  };

  const initiateTopUp = async () => {
    if (!torusPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    torusPlugin.initiateTopup("moonpay", {
      selectedAddress: "0x8cFa648eBfD5736127BbaBd1d3cAe221B45AB9AF",
      selectedCurrency: "USD",
      fiatValue: 100,
      selectedCryptoCurrency: "ETH",
      chainNetwork: "mainnet",
    });
  };

  const getChainId = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth.provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const addChain = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const newChain = {
      chainId: "0x5",
      displayName: "Goerli",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Goerli",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_goerli",
      blockExplorer: "https://goerli.etherscan.io",
    };

    await web3auth?.addChain(newChain);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    await web3auth?.switchChain({ chainId: "0x5" });
    uiConsole("Chain Switched");
  };

  const sendTransaction = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>pre");
    if (el) {
      el.innerHTML = JSON.parse(JSON.stringify(args || {}, null, 2));
    }
  }

  if (loading) {
    return (
      <div className="text-center my-10 mx-auto">
        <Spinner />
      </div>
    );
  }

  const loggedInView = (
    <>
      <div className="flex flex-auto flex-wrap gap-4 text-heading  ">

        {/* {web3auth?.cachedAdapter !== "metamask" && (
          <div>
            <button onClick={showWCM} className="link link-hover flex items-center" disabled={Boolean(torusPlugin)}>
              <FaWallet className="mr-2" />
              Wallet Connect
            </button>
            <button onClick={initiateTopUp} className="link link-hover flex items-center" disabled={torusPlugin}>
              <FaMoneyBillAlt className="mr-2" />
              TopUp Wallet
            </button>
          </div>
        )} */}

        <button onClick={getAccounts} className="link link-hover flex items-center text-lg">
          <FaUser className="mr-2" />
          Get Accounts
        </button>
        <button onClick={getBalance} className="link link-hover flex items-center text-lg">
          <FaMoneyBillAlt className="mr-2" />
          Get Balance
        </button>
        <button onClick={getPrivateKey} className="link link-hover flex items-center text-lg">
          <FaKey className="mr-2" />
          Get Private Key
        </button>
        {/* <button onClick={sendTransaction} className="link link-hover flex items-center">
          <FaKey className="mr-2" />
          Send Tx
        </button> */}
        <button onClick={logout} className="link link-hover flex items-center text-lg">
          <FaSignOutAlt className="mr-2" />
          Log Out
        </button>
      </div>
      <div id="console" className="p-4 break-all">
        <pre className="whitespace-pre-line mt-3"></pre>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="btn btn-custom">
      Login
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-heading no-border bg-gradient-to-tl from-blue-950 to-slate-950 ">
      <h1 className="text-2xl font-light mb-8 ">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          CREATE YOUR ADDRESS{" "}
        </a>
        WITH YOUR SOCIAL ACCOUNT
      </h1>

      <div className="p-8 rounded-lg shadow-lg w-full max-w-lg mb-8 text-left justify-center bg-gradient-to-br from-blue-950 to-slate-700 opacity-80">
        {loggedIn ? loggedInView : unloggedInView}
      </div>
    </div>
  );
};

export default Connect;
