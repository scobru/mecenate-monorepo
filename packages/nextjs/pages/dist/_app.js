"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
require("~~/styles/globals.css");
require("~~/styles/carousel.css");
var rainbowkit_1 = require("@rainbow-me/rainbowkit");
var wagmi_1 = require("wagmi");
var react_hot_toast_1 = require("react-hot-toast");
require("@rainbow-me/rainbowkit/styles.css");
var wagmiConnectors_1 = require("~~/services/web3/wagmiConnectors");
var wagmiClient_1 = require("~~/services/web3/wagmiClient");
var scaffold_eth_1 = require("~~/components/scaffold-eth");
var Header_1 = require("~~/components/Header");
var Footer_1 = require("~~/components/Footer");
var react_1 = require("react");
var store_1 = require("~~/services/store/store");
var scaffold_eth_2 = require("~~/hooks/scaffold-eth");
var nextjs_progressbar_1 = require("nextjs-progressbar");
require("url-polyfill");
var react_2 = require("@vercel/analytics/react");
var ScaffoldEthApp = function (_a) {
    var Component = _a.Component, pageProps = _a.pageProps;
    var price = scaffold_eth_2.useEthPrice();
    var setEthPrice = store_1.useAppStore(function (state) { return state.setEthPrice; });
    react_1.useEffect(function () {
        if (price > 0) {
            setEthPrice(price);
        }
    }, [setEthPrice, price]);
    return (React.createElement(wagmi_1.WagmiConfig, { client: wagmiClient_1.wagmiClient },
        React.createElement(nextjs_progressbar_1["default"], null),
        React.createElement(rainbowkit_1.RainbowKitProvider, { chains: wagmiConnectors_1.appChains.chains, avatar: scaffold_eth_1.BlockieAvatar },
            React.createElement("div", { className: "flex flex-col min-h-screen min-w-fit bg-base-100 font-proxima antialiased" },
                React.createElement("div", { className: "text-center bg-gradient-to-r from-blue-100 to-yellow-200 p-2 w-screen" },
                    "Live on ",
                    React.createElement("strong", null, "Base Goerli"),
                    " \uD83C\uDF89"),
                " ",
                React.createElement(Header_1["default"], null),
                React.createElement("main", { className: "relative flex flex-col flex-1 min-w-fit bg-primary" },
                    React.createElement(Component, __assign({}, pageProps)),
                    React.createElement(react_2.Analytics, null)),
                React.createElement(Footer_1["default"], null)),
            React.createElement(react_hot_toast_1.Toaster, null))));
};
exports["default"] = ScaffoldEthApp;
