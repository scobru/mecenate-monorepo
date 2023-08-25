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
var scaffold_eth_1 = require("~~/utils/scaffold-eth");
var crypto = require("asymmetric-crypto");
var utilsContract_1 = require("../components/scaffold-eth/Contract/utilsContract");
var utils_js_1 = require("ethers/lib/utils.js");
var store_1 = require("~~/services/store/store");
var DEBUG = true;
var Feeds = function () {
    var _a, _b;
    var provider = wagmi_1.useProvider();
    var chain = wagmi_1.useNetwork().chain;
    var signer = wagmi_1.useSigner().data;
    var deployedContractFactory = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateFeedFactory");
    // const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateFeed");
    var deployedContractTreasury = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateTreasury");
    // const [pubKey, setPubKey] = React.useState<string>("");
    var _c = react_1["default"].useState([]), feeds = _c[0], setFeeds = _c[1];
    var _d = react_1["default"].useState([]), feedsInfos = _d[0], setFeedsInfos = _d[1];
    var _e = react_1["default"].useState(""), fixedFee = _e[0], setFixedFee = _e[1];
    var store = store_1.useAppStore();
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
        address: treasuryAddress,
        abi: treasuryAbi,
        signerOrProvider: signer || provider
    });
    var factoryCtx = wagmi_1.useContract({
        address: factoryAddress,
        abi: factoryAbi,
        signerOrProvider: signer || provider
    });
    function getFeeds() {
        return __awaiter(this, void 0, void 0, function () {
            var _feeds, _feedsInfo, _fixedFee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (factoryCtx === null || factoryCtx === void 0 ? void 0 : factoryCtx.getFeeds())];
                    case 1:
                        _feeds = _a.sent();
                        return [4 /*yield*/, (factoryCtx === null || factoryCtx === void 0 ? void 0 : factoryCtx.getFeedsInfo())];
                    case 2:
                        _feedsInfo = _a.sent();
                        setFeeds(_feeds);
                        setFeedsInfos(_feedsInfo);
                        return [4 /*yield*/, (treasuryCtx === null || treasuryCtx === void 0 ? void 0 : treasuryCtx.fixedFee())];
                    case 3:
                        _fixedFee = _a.sent();
                        setFixedFee(_fixedFee);
                        console.log(_feedsInfo);
                        console.log(store);
                        if (DEBUG)
                            console.log(feeds);
                        return [2 /*return*/];
                }
            });
        });
    }
    function getFeedsOwned() {
        return __awaiter(this, void 0, void 0, function () {
            var _feeds, _feedsInfo, _tempFeedInfo, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (factoryCtx === null || factoryCtx === void 0 ? void 0 : factoryCtx.getFeedsOwned(signer === null || signer === void 0 ? void 0 : signer.getAddress()))];
                    case 1:
                        _feeds = _a.sent();
                        // remove 0x0000000000000000000000000000000000000000 from _feeds
                        _feeds = _feeds.filter(function (feed) { return feed != "0x0000000000000000000000000000000000000000"; });
                        setFeeds(_feeds);
                        return [4 /*yield*/, (factoryCtx === null || factoryCtx === void 0 ? void 0 : factoryCtx.getFeedsInfo())];
                    case 2:
                        _feedsInfo = _a.sent();
                        _tempFeedInfo = [];
                        for (i = 0; i < _feedsInfo.length; i++) {
                            if (_feedsInfo[i].contractAddress == _feeds[i]) {
                                _tempFeedInfo.push(_feedsInfo[i]);
                            }
                        }
                        setFeedsInfos(_feedsInfo);
                        if (DEBUG)
                            console.log(feeds);
                        return [2 /*return*/];
                }
            });
        });
    }
    function buildFeed() {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (factoryCtx === null || factoryCtx === void 0 ? void 0 : factoryCtx.buildFeed(store.sismoResponse, { value: fixedFee }))];
                    case 1:
                        tx = _a.sent();
                        if (DEBUG)
                            console.log(tx);
                        return [2 /*return*/];
                }
            });
        });
    }
    react_1.useEffect(function () {
        if (factoryCtx) {
            getFeeds();
        }
    }, [signer, factoryCtx]);
    // listen for events FeedCreated
    react_1.useEffect(function () {
        if (factoryCtx) {
            factoryCtx.on("FeedCreated", function (feedAddress, owner, event) {
                if (DEBUG)
                    console.log("FeedCreated", feedAddress, owner, event);
                scaffold_eth_1.notification.success("New Feed Created");
                getFeeds();
            });
        }
    });
    return (react_1["default"].createElement("div", { className: "flex items-center flex-col flex-grow pt-10 text-black min-w-fit" },
        react_1["default"].createElement("div", { className: "max-w-3xl text-center my-2 text-base-content p-4" },
            react_1["default"].createElement("h1", { className: "text-6xl font-bold mb-8" }, "Data Privacy and Security Redefined."),
            react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                react_1["default"].createElement("strong", null, "Mecenate Feeds "),
                " allows me to securely and privately post my information and receive payments directly from interested parties without any intermediaries. With Mecenate Protocol, I can be confident that my information is protected and that I'm getting fair compensation for it."),
            react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                react_1["default"].createElement("strong", null, "Mecenate Feeds"),
                " is a base layer where ",
                react_1["default"].createElement("strong", null, "Mecenate Bay"),
                " is built on top of. Mecenate Bay is a marketplace where you can buy and sell data feeds.")),
        react_1["default"].createElement("div", { className: "flex flex-col items-center mb-5" },
            react_1["default"].createElement("button", { className: "btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2", onClick: buildFeed }, "Create"),
            react_1["default"].createElement("button", { className: "btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getFeedsOwned()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); } },
                react_1["default"].createElement("i", { className: "fas fa-user-alt mr-2" }),
                " Your Feeds"),
            react_1["default"].createElement("button", { className: "btn-wide text-base-content bg-primary hover:bg-secondary  font-bold py-2 px-4 rounded-md my-2", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getFeeds()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); } },
                react_1["default"].createElement("i", { className: "fas fa-globe mr-2" }),
                " All Feeds")),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-4 my-10" }, feeds &&
            ((_b = (_a = store === null || store === void 0 ? void 0 : store.sismoData) === null || _a === void 0 ? void 0 : _a.auths) === null || _b === void 0 ? void 0 : _b.length) > 0 &&
            feeds.map(function (feed, i) { return (react_1["default"].createElement("div", { key: i, className: "card bg-base-100 shadow-xl p-2 text-base-content" },
                react_1["default"].createElement("a", { href: "/viewFeed?addr=" + feed + "&vaultId=" + store.sismoData.vaultId + "&userAddress=" + store.sismoData.auths[1].userId + "&response=" + store.sismoResponse },
                    react_1["default"].createElement("div", { className: "grid grid-cols-12 gap-4 border p-2" },
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Addr:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" }, feed),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Seller:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" }, feedsInfos[i].seller),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Seller Stake:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" },
                            utils_js_1.formatEther(feedsInfos[i].sellerStake),
                            " ETH"),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Buyer:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" }, feedsInfos[i].buyer),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Buyer Stake:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" },
                            utils_js_1.formatEther(feedsInfos[i].buyerStake),
                            " ETH"),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Operator:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" }, feedsInfos[i].operator),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Total:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" },
                            utils_js_1.formatEther(String(feedsInfos[i].totalStake)),
                            " ETH"),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Payment:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" },
                            String(feedsInfos[i].buyerPayment),
                            " ETH"),
                        react_1["default"].createElement("div", { className: "col-span-2 font-bold" }, "Count:"),
                        react_1["default"].createElement("div", { className: "col-span-4 overflow-hidden text-truncate" }, String(feedsInfos[i].postCount)))))); }))));
};
exports["default"] = Feeds;
