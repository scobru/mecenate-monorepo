"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var wagmi_1 = require("wagmi");
var utilsContract_1 = require("../components/scaffold-eth/Contract/utilsContract");
var ethers_1 = require("ethers");
var utils_js_1 = require("ethers/lib/utils.js");
var link_1 = require("next/link");
var scaffold_eth_1 = require("~~/hooks/scaffold-eth");
var Feeds = function () {
    var provider = wagmi_1.useProvider();
    var chain = wagmi_1.useNetwork().chain;
    var signer = wagmi_1.useSigner().data;
    var deployedContractFactory = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateFeedFactory");
    var deployedContractTreasury = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateTreasury");
    var _a = react_1["default"].useState([]), feeds = _a[0], setFeeds = _a[1];
    var _b = react_1["default"].useState([]), feedsInfos = _b[0], setFeedsInfos = _b[1];
    var _c = react_1["default"].useState(false), onlyYourFeeds = _c[0], setOnlyYourFeeds = _c[1];
    var txData = scaffold_eth_1.useTransactor(signer);
    var _d = react_1["default"].useState(null), sismoData = _d[0], setSismoData = _d[1];
    var _e = react_1["default"].useState(null), verified = _e[0], setVerified = _e[1];
    var _f = react_1["default"].useState(null), sismoResponse = _f[0], setSismoResponse = _f[1];
    var deployedContractVault = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateVault");
    var _g = react_1["default"].useState(0), nonce = _g[0], setNonce = _g[1];
    var _h = react_1["default"].useState(""), withdrawalAddress = _h[0], setWithdrawalAddress = _h[1];
    var customProvider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    var customWallet = new ethers_1.ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);
    var factoryAddress;
    var factoryAbi = [];
    var treasuryAddress;
    var treasuryAbi = [];
    if (deployedContractFactory) {
        (factoryAddress = deployedContractFactory.address, factoryAbi = deployedContractFactory.abi);
    }
    if (deployedContractTreasury) {
        (treasuryAddress = deployedContractTreasury.address, treasuryAbi = deployedContractTreasury.abi);
    }
    var treasuryCtx = wagmi_1.useContract({
        address: deployedContractTreasury === null || deployedContractTreasury === void 0 ? void 0 : deployedContractTreasury.address,
        abi: treasuryAbi,
        signerOrProvider: customWallet
    });
    var factoryCtx = wagmi_1.useContract({
        address: deployedContractFactory === null || deployedContractFactory === void 0 ? void 0 : deployedContractFactory.address,
        abi: factoryAbi,
        signerOrProvider: customWallet
    });
    var vaultAddress;
    var vaultAbi = [];
    if (deployedContractVault) {
        (vaultAddress = deployedContractVault.address, vaultAbi = deployedContractVault.abi);
    }
    var vaultCtx = wagmi_1.useContract({
        address: vaultAddress,
        abi: vaultAbi,
        signerOrProvider: customWallet
    });
    var getFeeds = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _feeds, _feedsInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!factoryCtx || !sismoData)
                        return [2 /*return*/];
                    if (!onlyYourFeeds) return [3 /*break*/, 3];
                    return [4 /*yield*/, factoryCtx.getFeedsOwned(utils_js_1.keccak256(sismoData.auths[0].userId))];
                case 1:
                    _feeds = _a.sent();
                    console.log(_feeds);
                    return [4 /*yield*/, factoryCtx.getFeedsInfoOwned(utils_js_1.keccak256(sismoData.auths[0].userId))];
                case 2:
                    _feedsInfo = _a.sent();
                    console.log(_feedsInfo);
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, factoryCtx.getFeeds()];
                case 4:
                    _feeds = _a.sent();
                    return [4 /*yield*/, factoryCtx.getFeedsInfo()];
                case 5:
                    _feedsInfo = _a.sent();
                    _a.label = 6;
                case 6:
                    // Batch state updates
                    setFeeds(_feeds);
                    setFeedsInfos(_feedsInfo);
                    return [2 /*return*/];
            }
        });
    }); }, [onlyYourFeeds, factoryCtx]);
    react_1.useEffect(function () {
        if (factoryCtx) {
            getFeeds();
            var storedData = localStorage.getItem("sismoData");
            var storedVerified = localStorage.getItem("verified");
            var storedSismoResponse = localStorage.getItem("sismoResponse");
            var nonce_1 = localStorage.getItem("nonce");
            var withdrawalAddress_1 = localStorage.getItem("withdrawalAddress");
            if (storedData && storedVerified && storedSismoResponse) {
                setSismoData(JSON.parse(storedData));
                setVerified(storedVerified);
                setSismoResponse(storedSismoResponse);
                setNonce(String(nonce_1));
                setWithdrawalAddress(withdrawalAddress_1);
                // Create new ethers.Wallet instance
            }
            else {
                console.warn("Stored ethWallet or its privateKey is undefined.");
            }
        }
    }, [onlyYourFeeds]);
    var buildFeed = function () { return __awaiter(void 0, void 0, void 0, function () {
        var abiCoder, iface, data;
        return __generator(this, function (_a) {
            if (!factoryCtx || !treasuryCtx || !txData || !vaultCtx || !sismoData)
                return [2 /*return*/];
            abiCoder = new utils_js_1.AbiCoder();
            iface = new ethers_1.ethers.utils.Interface(deployedContractFactory === null || deployedContractFactory === void 0 ? void 0 : deployedContractFactory.abi);
            data = iface.encodeFunctionData("buildFeed", [sismoResponse, withdrawalAddress, nonce]);
            txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(factoryCtx === null || factoryCtx === void 0 ? void 0 : factoryCtx.address, data, treasuryCtx === null || treasuryCtx === void 0 ? void 0 : treasuryCtx.fixedFee(), utils_js_1.keccak256(sismoData.auths[0].userId)));
            return [2 /*return*/];
        });
    }); };
    var formattedFeeds = react_1.useMemo(function () {
        return (feeds &&
            feedsInfos &&
            feeds.map(function (feed, i) {
                var _a;
                return (react_1["default"].createElement("div", { key: i },
                    react_1["default"].createElement(link_1["default"], { href: "/viewFeed?addr=" + feed, passHref: true },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 gap-4 border rounded-xl p-4 hover:bg-base-200 transition-all duration-300 ease-in-out transform hover:scale-105 bg-base-300 text-base-content" },
                            react_1["default"].createElement("div", { className: "col-span-2 font-bold animate__animated animate__fadeInLeft" }, "Addr:"),
                            react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight" }, feed),
                            react_1["default"].createElement("div", { className: "col-span-2 font-bold animate__animated animate__fadeInLeft" }, "Seller Stake:"),
                            react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight" },
                                utils_js_1.formatEther((_a = feedsInfos[i]) === null || _a === void 0 ? void 0 : _a.sellerStake),
                                " ETH"),
                            react_1["default"].createElement("div", { className: "col-span-2 font-bold animate__animated animate__fadeInLeft" }, "Total Locked:"),
                            react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight" },
                                utils_js_1.formatEther(String(feedsInfos[i].totalStake)),
                                " ETH"),
                            react_1["default"].createElement("div", { className: "col-span-2 font-bold animate__animated animate__fadeInLeft" }, "Buyer Payment:"),
                            react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight" },
                                utils_js_1.formatEther(String(feedsInfos[i].paymentRequested)),
                                " ETH"),
                            react_1["default"].createElement("div", { className: "col-span-2 font-bold animate__animated animate__fadeInLeft" }, "Count:"),
                            react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight" }, String(feedsInfos[i].postCount)),
                            react_1["default"].createElement("div", { className: "col-span-2 font-bold animate__animated animate__fadeInLeft" }, "Status:"),
                            react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate animate__animated animate__fadeInRight" }, String(feedsInfos[i].status))))));
            }));
    }, [feeds, feedsInfos]);
    return (react_1["default"].createElement("div", { className: "flex items-center flex-col flex-grow pt-10  min-w-fit" },
        react_1["default"].createElement("div", { className: "max-w-3xl text-center" },
            react_1["default"].createElement("h1", { className: "text-6xl font-bold mb-8" }, "FEEDS"),
            react_1["default"].createElement("p", { className: "text-xl  mb-20" }, "Create your feed and sell your data")),
        react_1["default"].createElement("div", { className: "mx-auto  w-fit text-center items-center" }),
        react_1["default"].createElement("div", { className: "flex flex-row items-center mb-5  gap-4 text-lg p-5" },
            react_1["default"].createElement("button", { className: "link-hover font-bold", onClick: buildFeed }, "Create"),
            react_1["default"].createElement("button", { className: "link-hover font-bold", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        setOnlyYourFeeds(true);
                        return [2 /*return*/];
                    });
                }); } },
                react_1["default"].createElement("i", { className: "fas fa-user-alt mr-2" }),
                " Your Feeds"),
            react_1["default"].createElement("button", { className: "link-hover  font-bold", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        setOnlyYourFeeds(false);
                        return [2 /*return*/];
                    });
                }); } },
                react_1["default"].createElement("i", { className: "fas fa-globe mr-2" }),
                " All Feeds")),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-4 my-10 p-5" }, formattedFeeds)));
};
exports["default"] = Feeds;
