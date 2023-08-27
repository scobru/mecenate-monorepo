"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
exports.__esModule = true;
exports.wagmiConnectors = exports.burnerChains = exports.appChains = void 0;
var rainbowkit_1 = require("@rainbow-me/rainbowkit");
var wallets_1 = require("@rainbow-me/rainbowkit/wallets");
var wagmi_1 = require("wagmi");
var chains = require("wagmi/chains");
var alchemy_1 = require("wagmi/providers/alchemy");
var public_1 = require("wagmi/providers/public");
var infura_1 = require("wagmi/providers/infura");
var burnerWalletConfig_1 = require("~~/services/web3/wagmi-burner/burnerWalletConfig");
var scaffold_eth_1 = require("~~/utils/scaffold-eth");
var configuredChain = scaffold_eth_1.getTargetNetwork();
console.log("configuredChain", configuredChain);
// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
var enabledChains = configuredChain.id === 1 ? [configuredChain] : [configuredChain, chains.mainnet];
/**
 * Chains for the app
 */
exports.appChains = wagmi_1.configureChains(
  enabledChains,
  [
    infura_1.infuraProvider({
      projectId: process.env.INFURA_PROJECT_ID,
      projectSecret: process.env.INFURA_PROJECT_SECRET,
      priority: 0,
    }),
    alchemy_1.alchemyProvider({
      // ToDo. Move to .env || scaffold config
      // This is ours Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
      priority: 1,
    }),
    public_1.publicProvider({ priority: 2 }),
  ],
  __assign(
    { stallTimeout: 3000 },
    process.env.NEXT_PUBLIC_NETWORK !== "hardhat"
      ? {
          pollingInterval: process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL
            ? parseInt(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL)
            : 30000,
        }
      : {},
  ),
);
/**
 * list of burner wallet compatable chains
 */
exports.burnerChains = wagmi_1.configureChains(
  [chains.hardhat],
  [
    alchemy_1.alchemyProvider({
      // ToDo. Move to .env || scaffold config
      // This is ours Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "tKi7dSZs2Nqw8EzhMYKn4-83Dg1P7YQe",
    }),
    public_1.publicProvider(),
  ],
);
/**
 * wagmi connectors for the wagmi context
 */
exports.wagmiConnectors = rainbowkit_1.connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: [
      wallets_1.metaMaskWallet({ chains: exports.appChains.chains, shimDisconnect: true }),
      wallets_1.walletConnectWallet({ chains: exports.appChains.chains }),
      wallets_1.ledgerWallet({ chains: exports.appChains.chains }),
      wallets_1.braveWallet({ chains: exports.appChains.chains }),
      wallets_1.coinbaseWallet({ appName: "scaffold-eth", chains: exports.appChains.chains }),
      wallets_1.rainbowWallet({ chains: exports.appChains.chains }),
      burnerWalletConfig_1.burnerWalletConfig({ chains: exports.burnerChains.chains }),
    ],
  },
]);
