import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  braveWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains } from "wagmi";
import * as chains from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";

import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const configuredChain = getTargetNetwork();
console.log("configuredChain", configuredChain);

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.

const enabledChains = configuredChain.id === 1 ? [configuredChain] : [configuredChain, chains.mainnet];

/**
 * Chains for the app
 */
export const appChains = configureChains(
  enabledChains,
  [
    alchemyProvider({
      apiKey: String(process.env.NEXT_PUBLIC_ALCHEMY_SECRET),
      priority: 0,
    }),
    infuraProvider({
      apiKey: String(process.env.NEXT_PUBLIC_INFURA_API_KEY),
      priority: 1,
    }),
    publicProvider({ priority: 2 }),
  ],
  {
    stallTimeout: 3_000,
    // Sets pollingInterval if using chain's other than local hardhat chain
    ...(process.env.NEXT_PUBLIC_NETWORK !== "hardhat"
      ? {
          pollingInterval: process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL
            ? parseInt(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL)
            : 30_000,
        }
      : {}),
  },
);

/**
 * list of burner wallet compatable chains
 */
export const burnerChains = configureChains(
  [chains.baseGoerli],
  [
    alchemyProvider({
      // ToDo. Move to .env || scaffold config
      // This is ours Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "tKi7dSZs2Nqw8EzhMYKn4-83Dg1P7YQe",
    }),
    publicProvider(),
  ],
);

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: [
      metaMaskWallet({ chains: appChains.chains, shimDisconnect: true }),
      walletConnectWallet({ chains: appChains.chains }),
      ledgerWallet({ chains: appChains.chains }),
      braveWallet({ chains: appChains.chains }),
      coinbaseWallet({ appName: "scaffold-eth", chains: appChains.chains }),
      rainbowWallet({ chains: appChains.chains }),
      burnerWalletConfig({ chains: burnerChains.chains }),
    ],
  },
]);
