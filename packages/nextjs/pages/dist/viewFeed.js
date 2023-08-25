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
var scaffold_eth_1 = require("~~/utils/scaffold-eth");
var router_1 = require("next/router");
var utils_1 = require("ethers/lib/utils");
var sdk_1 = require("@pinata/sdk");
var axios_1 = require("axios");
var dotenv_1 = require("dotenv");
var react_dropzone_1 = require("react-dropzone");
var ipfs_http_client_1 = require("ipfs-http-client");
var file_saver_1 = require("file-saver");
var LitJsSdk = require("@lit-protocol/lit-node-client");
var siwe_1 = require("siwe");
var crypto_1 = require("crypto");
var lit = new LitJsSdk.LitNodeClient({ debug: true });
dotenv_1["default"].config();
var ViewFeed = function () {
    //const crypto = require("asymmetric-crypto");
    var base64url = require("base64url"); // import the base64url library
    var ErasureHelper = require("@erasure/crypto-ipfs");
    var pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
    var pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    var projectId = process.env.INFURA_PROJECT_ID;
    var projectSecret = process.env.INFURA_PROJECT_SECRET;
    var projectGateway = process.env.IPFS_GATEWAY;
    var auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
    var IPFS_HOST = "ipfs.infura.io";
    var IPFS_PORT = 5001;
    var client = ipfs_http_client_1.create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
            authorization: auth
        }
    });
    var chain = wagmi_1.useNetwork().chain;
    console.log("Chain: ", chain === null || chain === void 0 ? void 0 : chain.id.toString());
    var signer = wagmi_1.useSigner().data;
    var provider = wagmi_1.useProvider();
    var router = router_1.useRouter();
    var addr = router.query.addr;
    var vaultId = router.query.vaultId;
    var userAddress = router.query.userAddress;
    var response = router.query.response;
    var _a = react_1.useState(), authSig = _a[0], setAuthSig = _a[1];
    var _b = react_1.useState([]), postType = _b[0], setPostType = _b[1];
    var _c = react_1.useState([]), postDuration = _c[0], setPostDuration = _c[1];
    var _d = react_1.useState([]), postStake = _d[0], setPostStake = _d[1];
    var _e = react_1.useState([]), postRawData = _e[0], setPostRawData = _e[1];
    var _f = react_1.useState([]), postPayment = _f[0], setPostPayment = _f[1];
    var _g = react_1.useState([]), symmetricKey = _g[0], setSymmetricKey = _g[1];
    var _h = react_1.useState([]), secretKey = _h[0], setSecretKey = _h[1];
    var _j = react_1.useState(), valid = _j[0], setValid = _j[1];
    var _k = react_1.useState(0), punishment = _k[0], setPunishment = _k[1];
    var _l = react_1.useState(0), sellerStake = _l[0], setSellerStake = _l[1];
    var _m = react_1.useState(0), buyerStake = _m[0], setBuyerStake = _m[1];
    var _o = react_1.useState(""), buyerPayment = _o[0], setBuyerPayment = _o[1];
    var _p = react_1.useState(0), totalStaked = _p[0], setTotalStaked = _p[1];
    var _q = react_1.useState(0), stakeAmount = _q[0], setStakeAmount = _q[1];
    var _r = react_1.useState(""), buyer = _r[0], setBuyer = _r[1];
    var _s = react_1["default"].useState(""), imageFile = _s[0], setImageFile = _s[1];
    var _t = react_1["default"].useState(""), image = _t[0], setImage = _t[1];
    var _u = react_1.useState(""), postCount = _u[0], setPostCount = _u[1];
    var evmContractConditions = [
        {
            contractAddress: addr,
            functionName: "getStatus()",
            functionParams: [],
            functionAbi: {
                name: "getStatus",
                inputs: [],
                outputs: [
                    {
                        internalType: "uint8",
                        name: "status",
                        type: "uint8"
                    },
                ],
                constant: true,
                stateMutability: "view"
            },
            chain: "sepolia",
            returnValueTest: { key: "status", comparator: "=", value: "3" }
        },
        { operator: "and" },
        {
            conditionType: "evmBasic",
            contractAddress: addr,
            chain: "sepolia",
            method: "sismoVerifyBuyer",
            parameters: [":litParam:response"],
            returnValueTest: {
                comparator: "=",
                value: "true"
            }
        },
    ];
    var user = "";
    var owner = "";
    var _v = react_1.useState([]), feedData = _v[0], setFeedData = _v[1];
    var deployedContractFeed = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateFeed");
    var _w = react_1.useState([]), userData = _w[0], setUserData = _w[1];
    var deployedContractUsers = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateUsers");
    var feedAddress;
    var feedAbi = [];
    var usersAddress;
    var usersAbi = [];
    if (deployedContractUsers) {
        (usersAddress = deployedContractUsers.address, usersAbi = deployedContractUsers.abi);
    }
    if (deployedContractFeed) {
        (feedAddress = deployedContractFeed.address, feedAbi = deployedContractFeed.abi);
    }
    var feedCtx = wagmi_1.useContract({
        address: addr,
        abi: feedAbi,
        signerOrProvider: signer
    });
    var usersCtx = wagmi_1.useContract({
        address: usersAddress,
        abi: usersAbi,
        signerOrProvider: signer || provider
    });
    function decodeData() {
        return __awaiter(this, void 0, void 0, function () {
            var abiCoder, decryptedData, encryptedData, encryptedKey, encryptedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(feedData[1][2].decryptedData != "0x30783030")) return [3 /*break*/, 3];
                        abiCoder = new utils_1.AbiCoder();
                        decryptedData = abiCoder.decode(["string", "string"], feedData[1][2].decryptedData);
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: feedData[1][2].encryptedData,
                                inputType: "sha2-256",
                                outputType: "b58"
                            })];
                    case 1:
                        encryptedData = _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: feedData[1][2].encryptedKey,
                                inputType: "sha2-256",
                                outputType: "b58"
                            })];
                    case 2:
                        encryptedKey = _a.sent();
                        scaffold_eth_1.notification.success(react_1["default"].createElement("div", null,
                            " ",
                            react_1["default"].createElement("p", null,
                                react_1["default"].createElement("a", { href: "https://gateway.pinata.cloud/ipfs/" + decryptedData[0], target: "_blank" },
                                    react_1["default"].createElement("p", null,
                                        "Decrypted Data[0]: ",
                                        decryptedData[0]))),
                            react_1["default"].createElement("p", null,
                                react_1["default"].createElement("a", { href: "https://gateway.pinata.cloud/ipfs/" + decryptedData[1], target: "_blank" },
                                    react_1["default"].createElement("p", null,
                                        "Decrypted Data[1]: ",
                                        decryptedData[1]))),
                            react_1["default"].createElement("p", null,
                                react_1["default"].createElement("a", { href: "https://gateway.pinata.cloud/ipfs/" + encryptedData, target: "_blank" },
                                    react_1["default"].createElement("p", null,
                                        "Encrypted Data: ",
                                        encryptedData))),
                            react_1["default"].createElement("p", null,
                                react_1["default"].createElement("a", { href: "https://gateway.pinata.cloud/ipfs/" + encryptedKey, target: "_blank" },
                                    react_1["default"].createElement("p", null,
                                        "Encrypted Key: ",
                                        encryptedKey))),
                            " "));
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, ErasureHelper.multihash({
                            input: feedData[1][2].encryptedData,
                            inputType: "sha2-256",
                            outputType: "b58"
                        })];
                    case 4:
                        encryptedData = _a.sent();
                        scaffold_eth_1.notification.info(react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", null,
                                react_1["default"].createElement("a", { href: "https://gateway.pinata.cloud/ipfs/" + encryptedData, target: "_blank" },
                                    react_1["default"].createElement("p", null,
                                        "Encrypted Data: ",
                                        encryptedData)))));
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function renounce() {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.renouncePost())];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, (tx === null || tx === void 0 ? void 0 : tx.wait())];
                    case 2:
                        _a.sent();
                        scaffold_eth_1.notification.success("Refund successful");
                        return [2 /*return*/];
                }
            });
        });
    }
    function createSiwe(address, statement) {
        return __awaiter(this, void 0, void 0, function () {
            var domain, origin, siweMessage, messageToSign;
            return __generator(this, function (_a) {
                domain = "localhost:3000";
                origin = "http://localhost:3000/";
                siweMessage = new siwe_1.SiweMessage({
                    domain: domain,
                    address: address,
                    statement: statement,
                    uri: origin,
                    version: "1",
                    chainId: 11155111
                });
                console.log("siweMessage", siweMessage);
                messageToSign = siweMessage.prepareMessage();
                console.log("messageToSign", messageToSign);
                return [2 /*return*/, messageToSign];
            });
        });
    }
    function getAuthSign() {
        return __awaiter(this, void 0, void 0, function () {
            var messageToSign, signature, _a, _b, _c, recoveredAddress, encodedSiweResource, authSig;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, createSiwe(ethers_1.ethers.utils.getAddress(userAddress), "Free the web!")];
                    case 1:
                        messageToSign = _d.sent();
                        if (!(signer === null || signer === void 0)) return [3 /*break*/, 2];
                        _a = void 0;
                        return [3 /*break*/, 4];
                    case 2:
                        _c = (_b = signer).signMessage;
                        return [4 /*yield*/, messageToSign];
                    case 3:
                        _a = _c.apply(_b, [_d.sent()]);
                        _d.label = 4;
                    case 4: return [4 /*yield*/, (_a)];
                    case 5:
                        signature = _d.sent();
                        console.log("signature", signature);
                        recoveredAddress = ethers_1.ethers.utils.verifyMessage(messageToSign, String(signature));
                        console.log("recoveredAddress", recoveredAddress);
                        console.log("test");
                        encodedSiweResource = response;
                        authSig = {
                            sig: signature,
                            derivedVia: "web3.eth.personal.sign",
                            signedMessage: messageToSign,
                            address: recoveredAddress,
                            resources: ["litParam:response:" + encodedSiweResource]
                        };
                        console.log("AuthSig", authSig);
                        setAuthSig(authSig);
                        return [2 /*return*/, authSig];
                }
            });
        });
    }
    var uploadImageToIpfs = function (file) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (!file) {
                    throw new Error("No file specified");
                }
                console.log(file);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        // zip file
                        reader.readAsDataURL(file);
                        reader.onloadend = function () {
                            setPostRawData(reader.result);
                        };
                        reader.onerror = function (event) {
                            reject(event);
                        };
                        scaffold_eth_1.notification.success("File uploaded to IPFS");
                        setImage(String(reader.result));
                    })];
            }
            catch (error) {
                scaffold_eth_1.notification.error('Error uploading file: "${error}');
            }
            return [2 /*return*/];
        });
    }); };
    var uploadJsonToIpfs = function (imageFile) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, uploadImageToIpfs(imageFile)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    scaffold_eth_1.notification.error('Error uploading file: "${error}');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleImageDrop = function (acceptedFiles) {
        setImageFile(acceptedFiles[0]);
        uploadJsonToIpfs(acceptedFiles[0]);
    };
    var fetchData = function fetchData() {
        return __awaiter(this, void 0, void 0, function () {
            var data, user_1, sellerDeposit, buyerDeposit, totalStaked_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(feedCtx && signer && provider)) return [3 /*break*/, 7];
                        console.log("Handle Fetching Data...");
                        console.log("Feed Address: ", feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address);
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.post())];
                    case 1:
                        data = _b.sent();
                        console.log("Data: ", data);
                        return [4 /*yield*/, (usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.getUserData(signer === null || signer === void 0 ? void 0 : signer.getAddress()))];
                    case 2:
                        user_1 = _b.sent();
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getSellerStake())];
                    case 3:
                        sellerDeposit = _b.sent();
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getBuyerStake())];
                    case 4:
                        buyerDeposit = _b.sent();
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getTotalStaked())];
                    case 5:
                        totalStaked_1 = _b.sent();
                        setSellerStake(String(sellerDeposit));
                        setBuyerStake(utils_1.formatEther(buyerDeposit));
                        setTotalStaked(utils_1.formatEther(totalStaked_1));
                        setUserData(user_1);
                        setFeedData(data);
                        _a = setPostCount;
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.postCount())];
                    case 6:
                        _a.apply(void 0, [_b.sent()]);
                        console.log(data);
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    var createPost = function createPost() {
        return __awaiter(this, void 0, void 0, function () {
            var pubKey, dataSaved, proofOfHashEncode, tx;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchData()];
                    case 1:
                        _a.sent();
                        console.log("PubKey:", vaultId);
                        pubKey = vaultId;
                        return [4 /*yield*/, savePost(postRawData)];
                    case 2:
                        dataSaved = _a.sent();
                        scaffold_eth_1.notification.warning(react_1["default"].createElement("div", { id: "alert-additional-content-3", className: "p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800", role: "alert" },
                            react_1["default"].createElement("div", { className: "flex items-center" },
                                react_1["default"].createElement("svg", { "aria-hidden": "true", className: "w-5 h-5 mr-2", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
                                    react_1["default"].createElement("path", { "fill-rule": "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", "clip-rule": "evenodd" })),
                                react_1["default"].createElement("span", { className: "sr-only" }, "Info"),
                                react_1["default"].createElement("h3", { className: "text-lg font-medium" }, "Save Symmetic Key!")),
                            react_1["default"].createElement("div", { className: "flex" },
                                react_1["default"].createElement("button", { type: "button", className: "text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800", onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            navigator.clipboard.writeText(JSON.stringify(dataSaved === null || dataSaved === void 0 ? void 0 : dataSaved.symmetricKey));
                                            scaffold_eth_1.notification.success("Symmetric key copied to clipboard");
                                            return [2 /*return*/];
                                        });
                                    }); } },
                                    react_1["default"].createElement("svg", { "aria-hidden": "true", className: "-ml-0.5 mr-2 h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
                                        react_1["default"].createElement("path", { d: "M10 12a2 2 0 100-4 2 2 0 000 4z" }),
                                        react_1["default"].createElement("path", { "fill-rule": "evenodd", d: "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", "clip-rule": "evenodd" })),
                                    "Copy to clipboard"))));
                        scaffold_eth_1.notification.warning("Save this data");
                        //saveAs(JSON.stringify(dataSaved), String(postCount) + feedCtx?.address + "_sellData.json");
                        downloadFile({
                            data: JSON.stringify(dataSaved),
                            fileName: String(postCount) + "_" + (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address) + "_sellData.json",
                            fileType: "text/json"
                        });
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: dataSaved === null || dataSaved === void 0 ? void 0 : dataSaved.proofhash,
                                inputType: "b58",
                                outputType: "digest"
                            })];
                    case 3:
                        proofOfHashEncode = _a.sent();
                        console.log("ProofHash", proofOfHashEncode);
                        console.log("Start Tx...");
                        console.log("Signer Address: ", signer === null || signer === void 0 ? void 0 : signer.getAddress());
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.createPost(proofOfHashEncode, Number(postType), Number(postDuration), ethers_1.ethers.constants.AddressZero, utils_1.parseEther(buyerPayment), response, {
                                value: utils_1.parseEther(postStake)
                            }))];
                    case 4:
                        tx = _a.sent();
                        console.log(tx);
                        return [4 /*yield*/, (tx === null || tx === void 0 ? void 0 : tx.wait())];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    function acceptPost() {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.acceptPost(response, { value: utils_1.parseEther(postPayment) }))];
                    case 1:
                        tx = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function savePost(RawData) {
        return __awaiter(this, void 0, Promise, function () {
            var pinata, pinataAuth, postData, pin, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Saving Data...");
                        // Check Pinata credentials.
                        if (!pinataApiKey || !pinataApiSecret) {
                            console.log("Please call with Pinata Account Credentials");
                            return [2 /*return*/];
                        }
                        pinata = new sdk_1["default"](pinataApiKey, pinataApiSecret);
                        return [4 /*yield*/, pinata.testAuthentication()];
                    case 1:
                        pinataAuth = _a.sent();
                        if ((pinataAuth === null || pinataAuth === void 0 ? void 0 : pinataAuth.authenticated) !== true) {
                            console.log("Pinata Authentication Failed.");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, createPostData(RawData)];
                    case 2:
                        postData = _a.sent();
                        if (!postData) {
                            console.log("Error creating post data.");
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, pinata.pinJSONToIPFS({ encryptedData: postData.encryptedData })];
                    case 4:
                        pin = _a.sent();
                        if ((pin === null || pin === void 0 ? void 0 : pin.IpfsHash) !== postData.proofJson.encryptedDatahash) {
                            console.log("Error with Encrypted Data Hash.");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pinata.pinJSONToIPFS(postData.proofJson)];
                    case 5:
                        // Save proof JSON to IPFS.
                        pin = _a.sent();
                        if (pin.IpfsHash !== postData.proofhash) {
                            console.log("Error with proof Hash.");
                            return [2 /*return*/];
                        }
                        console.log("Data Saved.");
                        return [2 /*return*/, postData];
                    case 6:
                        err_1 = _a.sent();
                        console.log("Error saving data to IPFS:", err_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    function createPostData(RawData) {
        return __awaiter(this, void 0, void 0, function () {
            var authSig_1, _a, encryptedString, symmetricKey_1, _chain, encryptedSymmetricKey, encryptedFile, symmetricKeyHash, dataHash, encryptedDataHash, jsonblob_v1_2_0, proofHash58, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Creating Data...");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, getAuthSign()];
                    case 2:
                        authSig_1 = _b.sent();
                        console.log("AuthSig Generated");
                        return [4 /*yield*/, lit.encryptFile(RawData)];
                    case 3:
                        _a = _b.sent(), encryptedString = _a.encryptedString, symmetricKey_1 = _a.symmetricKey;
                        _chain = "sepolia";
                        console.log("Encrypted String", encryptedString);
                        console.log("Symmetric Key", symmetricKey_1);
                        return [4 /*yield*/, (lit === null || lit === void 0 ? void 0 : lit.saveEncryptionKey({
                                accessControlConditions: evmContractConditions,
                                symmetricKey: symmetricKey_1,
                                authSig: authSig_1,
                                chain: _chain
                            }))];
                    case 4:
                        encryptedSymmetricKey = _b.sent();
                        encryptedFile = encryptedString;
                        symmetricKeyHash = lit.uint8arrayToString(encryptedSymmetricKey, "base16");
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: RawData,
                                inputType: "raw",
                                outputType: "hex"
                            })];
                    case 5:
                        dataHash = _b.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify({ encryptedData: encryptedFile }),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 6:
                        encryptedDataHash = _b.sent();
                        jsonblob_v1_2_0 = {
                            creator: seller,
                            creatorPubKey: sellerPubKey,
                            salt: ErasureHelper.crypto.asymmetric.generateNonce(),
                            datahash: dataHash,
                            encryptedDatahash: encryptedDataHash,
                            keyhash: symmetricKeyHash
                        };
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify(jsonblob_v1_2_0),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 7:
                        proofHash58 = _b.sent();
                        console.log("RawData", RawData);
                        console.log("Encrypted File", encryptedFile);
                        console.log("Symmetric Key", symmetricKey_1);
                        console.log("Key Hash", symmetricKeyHash);
                        console.log("Datahash", dataHash);
                        console.log("Encrypted DataHash", encryptedDataHash);
                        console.log("ProofHash", proofHash58);
                        return [2 /*return*/, {
                                proofJson: jsonblob_v1_2_0,
                                proofhash: proofHash58,
                                symmetricKey: symmetricKey_1,
                                encryptedData: encryptedFile
                            }];
                    case 8:
                        e_1 = _b.sent();
                        console.log(e_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    function submitData() {
        return __awaiter(this, void 0, void 0, function () {
            var abiCoder, proofhash, sellerPubKeyDecoded, encrypted, json_selldata_v120, pinata, pinataAuth, pin, proofHash58, proofHash58Digest, responseIPFS, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abiCoder = new ethers_1.ethers.utils.AbiCoder();
                        proofhash = abiCoder.decode(["bytes32"], feedData[1][2].encryptedData);
                        sellerPubKeyDecoded = userData.wallet;
                        console.log("Seller Decoded", sellerPubKeyDecoded);
                        encrypted = customEncryption(String(vaultId), symmetricKey);
                        json_selldata_v120 = {
                            esp_version: "v1.2.0",
                            proofhash: proofhash,
                            sender: signer === null || signer === void 0 ? void 0 : signer.getAddress(),
                            encryptedSymKey: encrypted
                        };
                        return [4 /*yield*/, new sdk_1["default"](pinataApiKey, pinataApiSecret)];
                    case 1:
                        pinata = _a.sent();
                        return [4 /*yield*/, pinata.testAuthentication()];
                    case 2:
                        pinataAuth = _a.sent();
                        if (pinataAuth.authenticated !== true) {
                            console.log("Pinata Authentication Failed.");
                            return [2 /*return*/];
                        }
                        console.log("Saving proof JSON...");
                        scaffold_eth_1.notification.success("Saving proof JSON...");
                        return [4 /*yield*/, pinata.pinJSONToIPFS(json_selldata_v120)];
                    case 3:
                        pin = _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify(json_selldata_v120),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 4:
                        proofHash58 = _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: proofHash58,
                                inputType: "b58",
                                outputType: "digest"
                            })];
                    case 5:
                        proofHash58Digest = _a.sent();
                        if (pin.IpfsHash !== proofHash58) {
                            console.log("Error with proof Hash.");
                            console.log(pin.IpfsHash);
                            console.log(proofHash58);
                            return [2 /*return*/];
                        }
                        console.log("Data Saved.");
                        scaffold_eth_1.notification.success("Data Saved.");
                        return [4 /*yield*/, axios_1["default"].get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + pin.IpfsHash, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 6:
                        responseIPFS = _a.sent();
                        // check response is ipfs valid content
                        if (responseIPFS.data.esp_version !== "v1.2.0") {
                            console.log("Error with proof Hash.");
                            console.log(responseIPFS.data.esp_version);
                            console.log("v1.2.0");
                            return [2 /*return*/];
                        }
                        console.log("Data Retrieved.");
                        console.log("Proof Hash Digest: ", proofHash58Digest);
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.submitHash(proofHash58Digest, response))];
                    case 7:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, fetchData()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, {
                                proofJson: json_selldata_v120,
                                proofHash58: proofHash58,
                                proofHash58Decode: proofHash58Digest
                            }];
                }
            });
        });
    }
    function customEncryption(secretKey, message) {
        var algorithm = "aes-256-cbc"; // Algoritmo di cifratura
        var key = crypto_1["default"].createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta
        var iv = crypto_1["default"].randomBytes(16); // Vettore di inizializzazione casuale
        var cipher = crypto_1["default"].createCipheriv(algorithm, key, iv);
        var encrypted = cipher.update(message, "utf8", "hex");
        encrypted += cipher.final("hex");
        // Concatenare il vettore di inizializzazione e il messaggio cifrato
        return iv.toString("hex") + encrypted;
    }
    function customDecryption(secretKey, encryptedMessage) {
        var algorithm = "aes-256-cbc"; // Algoritmo di cifratura
        var key = crypto_1["default"].createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta
        // Separare il vettore di inizializzazione dal messaggio cifrato
        var iv = Buffer.from(encryptedMessage.slice(0, 32), "hex");
        var encrypted = encryptedMessage.slice(32);
        var decipher = crypto_1["default"].createDecipheriv(algorithm, key, iv);
        var decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    var downloadFile = function (_a) {
        var data = _a.data, fileName = _a.fileName, fileType = _a.fileType;
        if (!data || !fileName || !fileType) {
            throw new Error("Invalid inputs");
        }
        var blob = new Blob([data], { type: fileType });
        var a = document.createElement("a");
        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);
        var clickEvt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true
        });
        a.dispatchEvent(clickEvt);
        a.remove();
    };
    function retrievePost() {
        return __awaiter(this, void 0, void 0, function () {
            var vaultIdSecret, decodeHash, responseDecodeHash, responseDecodeHahJSON, encryptedSymKey, messageToSign, signature, _a, _b, _c, recoveredAddress, encodedSiweResource, authSig, symmetricKey, decrypted, _decodeHash, url, responseProofHash, responseProofHashJSON, response_Encrypteddatahash, response_Encrypteddatahash_JSON, decryptFile, dataHash, hashCheck, mimeType, file;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getVaultIdSecret(response))];
                    case 1:
                        vaultIdSecret = _d.sent();
                        console.log("Retrieving Data...");
                        return [4 /*yield*/, fetchData()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: feedData[1][2].encryptedKey,
                                inputType: "sha2-256",
                                outputType: "b58"
                            })];
                    case 3:
                        decodeHash = _d.sent();
                        console.log("Decoded Hash: ", decodeHash);
                        return [4 /*yield*/, axios_1["default"].get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + decodeHash, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 4:
                        responseDecodeHash = _d.sent();
                        return [4 /*yield*/, JSON.parse(JSON.stringify(responseDecodeHash.data))];
                    case 5:
                        responseDecodeHahJSON = _d.sent();
                        console.log("Response Decode Hash: ", responseDecodeHahJSON);
                        return [4 /*yield*/, JSON.parse(JSON.stringify(responseDecodeHahJSON.encryptedSymKey))];
                    case 6:
                        encryptedSymKey = _d.sent();
                        console.log("Encrypted Symmetric Key: ", encryptedSymKey);
                        return [4 /*yield*/, createSiwe(ethers_1.ethers.utils.getAddress(userAddress), "Free the web!")];
                    case 7:
                        messageToSign = _d.sent();
                        if (!(signer === null || signer === void 0)) return [3 /*break*/, 8];
                        _a = void 0;
                        return [3 /*break*/, 10];
                    case 8:
                        _c = (_b = signer).signMessage;
                        return [4 /*yield*/, messageToSign];
                    case 9:
                        _a = _c.apply(_b, [_d.sent()]);
                        _d.label = 10;
                    case 10: return [4 /*yield*/, (_a)];
                    case 11:
                        signature = _d.sent();
                        recoveredAddress = ethers_1.ethers.utils.verifyMessage(messageToSign, String(signature));
                        if (!!lit) return [3 /*break*/, 13];
                        return [4 /*yield*/, lit.connect()];
                    case 12:
                        _d.sent();
                        _d.label = 13;
                    case 13:
                        encodedSiweResource = response;
                        authSig = {
                            sig: signature,
                            derivedVia: "web3.eth.personal.sign",
                            signedMessage: messageToSign,
                            address: recoveredAddress,
                            resources: ["litParam:response:" + encodedSiweResource]
                        };
                        return [4 /*yield*/, this.litNodeClient.getEncryptionKey({
                                accessControlConditions: evmContractConditions,
                                toDecrypt: encryptedSymKey,
                                chain: chain,
                                authSig: authSig
                            })];
                    case 14:
                        symmetricKey = _d.sent();
                        return [4 /*yield*/, lit.decryptString(encryptedSymKey, symmetricKey)];
                    case 15:
                        decrypted = _d.sent();
                        // END LIT
                        //const decrypted = customDecryption(String(vaultIdSecret), encryptedSymKey);
                        //const decrypted = ErasureHelper.crypto.symmetric.decryptMessage(vaultIdSecret, encryptedSymKey);
                        console.log(decrypted);
                        console.log(responseDecodeHahJSON.proofhash);
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: responseDecodeHahJSON.proofhash.toString(),
                                inputType: "sha2-256",
                                outputType: "b58"
                            })];
                    case 16:
                        _decodeHash = _d.sent();
                        url = "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + _decodeHash;
                        console.log(url);
                        return [4 /*yield*/, axios_1["default"].get(url, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 17:
                        responseProofHash = _d.sent();
                        console.log(responseProofHash);
                        responseProofHashJSON = JSON.parse(JSON.stringify(responseProofHash.data));
                        console.log(responseProofHashJSON);
                        return [4 /*yield*/, axios_1["default"].get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + responseProofHashJSON.encryptedDatahash, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 18:
                        response_Encrypteddatahash = _d.sent();
                        response_Encrypteddatahash_JSON = JSON.parse(JSON.stringify(response_Encrypteddatahash.data));
                        decryptFile = ErasureHelper.crypto.symmetric.decryptMessage(decrypted, response_Encrypteddatahash_JSON.encryptedData);
                        if (!decryptFile) return [3 /*break*/, 21];
                        // wait 10 seconds
                        console.log("Decrypted Data: ", decryptFile);
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: decryptFile,
                                inputType: "raw",
                                outputType: "hex"
                            })];
                    case 19:
                        dataHash = _d.sent();
                        hashCheck = responseProofHashJSON.datahash === dataHash;
                        if (feedData[1][0].postType == 1 ||
                            feedData[1][0].postType == 2 ||
                            feedData[1][0].postType == 3 ||
                            feedData[1][0].postType == 4) {
                            mimeType = base64Mime(decryptFile);
                            file = convertBase64ToFile(decryptFile, String(postCount) + (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address) + "_decryptedData" + "." + (mimeType === null || mimeType === void 0 ? void 0 : mimeType.split("/")[1]));
                            file_saver_1.saveAs(file, String(postCount) + (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address) + "_decryptedData" + "." + (mimeType === null || mimeType === void 0 ? void 0 : mimeType.split("/")[1]));
                        }
                        else {
                            scaffold_eth_1.notification.success(decryptFile);
                        }
                        return [4 /*yield*/, fetchData()];
                    case 20:
                        _d.sent();
                        return [2 /*return*/, {
                                rawData: decrypted,
                                hashCheck: hashCheck
                            }];
                    case 21:
                        console.log("Error decrypting message.");
                        return [2 /*return*/, null];
                }
            });
        });
    }
    var convertBase64ToFile = function (base64String, fileName) {
        var arr = base64String.split(",");
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var uint8Array = new Uint8Array(n);
        while (n--) {
            uint8Array[n] = bstr.charCodeAt(n);
        }
        var file = new File([uint8Array], fileName, { type: mime });
        return file;
    };
    function revealPost() {
        return __awaiter(this, void 0, void 0, function () {
            var symKeyHash, rawDataHash, pinata, pinataAuth, pin, AbiCoder, dataEncoded, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ErasureHelper.multihash({
                            input: JSON.stringify({ symmetricKey: symmetricKey }),
                            inputType: "raw",
                            outputType: "b58"
                        })];
                    case 1:
                        symKeyHash = _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify({ rawData: postRawData }),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 2:
                        rawDataHash = _a.sent();
                        // IPFS needs Pinata account credentials.
                        if (pinataApiKey === undefined || pinataApiSecret === undefined) {
                            console.log("Please call with Pinata Account Credentials");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, new sdk_1["default"](pinataApiKey, pinataApiSecret)];
                    case 3:
                        pinata = _a.sent();
                        return [4 /*yield*/, pinata.testAuthentication()];
                    case 4:
                        pinataAuth = _a.sent();
                        if (pinataAuth.authenticated !== true) {
                            console.log("Pinata Authentication Failed.");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pinata.pinJSONToIPFS({ symmetricKey: symmetricKey })];
                    case 5:
                        pin = _a.sent();
                        return [4 /*yield*/, pinata.pinJSONToIPFS({ rawData: postRawData })];
                    case 6:
                        // Saves the data to IPFS.
                        pin = _a.sent();
                        console.log("Data Saved.");
                        AbiCoder = new ethers_1.ethers.utils.AbiCoder();
                        dataEncoded = AbiCoder.encode(["string", "string"], [symKeyHash, rawDataHash]);
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.revealData(dataEncoded))];
                    case 7:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, fetchData()];
                    case 9:
                        _a.sent();
                        if (tx.hash) {
                            scaffold_eth_1.notification.success("Post Revealed");
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function addStake() {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Adding Stake...");
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.addStake({ value: utils_1.parseEther(stakeAmount) }))];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, fetchData()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function takeStake() {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Adding Stake...");
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.takeStake(utils_1.parseEther(stakeAmount), response))];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, fetchData()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function finalizePost() {
        return __awaiter(this, void 0, void 0, function () {
            var tx, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Finalizing Data...");
                        if (!(valid == true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.finalizePost(valid, utils_1.parseEther("0"), response))];
                    case 1:
                        tx = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.finalizePost(valid, utils_1.parseEther(punishment), response))];
                    case 3:
                        tx = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, fetchData()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    react_1.useEffect(function () {
        if (signer && provider && feedCtx && router.isReady) {
            try {
                var fetch = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("Fetching Data...");
                                return [4 /*yield*/, fetchData()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                fetch();
            }
            catch (e) {
                console.error(e);
            }
        }
    }, [feedCtx, router.isReady]);
    return (react_1["default"].createElement("div", { className: "flex flex-col items-center pt-2 p-2 m-2" }, feedData[0] != null ? (react_1["default"].createElement("div", { className: "flex flex-col py-5 justify-center  items-center" },
        react_1["default"].createElement("div", { className: "flex flex-wrap text-left  " },
            react_1["default"].createElement("div", { tabIndex: 0, className: "collapse" },
                react_1["default"].createElement("div", { className: "collapse-title text-xl font-medium hover:bg-primary" }, "Seller"),
                react_1["default"].createElement("div", { className: "collapse-content" },
                    react_1["default"].createElement("label", { htmlFor: "modal-create", className: "btn modal-button mx-2 my-2" }, "Create (S)"),
                    react_1["default"].createElement("input", { type: "checkbox", id: "modal-create", className: "modal-toggle " }),
                    react_1["default"].createElement("div", { className: "modal" },
                        react_1["default"].createElement("div", { className: "modal-box rounded-lg shadow-xl" },
                            react_1["default"].createElement("div", { className: "modal-header" },
                                react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Create Post"),
                                react_1["default"].createElement("label", { htmlFor: "modal-create", className: "btn btn-ghost" },
                                    react_1["default"].createElement("i", { className: "fas fa-times" }))),
                            react_1["default"].createElement("div", { className: "modal-body w-auto space-y-6 text-left" },
                                react_1["default"].createElement("label", { className: "block text-base-500" }, "Duration"),
                                react_1["default"].createElement("select", { className: "form-select w-full mb-8", value: postDuration, onChange: function (e) { return setPostDuration(e.target.value); } },
                                    react_1["default"].createElement("option", { value: "0" }, "3 Days"),
                                    react_1["default"].createElement("option", { value: "1" }, "1 Week"),
                                    react_1["default"].createElement("option", { value: "2" }, "2 Weeks"),
                                    react_1["default"].createElement("option", { value: "3" }, "1 Month")),
                                react_1["default"].createElement("label", { className: "block text-base-500 mt-8" }, "Stake"),
                                react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Amount", value: postStake, onChange: function (e) { return setPostStake(e.target.value); } }),
                                react_1["default"].createElement("label", { className: "block text-base-500 mt-8" }, "Buyer Payment "),
                                react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Put 0 to allow buyer decide the payment", value: buyerPayment, onChange: function (e) { return setBuyerPayment(e.target.value); } }),
                                react_1["default"].createElement("label", { className: "block text-base-500" }, "Type"),
                                react_1["default"].createElement("select", { className: "form-select w-full", value: postType, onChange: function (e) { return setPostType(e.target.value); } },
                                    react_1["default"].createElement("option", { value: "0" }, "Text"),
                                    react_1["default"].createElement("option", { value: "1" }, "Image"),
                                    react_1["default"].createElement("option", { value: "2" }, "Video"),
                                    react_1["default"].createElement("option", { value: "3" }, "Audio"),
                                    react_1["default"].createElement("option", { value: "4" }, "File")),
                                postType == 0 ? (react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "block text-base-500" }, "Message"),
                                    react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Data", value: postRawData, onChange: function (e) { return setPostRawData(e.target.value); } }))) : postType == 1 || 2 || 3 || 4 ? (react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(react_dropzone_1["default"], { onDrop: handleImageDrop }, function (_a) {
                                        var getRootProps = _a.getRootProps, getInputProps = _a.getInputProps;
                                        return (react_1["default"].createElement("div", __assign({}, getRootProps(), { className: "flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer" }),
                                            react_1["default"].createElement("input", __assign({}, getInputProps())),
                                            imageFile ? (react_1["default"].createElement("p", null, imageFile === null || imageFile === void 0 ? void 0 : imageFile.name)) : (react_1["default"].createElement("p", null, "Drag 'n' drop an image here, or click to select a file"))));
                                    }))) : null,
                                react_1["default"].createElement("button", { className: "btn btn-primary w-full mt-4", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var postData;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, createPost()];
                                                case 1:
                                                    postData = _a.sent();
                                                    console.log(postData);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } }, "Create Post")),
                            react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                                react_1["default"].createElement("label", { htmlFor: "modal-create", className: "btn" }, "Close")))),
                    react_1["default"].createElement("label", { htmlFor: "modal-submit", className: "btn  modal-button mx-2 my-2" }, "Submit (S)"),
                    react_1["default"].createElement("input", { type: "checkbox", id: "modal-submit", className: "modal-toggle " }),
                    react_1["default"].createElement("div", { className: "modal" },
                        react_1["default"].createElement("div", { className: "modal-box" },
                            react_1["default"].createElement("div", { className: "modal-header" },
                                react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Submit Post"),
                                react_1["default"].createElement("label", { htmlFor: "modal-submit", className: "btn btn-ghost" },
                                    react_1["default"].createElement("i", { className: "fas fa-times" }))),
                            react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                                react_1["default"].createElement("input", { type: "password", className: "input w-full", placeholder: "Symmetric Key", value: symmetricKey, onChange: function (e) { return setSymmetricKey(e.target.value); } }),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var postData;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, submitData()];
                                                case 1:
                                                    postData = _a.sent();
                                                    console.log(postData);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } }, "Submit")),
                            react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                                react_1["default"].createElement("label", { htmlFor: "modal-submit", className: "btn" }, "Close")))),
                    react_1["default"].createElement("label", { htmlFor: "modal-reveal", className: "btn  modal-button mx-2 my-2" }, "Reveal (S)"),
                    react_1["default"].createElement("input", { type: "checkbox", id: "modal-reveal", className: "modal-toggle" }),
                    react_1["default"].createElement("div", { className: "modal" },
                        react_1["default"].createElement("div", { className: "modal-box" },
                            react_1["default"].createElement("div", { className: "modal-header" },
                                react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Reveal Post"),
                                react_1["default"].createElement("label", { htmlFor: "modal-reveal", className: "btn btn-ghost" },
                                    react_1["default"].createElement("i", { className: "fas fa-times" }))),
                            react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("input", { type: "password", className: "input w-full", placeholder: "Symmetric Key", value: symmetricKey, onChange: function (e) { return setSymmetricKey(e.target.value); } }),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("label", { className: "block text-base-500" }, "Type"),
                                react_1["default"].createElement("select", { className: "form-select w-full", value: postType, onChange: function (e) { return setPostType(e.target.value); } },
                                    react_1["default"].createElement("option", { value: "0" }, "Text"),
                                    react_1["default"].createElement("option", { value: "1" }, "Image"),
                                    react_1["default"].createElement("option", { value: "2" }, "Video"),
                                    react_1["default"].createElement("option", { value: "3" }, "Audio"),
                                    react_1["default"].createElement("option", { value: "4" }, "File")),
                                postType == 0 ? (react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "block text-base-500" }, "Message"),
                                    react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Data", value: postRawData, onChange: function (e) { return setPostRawData(e.target.value); } }))) : postType == 1 || 2 || 3 || 4 ? (react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(react_dropzone_1["default"], { onDrop: handleImageDrop }, function (_a) {
                                        var getRootProps = _a.getRootProps, getInputProps = _a.getInputProps;
                                        return (react_1["default"].createElement("div", __assign({}, getRootProps(), { className: "flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer" }),
                                            react_1["default"].createElement("input", __assign({}, getInputProps())),
                                            imageFile ? (react_1["default"].createElement("p", null, imageFile === null || imageFile === void 0 ? void 0 : imageFile.name)) : (react_1["default"].createElement("p", null, "Drag 'n' drop an image here, or click to select a file"))));
                                    }))) : null,
                                react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var postData;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, revealPost()];
                                                case 1:
                                                    postData = _a.sent();
                                                    console.log(postData);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } }, "Submit")),
                            react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                                react_1["default"].createElement("label", { htmlFor: "modal-reveal", className: "btn" }, "Close")))),
                    react_1["default"].createElement("label", { className: "btn  modal-button mx-2 my-2", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, renounce()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); } }, "Renounce (S)"))),
            react_1["default"].createElement("div", { tabIndex: 0, className: "collapse" },
                react_1["default"].createElement("div", { className: "collapse-title text-xl font-medium hover:bg-primary" }, "Buyer"),
                react_1["default"].createElement("div", { className: "collapse-content" },
                    react_1["default"].createElement("label", { htmlFor: "modal-accept", className: "btn  modal-button   mx-2 my-2" }, "Accept (B)"),
                    react_1["default"].createElement("input", { type: "checkbox", id: "modal-accept", className: "modal-toggle" }),
                    react_1["default"].createElement("div", { className: "modal" },
                        react_1["default"].createElement("div", { className: "modal-box" },
                            react_1["default"].createElement("div", { className: "modal-header" },
                                react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Accept Post"),
                                react_1["default"].createElement("label", { htmlFor: "modal-accept", className: "btn btn-ghost" },
                                    react_1["default"].createElement("i", { className: "fas fa-times" }))),
                            react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                                "Amount to Pay for Data ",
                                "",
                                react_1["default"].createElement("input", { type: "text", className: "input w-full mt-8", placeholder: "Amount", value: postPayment, onChange: function (e) { return setPostPayment(e.target.value); } }),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var postData;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, acceptPost()];
                                                case 1:
                                                    postData = _a.sent();
                                                    console.log(postData);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } }, "Accept Post")),
                            react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                                react_1["default"].createElement("label", { htmlFor: "modal-accept", className: "btn" }, "Close")))),
                    react_1["default"].createElement("label", { htmlFor: "modal-retrieve", className: "btn    modal-button mx-2 my-2" }, "Retrieve (B)"),
                    react_1["default"].createElement("input", { type: "checkbox", id: "modal-retrieve", className: "modal-toggle" }),
                    react_1["default"].createElement("div", { className: "modal" },
                        react_1["default"].createElement("div", { className: "modal-box" },
                            react_1["default"].createElement("div", { className: "modal-header" },
                                react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Retrieve Post"),
                                react_1["default"].createElement("label", { htmlFor: "modal-retrieve", className: "btn btn-ghost" },
                                    react_1["default"].createElement("i", { className: "fas fa-times" }))),
                            react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("input", { type: "password", className: "input w-full", placeholder: "Secret Key", value: secretKey, onChange: function (e) { return setSecretKey(e.target.value); } }),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var postData;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, retrievePost()];
                                                case 1:
                                                    postData = _a.sent();
                                                    console.log(postData);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } }, "Submit")),
                            react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                                react_1["default"].createElement("label", { htmlFor: "modal-retrieve", className: "btn" }, "Close")))),
                    react_1["default"].createElement("label", { htmlFor: "modal-finalize", className: "btn   modal-button mx-2 my-2" }, "Finalize (B)"),
                    react_1["default"].createElement("input", { type: "checkbox", id: "modal-finalize", className: "modal-toggle" }),
                    react_1["default"].createElement("div", { className: "modal" },
                        react_1["default"].createElement("div", { className: "modal-box" },
                            react_1["default"].createElement("div", { className: "modal-header" },
                                react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Finalize Post"),
                                react_1["default"].createElement("label", { htmlFor: "modal-finalize", className: "btn btn-ghost" },
                                    react_1["default"].createElement("i", { className: "fas fa-times" }))),
                            react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Punishment", disabled: valid, value: punishment, onChange: function (e) { return setPunishment(e.target.value); } }),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("input", { type: "checkbox", className: "form-checkbox", checked: valid, onChange: function (e) { return setValid(e.target.checked); } }),
                                react_1["default"].createElement("label", { className: "ml-2" }, "Valid"),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var postData;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, finalizePost()];
                                                case 1:
                                                    postData = _a.sent();
                                                    console.log(postData);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } }, "Submit")),
                            react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                                react_1["default"].createElement("label", { htmlFor: "modal-finalize", className: "btn" }, "Close")))))),
            react_1["default"].createElement("div", { className: "fle\u1E8B flex-row" },
                react_1["default"].createElement("label", { htmlFor: "modal-stake", className: "btn   modal-button  mx-2 my-2" }, "Stake"),
                react_1["default"].createElement("input", { type: "checkbox", id: "modal-stake", className: "modal-toggle" }),
                react_1["default"].createElement("div", { className: "modal" },
                    react_1["default"].createElement("div", { className: "modal-box" },
                        react_1["default"].createElement("div", { className: "modal-header" },
                            react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Stake"),
                            react_1["default"].createElement("label", { htmlFor: "modal-stake", className: "btn btn-ghost" },
                                react_1["default"].createElement("i", { className: "fas fa-times" }))),
                        react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                            react_1["default"].createElement("br", null),
                            react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Stake Amount", value: stakeAmount, onChange: function (e) { return setStakeAmount(e.target.value); } }),
                            react_1["default"].createElement("br", null),
                            react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var postData;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, addStake()];
                                            case 1:
                                                postData = _a.sent();
                                                console.log(postData);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); } }, "Add Stake"),
                            react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var postData;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, takeStake()];
                                            case 1:
                                                postData = _a.sent();
                                                console.log(postData);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); } }, "Take Stake")),
                        react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                            react_1["default"].createElement("label", { htmlFor: "modal-stake", className: "btn" }, "Close"))))),
            react_1["default"].createElement("button", { className: "btn   modal-button  mx-2 my-2", onClick: function () {
                    decodeData();
                } }, "Decode")),
        react_1["default"].createElement("div", { className: "flex flex-col  p-2 min-w-fit items-left justify-center" },
            react_1["default"].createElement("div", { className: "card w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-xl font-bold" }, "Creator Information"),
                    react_1["default"].createElement("div", { className: "mt-5" },
                        react_1["default"].createElement("p", { className: "text-lg" },
                            react_1["default"].createElement("span", { className: "font-bold" }, "Post Status:"),
                            " ",
                            feedData.postdata.settings.status === 6
                                ? "Revealed"
                                : feedData.postdata.settings.status === 5
                                    ? "Punished"
                                    : feedData.postdata.settings.status === 4
                                        ? "Finalized"
                                        : feedData.postdata.settings.status === 3
                                            ? "Submitted"
                                            : feedData.postdata.settings.status === 2
                                                ? "Accepted"
                                                : feedData.postdata.settings.status === 1
                                                    ? "Proposed"
                                                    : "Waiting for Creator"),
                        react_1["default"].createElement("div", { className: "w-1/2" },
                            react_1["default"].createElement("p", { className: "text-lg" },
                                react_1["default"].createElement("span", { className: "font-bold" }, "Seller Stake:"),
                                " ",
                                sellerStake / 1e18,
                                " ETH")),
                        react_1["default"].createElement("div", { className: "w-1/2" },
                            react_1["default"].createElement("p", { className: "text-lg" },
                                react_1["default"].createElement("span", { className: "font-bold" }, "Buyer Stake:"),
                                " ",
                                buyerStake,
                                " ETH")),
                        react_1["default"].createElement("p", { className: "text-lg" },
                            react_1["default"].createElement("span", { className: "font-bold" }, "Wallet:"),
                            " ",
                            feedData[0][0].toString())))),
            react_1["default"].createElement("div", { className: "divider" }),
            react_1["default"].createElement("div", { className: "card w-full md:w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-xl font-bold" }, "Post Settings"),
                    react_1["default"].createElement("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Creation Timestamp:"),
                            " ",
                            feedData[1][0].creationTimeStamp.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "End Timestamp:"),
                            " ",
                            feedData[1][0].endTimeStamp.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Duration:"),
                            " ",
                            feedData[1][0].duration.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Post Type:"),
                            " ",
                            feedData[1][0].postType.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Status:"),
                            " ",
                            feedData[1][0].status.toString())))),
            react_1["default"].createElement("div", { className: "divider" }),
            react_1["default"].createElement("div", { className: "card w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-xl font-bold" }, "Punishments"),
                    react_1["default"].createElement("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Buyer Punishment:"),
                            " ",
                            feedData[1][1].buyerPunishment.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Seller Punishment:"),
                            " ",
                            feedData[1][1].punishment.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Seller Stake:"),
                            " ",
                            feedData[1][1].stake.toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Buyer Payment:"),
                            " ",
                            feedData[1][1].payment.toString())))),
            react_1["default"].createElement("div", { className: "divider" }),
            react_1["default"].createElement("div", { className: "card w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-xl font-bold" }, "Data"),
                    react_1["default"].createElement("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Encrypted Data:"),
                            " ",
                            react_1["default"].createElement("span", { className: "break-all" }, feedData[1][2].encryptedData.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Encrypted Key:"),
                            " ",
                            react_1["default"].createElement("span", { className: "break-all" },
                                " ",
                                feedData[1][2].encryptedKey.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Decrypted Data:"),
                            react_1["default"].createElement("span", { className: "break-all" },
                                " ",
                                feedData[1][2].decryptedData.toString())))))))) : null));
};
function base64Mime(encoded) {
    var result = null;
    if (typeof encoded !== "string") {
        return result;
    }
    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) {
        result = mime[1];
    }
    return result;
}
exports["default"] = ViewFeed;
