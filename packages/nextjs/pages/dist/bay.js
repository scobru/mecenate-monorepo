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
var scaffold_eth_1 = require("~~/hooks/scaffold-eth");
var scaffold_eth_2 = require("~~/utils/scaffold-eth");
var axios_1 = require("axios");
var Bay = function () {
    var provider = wagmi_1.useProvider();
    var chain = wagmi_1.useNetwork().chain;
    var signer = wagmi_1.useSigner().data;
    var customProvider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    var customWallet = new ethers_1.ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);
    var deployedContractBay = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateBay");
    var deployedContractIdentity = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateIdentity");
    var deployedContractVault = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateVault");
    var _a = react_1["default"].useState([]), requests = _a[0], setRequests = _a[1];
    var _b = react_1["default"].useState(""), requestString = _b[0], setRequestString = _b[1];
    var _c = react_1["default"].useState(""), requestPayment = _c[0], setRequestPayment = _c[1];
    var _d = react_1["default"].useState(""), requestStake = _d[0], setRequestStake = _d[1];
    var _e = react_1["default"].useState(""), requestAddress = _e[0], setRequestAddress = _e[1];
    var _f = react_1["default"].useState(), customSigner = _f[0], setCustomSigner = _f[1];
    var txData = scaffold_eth_1.useTransactor(signer);
    var _g = react_1["default"].useState(null), sismoData = _g[0], setSismoData = _g[1];
    var _h = react_1["default"].useState(null), verified = _h[0], setVerified = _h[1];
    var _j = react_1["default"].useState(null), sismoResponse = _j[0], setSismoResponse = _j[1];
    var _k = react_1["default"].useState(0), tokenId = _k[0], setTokenId = _k[1];
    var _l = react_1["default"].useState(0), nonce = _l[0], setNonce = _l[1];
    var _m = react_1["default"].useState(""), withdrawalAddress = _m[0], setWithdrawalAddress = _m[1];
    var bayAddress;
    var bayAbi = [];
    var identityAddress;
    var identityAbi = [];
    if (deployedContractBay) {
        (bayAddress = deployedContractBay.address, bayAbi = deployedContractBay.abi);
    }
    if (deployedContractIdentity) {
        (identityAddress = deployedContractIdentity.address, identityAbi = deployedContractIdentity.abi);
    }
    var vaultAddress;
    var vaultAbi = [];
    if (deployedContractVault) {
        (vaultAddress = deployedContractVault.address, vaultAbi = deployedContractVault.abi);
    }
    var vaultCtx = wagmi_1.useContract({
        address: vaultAddress,
        abi: vaultAbi,
        signerOrProvider: customWallet || provider
    });
    var bayCtx = wagmi_1.useContract({
        address: bayAddress,
        abi: bayAbi,
        signerOrProvider: customWallet || provider
    });
    var acceptBayRequest = function (index, address) { return __awaiter(void 0, void 0, void 0, function () {
        var iface, data;
        return __generator(this, function (_a) {
            if (signer) {
                iface = new ethers_1.ethers.utils.Interface(deployedContractBay === null || deployedContractBay === void 0 ? void 0 : deployedContractBay.abi);
                data = iface.encodeFunctionData("acceptRequest", [index, address, sismoResponse, withdrawalAddress, nonce]);
                txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(bayCtx === null || bayCtx === void 0 ? void 0 : bayCtx.address, data, 0, utils_js_1.keccak256(String(sismoData.auths[0].userId))));
            }
            return [2 /*return*/];
        });
    }); };
    var removeRequest = function (index) { return __awaiter(void 0, void 0, void 0, function () {
        var iface, data;
        return __generator(this, function (_a) {
            iface = new ethers_1.ethers.utils.Interface(deployedContractBay === null || deployedContractBay === void 0 ? void 0 : deployedContractBay.abi);
            data = iface.encodeFunctionData("removeRequest", [
                index,
                sismoResponse,
                utils_js_1.keccak256(String(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.address)),
            ]);
            txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(bayCtx === null || bayCtx === void 0 ? void 0 : bayCtx.address, data, 0, utils_js_1.keccak256(String(sismoData.auths[0].userId))));
            return [2 /*return*/];
        });
    }); };
    var getAllRequest = react_1.useMemo(function () {
        return function () { return __awaiter(void 0, void 0, void 0, function () {
            var _requests;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(customProvider && deployedContractBay)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (bayCtx === null || bayCtx === void 0 ? void 0 : bayCtx.getRequests())];
                    case 1:
                        _requests = _a.sent();
                        setRequests(_requests);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
    }, [deployedContractBay, bayCtx]);
    var createBayContract = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _request, request, iface, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _request = ethers_1.ethers.utils.formatBytes32String(requestString);
                    request = {
                        request: _request,
                        payment: utils_js_1.parseEther(requestPayment),
                        stake: utils_js_1.parseEther(requestStake),
                        postAddress: "0x0000000000000000000000000000000000000000",
                        accepted: false,
                        postCount: 0,
                        tokenId: tokenId
                    };
                    iface = new ethers_1.ethers.utils.Interface(deployedContractBay === null || deployedContractBay === void 0 ? void 0 : deployedContractBay.abi);
                    data = iface.encodeFunctionData("createRequest", [request, sismoResponse, withdrawalAddress, nonce]);
                    txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(bayCtx === null || bayCtx === void 0 ? void 0 : bayCtx.address, data, utils_js_1.parseEther(requestPayment), utils_js_1.keccak256(String(sismoData.auths[0].userId))));
                    return [4 /*yield*/, sendPublicTelegramMessage()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Get and set data from localStorage
                setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
                setNonce(String(localStorage.getItem("nonce")));
                setWithdrawalAddress(String(localStorage.getItem("withdrawalAddress")));
                setVerified(localStorage.getItem("verified"));
                setSismoResponse(localStorage.getItem("sismoResponse"));
                return [2 /*return*/];
            });
        }); };
        fetchData();
    }, [sismoResponse]); // include customProvider if it's expected to change over time
    react_1.useEffect(function () {
        getAllRequest();
    }, [deployedContractBay, getAllRequest]);
    var sendPublicTelegramMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var url, message, formattedText, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.telegram.org/bot" + String(process.env.NEXT_PUBLIC_TELEGRAM_TOKEN) + "/sendMessage";
                    message = {
                        message: requestString,
                        payment: requestPayment,
                        stake: requestStake
                    };
                    formattedText = "<b>\u2B50 Bay Request</b>\n\n<b>\uD83D\uDCE3 request: </b>" + message.message + " \n<b>\u2696\uFE0F stake: </b>" + message.stake + " \n<b>\uD83D\uDCB2 payment: </b>" + message.message;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1["default"].post(url, {
                            chat_id: "@mecenate_channel",
                            text: formattedText,
                            parse_mode: "HTML"
                        })];
                case 2:
                    response = _a.sent();
                    console.log("Message sent:", response.data);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error sending message:", error_1);
                    return [3 /*break*/, 4];
                case 4:
                    scaffold_eth_2.notification.success("Message sent successfully");
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSelectToken = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            token = e;
            if (token === "ETH") {
                setTokenId(0);
            }
            else if (token === "DAI") {
                setTokenId(1);
            }
            else if (token === "MUSE") {
                setTokenId(2);
            }
            return [2 /*return*/];
        });
    }); };
    return (react_1["default"].createElement("div", { className: "flex items-center flex-col flex-grow pt-10 text-black min-w-fit" },
        react_1["default"].createElement("div", { className: "text-center my-2 text-base-content mx-auto" },
            react_1["default"].createElement("div", { className: " text-center" },
                react_1["default"].createElement("h1", { className: "text-6xl font-bold mb-8" }, "BAY"),
                react_1["default"].createElement("h1", { className: "text-base font-base mb-8" },
                    " ",
                    "* All request are also posted on our",
                    " ",
                    react_1["default"].createElement("a", { href: "https://t.me/mecenate_message_bot", className: "link-hover font-bold" }, "Telegram Channel"),
                    " "),
                react_1["default"].createElement("p", { className: "text-xl  mb-20" }, "Request any data")),
            react_1["default"].createElement("div", { className: "flex flex-col min-w-fit mx-auto items-center mb-20 " },
                react_1["default"].createElement("div", { className: "card bg-slate-200 rounded-lg shadow-2xl shadow-primary py-2   p-4 m-4 text-black" },
                    react_1["default"].createElement("label", { className: "text-black font-semibold text-sm", htmlFor: "request" }, "What do you want?"),
                    react_1["default"].createElement("input", { className: "border-2 border-gray-300  h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2", type: "text", name: "request", placeholder: "Enter Request", onChange: function (e) { return setRequestString(e.target.value); } }),
                    react_1["default"].createElement("label", { className: "text-black font-semibold text-sm", htmlFor: "request" }, "Currency"),
                    react_1["default"].createElement("select", { className: "select select-text bg-transparent my-4", name: "tokens", id: "tokens", onChange: function (e) { return handleSelectToken(e.target.value); } },
                        react_1["default"].createElement("option", { value: "Nan" }, "Select Token"),
                        react_1["default"].createElement("option", { value: "ETH" }, "ETH"),
                        react_1["default"].createElement("option", { value: "DAI" }, "DAI"),
                        react_1["default"].createElement("option", { value: "MUSE" }, "MUSE")),
                    react_1["default"].createElement("label", { className: "text-black font-semibold text-sm", htmlFor: "request" }, "Reward"),
                    react_1["default"].createElement("input", { className: "border-2 border-gray-300  h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2", type: "text", name: "payment", placeholder: "Enter Amount", onChange: function (e) { return setRequestPayment(e.target.value); } }),
                    react_1["default"].createElement("label", { className: "text-black font-semibold text-sm", htmlFor: "request" }, "Staker Fullfill"),
                    react_1["default"].createElement("input", { className: "border-2 border-gray-300  h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2", type: "text", name: "stake", placeholder: "Enter Amount", onChange: function (e) { return setRequestStake(e.target.value); } }),
                    react_1["default"].createElement("button", { className: " hover:bg-accent  font-bold py-2 px-4 rounded my-5", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, createBayContract()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); } }, "Create Request"))),
            react_1["default"].createElement("div", { className: "grid  sm:grid-cols-1 xl:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-5" }, requests.map(function (request, index) {
                return (react_1["default"].createElement("div", { key: index, tabIndex: 0, className: "card card-bordered grid-cols-3 my-5 bg-secondary hover:bg-base-300 shadow-lg shadow-primary hover:shadow-2xl hover:scale-105 transform transition-all duration-500" },
                    react_1["default"].createElement("div", { className: "bg-primary  " },
                        react_1["default"].createElement("div", { className: "text-left p-5" },
                            react_1["default"].createElement("span", { className: "font-light text-left" }, "WANTED"),
                            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, ethers_1.ethers.utils.parseBytes32String(request.request)),
                            react_1["default"].createElement("a", { className: "link-hover", href: "/viewFeed?addr=" + request.postAddress },
                                " ",
                                request.postAddress)),
                        react_1["default"].createElement("div", { className: "text-right p-5" },
                            react_1["default"].createElement("div", { className: "text-xl font-regular" },
                                utils_js_1.formatEther(request.payment),
                                " ETH"),
                            react_1["default"].createElement("div", { className: " text-md font-light" }, "Reward"))),
                    react_1["default"].createElement("div", { className: "bg-secondary" },
                        react_1["default"].createElement("div", { className: "text-left p-5 space-y-1" },
                            react_1["default"].createElement("div", { className: "font-medium" },
                                "Fulfiller must stake",
                                " ",
                                react_1["default"].createElement("strong", null,
                                    utils_js_1.formatEther(request.stake),
                                    " ",
                                    request.tokenId == 0 ? "ETH" : "DAI" ? request.tokenId == 2 : "MUSE",
                                    " ")),
                            react_1["default"].createElement("div", { className: "font-medium" },
                                "Requester can pay",
                                react_1["default"].createElement("strong", null,
                                    " ",
                                    utils_js_1.formatEther(request.payment),
                                    " ",
                                    request.tokenId == 0 ? "ETH" : "DAI" ? request.tokenId == 2 : "MUSE",
                                    " "),
                                "to destroy stake"),
                            react_1["default"].createElement("div", { className: "font-medium" },
                                "This feed had already fullfill ",
                                react_1["default"].createElement("strong", null, String(request.postCount)),
                                " requests"),
                            react_1["default"].createElement("div", { className: "font-medium" },
                                "Accepted: ",
                                react_1["default"].createElement("strong", null, String(request.accepted)))),
                        react_1["default"].createElement("div", { className: "text-right p-5 space-x-4 mt-5" },
                            react_1["default"].createElement("div", { className: "text-left" },
                                react_1["default"].createElement("input", { className: "input input-primary", type: "text", name: "address", placeholder: "Enter Feed Address", onChange: function (e) { return setRequestAddress(e.target.value); } })),
                            react_1["default"].createElement("button", { className: "link link-hover hover:font-semibold ", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, acceptBayRequest(index, requestAddress)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); } }, "accept"),
                            react_1["default"].createElement("button", null,
                                react_1["default"].createElement("a", { className: "link link-hover hover:font-semibold ", href: "/feeds" }, "answer")),
                            react_1["default"].createElement("button", { className: "link link-hover hover:font-semibold ", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, removeRequest(index)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); } }, "cancel")))));
            })))));
};
exports["default"] = Bay;
