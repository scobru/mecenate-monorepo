import React, { createContext, use, useContext, useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { IProvider } from "@web3auth/base";
import { formatEther, id } from "ethers/lib/utils.js";
import { Signer, Wallet, ethers } from "ethers";

import { CHAIN_NAMESPACES, IAdapter } from "@web3auth/base";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";
import { useAppStore } from "~~/services/store/store";

// Plugins
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

// Adapters
// import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { WalletConnectV2Adapter, getWalletConnectV2Settings } from "@web3auth/wallet-connect-v2-adapter";
import RPC from "../utils/ethersRPC"; // for using web3.js

interface IWeb3authContext {
  signer: Signer | null;
  setSigner: (signer: ethers.Signer) => void;
  login: () => void;
  logout: () => void;
  web3auth: Web3Auth | null;
  provider: IProvider | null;
  getBalance: () => void;
  getPrivateKey: () => void;
  getAccounts: () => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setLoading: (loading: boolean) => void;
  loggedIn: boolean;
  loading: boolean;
  setProvider: (provider: IProvider) => void;
  torusPlugin: any;
  setTorusPlugin: (torusPlugin: any) => void;
  setWeb3auth: (web3auth: Web3Auth) => void;
  createWallet: () => void;
}

export const Web3authContext = createContext<IWeb3authContext | undefined>(undefined);

export const useWeb3auth = () => {
  const context = useContext(Web3authContext);
  if (!context) {
    throw new Error("useWeb3auth must be used within a Web3authProvider");
  }
  return context;
};

export const Web3authProvider: React.FC = (children: any) => {
  const { signer, setSigner } = useAppStore();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [torusPlugin, setTorusPlugin] = useState<TorusWalletConnectorPlugin | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ethersProvider, setEthersProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const publicProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const clientId = "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk"; // get from https://dashboard.web3auth.io

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
        await createWallet();

        setProvider(web3auth.provider as IProvider);
        setLoading(false);

        await web3auth.initModal();

        const rpc = new RPC(web3auth?.provider as IProvider);
        const account = await rpc.getAccounts();
        const accountAddress = account;

        if (accountAddress) setLoggedIn(true);

        if (web3auth?.status === "connected") {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();

    const savedLoggedInStatus = localStorage.getItem("loggedIn");
    if (savedLoggedInStatus) {
      setLoggedIn(JSON.parse(savedLoggedInStatus));
    }
  }, []);

  useEffect(() => {
    // Quando lo stato di loggedIn cambia, salvalo in localStorage
    localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
  }, [loggedIn]);

  useEffect(() => {
    console.log(web3auth?.status);
    if (web3auth?.status == "connected") {
      setLoggedIn(true);
      getPrivateKey();
      console.log(web3auth);
      console.log(web3auth.provider);
      const ethersProvider = new ethers.providers.Web3Provider(web3auth?.provider as IProvider);
      setSigner(ethersProvider.getSigner());
      setTorusPlugin(torusPlugin)
    } else if (web3auth?.status == "not_ready") {
      setLoggedIn(false);
    }
  }, [loading, loggedIn, web3auth?.status]);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
  };

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

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
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

  const getAccounts = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const address = await rpc.getAccounts();
    if (web3auth.cachedAdapter == "metamask") {
      uiConsole(address);
    } else {
      uiConsole(address);
    }
  };

  const getBalance = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    //const balance = await rpc.getBalance();
    // fetch baance with public provider
    const account = await rpc.getAccounts();
    const balance = await publicProvider.getBalance(account);
    uiConsole(formatEther(balance) + " ETH");
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

  const getPrivateKey = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (web3auth?.cachedAdapter != "metamask") {
      const rpc = new RPC(web3auth?.provider);
      const privateKey = await rpc.getPrivateKey();
      uiConsole(privateKey);
    } else {
      uiConsole("Private key not available for metamask");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>pre");
    if (el) {
      el.innerHTML = JSON.parse(JSON.stringify(args || {}, null, 2));
    }
  }

  const createWallet = async () => {
    console.log("Start createWallet");

    const cachedAdapter = web3auth?.cachedAdapter;

    console.log("Provider:", provider);

    if (cachedAdapter == "metamask" && web3auth && provider) {
      console.log("metamask");
      const rpc = new RPC(provider);
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      setSigner(ethersProvider.getSigner());
    } else if (cachedAdapter == "openlogin" && provider) {
      const rpc = new RPC(provider);
      const privateKey = await rpc.getPrivateKey();

      const wallet = new Wallet(String(privateKey), publicProvider);
      setSigner(wallet);
    }
  };

  useEffect(() => {
    console.log("Current web3auth", web3auth);
    if (web3auth) console.log("Current web3auth?.provider", web3auth.provider);
  }, [web3auth]);

  return (
    <Web3authContext.Provider
      value={{
        web3auth,
        provider,
        loggedIn,
        login,
        logout,
        signer,
        setSigner,
        getBalance,
        getPrivateKey,
        getAccounts,
        setLoggedIn,
        setLoading,
        loading,
        setWeb3auth,
        torusPlugin,
        setTorusPlugin,
        setProvider,
        createWallet,
      }}
    >
      {children}
    </Web3authContext.Provider>
  );
};
