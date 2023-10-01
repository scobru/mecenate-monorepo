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
var react_dropzone_1 = require("react-dropzone");
var file_saver_1 = require("file-saver");
var Spinner_1 = require("~~/components/Spinner");
var solid_1 = require("@heroicons/react/20/solid");
var crypto_1 = require("crypto");
var scaffold_eth_2 = require("~~/hooks/scaffold-eth");
var ViewFeed = function () {
    var signer = wagmi_1.useSigner().data;
    var provider = wagmi_1.useProvider();
    var router = router_1.useRouter();
    var txData = scaffold_eth_2.useTransactor(signer);
    var AbiCoder = new ethers_1.ethers.utils.AbiCoder();
    var customProvider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    var ErasureHelper = require("@erasure/crypto-ipfs");
    var pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
    var pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    var customWallet = new ethers_1.ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);
    var _a = react_1["default"].useState("0"), nonce = _a[0], setNonce = _a[1];
    var _b = react_1["default"].useState(""), withdrawalAddress = _b[0], setWithdrawalAddress = _b[1];
    var _c = react_1["default"].useState(""), tokenId = _c[0], setTokenId = _c[1];
    var chain = wagmi_1.useNetwork().chain;
    var addr = (router === null || router === void 0 ? void 0 : router.query).addr;
    var _d = react_1.useState(null), ethWallet = _d[0], setEthWallet = _d[1];
    var _e = react_1.useState(null), customSigner = _e[0], setCustomSigner = _e[1];
    var _f = react_1.useState([]), postType = _f[0], setPostType = _f[1];
    var _g = react_1.useState([]), postDuration = _g[0], setPostDuration = _g[1];
    var _h = react_1.useState([]), postStake = _h[0], setPostStake = _h[1];
    var _j = react_1.useState([]), postRawData = _j[0], setPostRawData = _j[1];
    var _k = react_1.useState([]), postPayment = _k[0], setPostPayment = _k[1];
    var _l = react_1.useState([]), symmetricKey = _l[0], setSymmetricKey = _l[1];
    var _m = react_1.useState(false), valid = _m[0], setValid = _m[1];
    var _o = react_1.useState(0), punishment = _o[0], setPunishment = _o[1];
    var _p = react_1.useState(""), buyerPayment = _p[0], setBuyerPayment = _p[1];
    var _q = react_1.useState(0), stakeAmount = _q[0], setStakeAmount = _q[1];
    var _r = react_1.useState(""), buyer = _r[0], setBuyer = _r[1];
    var _s = react_1["default"].useState(""), imageFile = _s[0], setImageFile = _s[1];
    var _t = react_1["default"].useState(""), image = _t[0], setImage = _t[1];
    var _u = react_1.useState(""), postCount = _u[0], setPostCount = _u[1];
    var _v = react_1["default"].useState(null), sismoData = _v[0], setSismoData = _v[1];
    var _w = react_1["default"].useState(null), verified = _w[0], setVerified = _w[1];
    var _x = react_1["default"].useState(null), sismoResponse = _x[0], setSismoResponse = _x[1];
    var _y = react_1.useState(0), yourStake = _y[0], setYourStake = _y[1];
    var _z = react_1.useState([]), hashedVaultId = _z[0], setHashedVaultId = _z[1];
    var _0 = react_1.useState(""), secretMessage = _0[0], setSecretMessage = _0[1];
    var _1 = react_1.useState(""), message = _1[0], setMessage = _1[1];
    var _2 = react_1.useState(""), userName = _2[0], setUserName = _2[1];
    var _3 = react_1.useState([]), feedData = _3[0], setFeedData = _3[1];
    var deployedContractFeed = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateFeed");
    var deployedContractUsers = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateUsers");
    var deployedContractVault = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateVault");
    var _4 = react_1.useState(""), receiver = _4[0], setReceiver = _4[1];
    var allStatuses = ["Waiting for Creator", "Proposed", "Accepted", "Submitted", "Finalized", "Punished", "Revealed"];
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
    var feedCtx = wagmi_1.useContract({
        address: addr,
        abi: feedAbi,
        signerOrProvider: customWallet
    });
    //******************** Messenger *********************//
    var sendTelegramMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var telegramIds, buyerID, sellerID, isBuyer, url, message_1, formattedText, response, error_1, message_2, formattedText, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(feedData.postdata.settings.status != 0 &&
                        feedData.postdata.settings.status != 1 &&
                        feedData.postdata.settings.status != 2)) return [3 /*break*/, 11];
                    return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getTelegramIds(utils_1.keccak256(sismoData.auths[0].userId)))];
                case 1:
                    telegramIds = _a.sent();
                    buyerID = telegramIds[0].toHexString().slice(33);
                    sellerID = telegramIds[1].toHexString().slice(33);
                    isBuyer = buyerID == sismoData.auths[3].userId;
                    url = "https://api.telegram.org/bot" + String(process.env.NEXT_PUBLIC_TELEGRAM_TOKEN) + "/sendMessage";
                    if (!isBuyer) return [3 /*break*/, 6];
                    message_1 = {
                        feed: "https://mecenate.vercel.app/viewFeed?addr=" + addr,
                        username: userName,
                        message: secretMessage
                    };
                    formattedText = "<b>\uD83D\uDD0F Private Message</b>\n\n<b>\u27A1\uFE0F feed: </b> <a href=\"" + message_1.feed + "\">" + message_1.feed + "</a>\n<b>\uD83D\uDCE8 message: </b> " + message_1.message;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1["default"].post(url, {
                            chat_id: sellerID,
                            text: formattedText,
                            parse_mode: "HTML"
                        })];
                case 3:
                    response = _a.sent();
                    console.log("Message sent:", response.data);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error sending message:", error_1);
                    return [3 /*break*/, 5];
                case 5:
                    scaffold_eth_1.notification.success("Message sent successfully");
                    return [3 /*break*/, 11];
                case 6:
                    message_2 = {
                        feed: "https://mecenate.vercel.app/viewFeed?addr=" + addr,
                        message: secretMessage
                    };
                    formattedText = "<b>\uD83D\uDD0F Private Message</b><b>\uD83D\uDD21</b> <a href=\"" + message_2.feed + "\">" + message_2.feed + "</a>\n<b>\uD83D\uDCE8</b> " + message_2.message;
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, axios_1["default"].post(url, {
                            chat_id: buyerID,
                            text: formattedText,
                            parse_mode: "HTML"
                        })];
                case 8:
                    response = _a.sent();
                    console.log("Message sent:", response.data);
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error("Error sending message:", error_2);
                    return [3 /*break*/, 10];
                case 10:
                    scaffold_eth_1.notification.success("Message sent successfully");
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    }); };
    var sendSecretMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var encryptedMessage, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encryptedMessage = encryptMessage(utils_1.keccak256(sismoData.auths[0].userId), secretMessage);
                    return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.write(utils_1.keccak256(sismoData.auths[0].userId), utils_1.toUtf8Bytes(encryptedMessage)))];
                case 1:
                    tx = _a.sent();
                    return [4 /*yield*/, (tx === null || tx === void 0 ? void 0 : tx.wait())];
                case 2:
                    _a.sent();
                    scaffold_eth_1.notification.success("Message sent successfully");
                    return [2 /*return*/];
            }
        });
    }); };
    var getSecretMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _secretMessage, encryptedVaultId, decryptedMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(feedData.postdata.settings.status != 0 &&
                        feedData.postdata.settings.status != 1 &&
                        feedData.postdata.settings.status != 2)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getMessage(sismoResponse, withdrawalAddress, nonce))];
                case 1:
                    _secretMessage = _a.sent();
                    console.log("Secret Message: ", _secretMessage);
                    return [4 /*yield*/, getHashedVaultId(sismoResponse, withdrawalAddress, nonce)];
                case 2:
                    encryptedVaultId = _a.sent();
                    console.log("Encrypted Vault Id: ", encryptedVaultId);
                    decryptedMessage = decryptMessage(encryptedVaultId, utils_1.toUtf8String(_secretMessage));
                    console.log("Decrypted Message: ", decryptedMessage);
                    return [2 /*return*/, decryptedMessage];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    //******************** Feed Operation *********************//
    function storePrivateKey(privateKey, contractAddress, sismoData) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var encryptedKey, response, data, errorData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, 8, 9]);
                        return [4 /*yield*/, encryptMessage(String((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId), String(privateKey))];
                    case 1:
                        encryptedKey = _b.sent();
                        console.log("Encrypted Key: ", encryptedKey);
                        console.log("Contract Address: ", contractAddress);
                        return [4 /*yield*/, fetch("/api/storeKey", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    encryptedPrivateKey: encryptedKey,
                                    contractAddress: contractAddress
                                })
                            })];
                    case 2:
                        response = _b.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _b.sent();
                        console.log("Success:", data);
                        return [2 /*return*/, data];
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        errorData = _b.sent();
                        console.error("Error:", errorData);
                        throw new Error("Failed to store the private key");
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        error_3 = _b.sent();
                        console.error("There was a problem with the fetch operation:", error_3);
                        throw error_3;
                    case 8:
                        console.log("Store private key operation completed.");
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    var createPost = function createPost() {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dataSaved, response, proofOfHashEncode, _buyer, iface, data, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, fetchData()];
                    case 1:
                        _g.sent();
                        return [4 /*yield*/, savePost(postRawData)];
                    case 2:
                        dataSaved = _g.sent();
                        return [4 /*yield*/, storePrivateKey(dataSaved === null || dataSaved === void 0 ? void 0 : dataSaved.symmetricKey, feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, sismoData)];
                    case 3:
                        response = _g.sent();
                        if (response.message == "Key stored successfully") {
                            scaffold_eth_1.notification.success("Symmetric key saved successfully");
                        }
                        else {
                            scaffold_eth_1.notification.error("Symmetric key failed to save");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: dataSaved === null || dataSaved === void 0 ? void 0 : dataSaved.proofhash,
                                inputType: "b58",
                                outputType: "digest"
                            })];
                    case 4:
                        proofOfHashEncode = _g.sent();
                        console.log("ProofHash", proofOfHashEncode);
                        console.log("Start Tx...");
                        console.log("Signer Address: ", signer === null || signer === void 0 ? void 0 : signer.getAddress());
                        if (buyer == "") {
                            _buyer = ethers_1.ethers.constants.AddressZero;
                        }
                        else {
                            _buyer = buyer;
                        }
                        iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                        _c = (_b = iface).encodeFunctionData;
                        _d = ["createPost"];
                        _e = [proofOfHashEncode,
                            Number(postType),
                            Number(postDuration)];
                        _f = utils_1.parseEther;
                        return [4 /*yield*/, buyerPayment];
                    case 5:
                        data = _c.apply(_b, _d.concat([_e.concat([
                                _f.apply(void 0, [_g.sent()]),
                                utils_1.parseEther(postStake),
                                tokenId,
                                sismoResponse,
                                localStorage.getItem("withdrawalAddress"),
                                localStorage.getItem("nonce")
                            ])]));
                        txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, utils_1.parseEther(postStake), utils_1.keccak256((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId)));
                        return [2 /*return*/];
                }
            });
        });
    };
    function acceptPost() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var iface, data;
            return __generator(this, function (_c) {
                iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                data = iface.encodeFunctionData("acceptPost", [
                    sismoResponse,
                    withdrawalAddress,
                    nonce,
                    (_b = (_a = feedData === null || feedData === void 0 ? void 0 : feedData.postdata) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.tokenId,
                    utils_1.parseEther(postPayment)
                ]);
                txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, utils_1.parseEther(postPayment), utils_1.keccak256(sismoData.auths[0].userId)));
                return [2 /*return*/];
            });
        });
    }
    function createPostData(RawData) {
        return __awaiter(this, void 0, void 0, function () {
            var symmetricKey_1, encryptedFile, symmetricKeyHash, dataHash, encryptedDataHash, jsonblob_v1_2_0, proofHash58, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Creating Data...");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        symmetricKey_1 = ErasureHelper.crypto.symmetric.generateKey();
                        encryptedFile = ErasureHelper.crypto.symmetric.encryptMessage(symmetricKey_1, RawData);
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: symmetricKey_1,
                                inputType: "raw",
                                outputType: "hex"
                            })];
                    case 2:
                        symmetricKeyHash = _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: RawData,
                                inputType: "raw",
                                outputType: "hex"
                            })];
                    case 3:
                        dataHash = _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify({ encryptedData: encryptedFile }),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 4:
                        encryptedDataHash = _a.sent();
                        jsonblob_v1_2_0 = {
                            datahash: dataHash,
                            encryptedDatahash: encryptedDataHash,
                            keyhash: symmetricKeyHash
                        };
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify(jsonblob_v1_2_0),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 5:
                        proofHash58 = _a.sent();
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
                    case 6:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    function fetchPrivateKey(contractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, errorData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!contractAddress) {
                            console.error("Contract address is undefined");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        return [4 /*yield*/, fetch("/api/storeKey?contractAddress=" + contractAddress, {
                                method: "GET"
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, data.encryptedPrivateKey];
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        errorData = _a.sent();
                        throw new Error("Failed to fetch the private key: " + (errorData.message || ""));
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        error_4 = _a.sent();
                        console.error("There was a problem with the fetch operation:", error_4);
                        throw error_4;
                    case 8:
                        console.log("Fetch private key operation completed.");
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    function submitData() {
        return __awaiter(this, void 0, void 0, function () {
            var abiCoder, proofhash, encryptedSymKeyStored, symKey, json_selldata_v120, _a, pinata, pinataAuth, pin, proofHash58, proofHash58Digest, responseIPFS, iface, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        abiCoder = new ethers_1.ethers.utils.AbiCoder();
                        proofhash = abiCoder.decode(["bytes32"], feedData[1][2].encryptedData);
                        return [4 /*yield*/, fetchPrivateKey(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address)];
                    case 1:
                        encryptedSymKeyStored = _b.sent();
                        if (encryptedSymKeyStored == undefined) {
                            scaffold_eth_1.notification.error("Symmetric key not found");
                            return [2 /*return*/];
                        }
                        console.log("Encrypted Symmetric Key Stored: ", encryptedSymKeyStored);
                        return [4 /*yield*/, decryptMessage(String(sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0].userId), String(encryptedSymKeyStored))];
                    case 2:
                        symKey = _b.sent();
                        _a = {
                            esp_version: "v1.2.0",
                            proofhash: proofhash,
                            sender: signer === null || signer === void 0 ? void 0 : signer.getAddress()
                        };
                        return [4 /*yield*/, symKey];
                    case 3:
                        json_selldata_v120 = (_a.encryptedSymKey = _b.sent(),
                            _a);
                        return [4 /*yield*/, new sdk_1["default"](pinataApiKey, pinataApiSecret)];
                    case 4:
                        pinata = _b.sent();
                        return [4 /*yield*/, pinata.testAuthentication()];
                    case 5:
                        pinataAuth = _b.sent();
                        if (pinataAuth.authenticated !== true) {
                            console.log("Pinata Authentication Failed.");
                            return [2 /*return*/];
                        }
                        console.log("Saving proof JSON...");
                        scaffold_eth_1.notification.success("Saving proof JSON...");
                        return [4 /*yield*/, pinata.pinJSONToIPFS(json_selldata_v120)];
                    case 6:
                        pin = _b.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: JSON.stringify(json_selldata_v120),
                                inputType: "raw",
                                outputType: "b58"
                            })];
                    case 7:
                        proofHash58 = _b.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: proofHash58,
                                inputType: "b58",
                                outputType: "digest"
                            })];
                    case 8:
                        proofHash58Digest = _b.sent();
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
                    case 9:
                        responseIPFS = _b.sent();
                        // check response is ipfs valid content
                        if (responseIPFS.data.esp_version !== "v1.2.0") {
                            console.log("Error with proof Hash.");
                            console.log(responseIPFS.data.esp_version);
                            console.log("v1.2.0");
                            return [2 /*return*/];
                        }
                        console.log("Data Retrieved.");
                        console.log("Proof Hash Digest: ", proofHash58Digest);
                        iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                        data = iface.encodeFunctionData("submitHash", [proofHash58Digest, sismoResponse, withdrawalAddress, nonce]);
                        txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, utils_1.keccak256(sismoData.auths[0].userId)));
                        return [2 /*return*/, {
                                proofJson: json_selldata_v120,
                                proofHash58: proofHash58,
                                proofHash58Decode: proofHash58Digest
                            }];
                }
            });
        });
    }
    function retrievePost() {
        return __awaiter(this, void 0, void 0, function () {
            var id, decodeHash, responseDecodeHash, responseDecodeHahJSON, encryptedSymKey, _decodeHash, url, responseProofHash, responseProofHashJSON, response_Encrypteddatahash, response_Encrypteddatahash_JSON, decryptFile, dataHash, hashCheck, mimeType, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Retrieving Data...");
                        id = scaffold_eth_1.notification.loading("Retrieving Data...");
                        return [4 /*yield*/, fetchData()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: feedData[1][2].encryptedKey,
                                inputType: "sha2-256",
                                outputType: "b58"
                            })];
                    case 2:
                        decodeHash = _a.sent();
                        console.log("Decoded Hash: ", decodeHash);
                        return [4 /*yield*/, axios_1["default"].get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + decodeHash, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 3:
                        responseDecodeHash = _a.sent();
                        return [4 /*yield*/, JSON.parse(JSON.stringify(responseDecodeHash.data))];
                    case 4:
                        responseDecodeHahJSON = _a.sent();
                        console.log("Response Decode Hash: ", responseDecodeHahJSON);
                        return [4 /*yield*/, JSON.parse(JSON.stringify(responseDecodeHahJSON.encryptedSymKey))];
                    case 5:
                        encryptedSymKey = _a.sent();
                        console.log("Encrypted Symmetric Key: ", encryptedSymKey);
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: responseDecodeHahJSON.proofhash.toString(),
                                inputType: "sha2-256",
                                outputType: "b58"
                            })];
                    case 6:
                        _decodeHash = _a.sent();
                        url = "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + _decodeHash;
                        console.log(url);
                        return [4 /*yield*/, axios_1["default"].get(url, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 7:
                        responseProofHash = _a.sent();
                        console.log(responseProofHash);
                        responseProofHashJSON = JSON.parse(JSON.stringify(responseProofHash.data));
                        console.log(responseProofHashJSON);
                        return [4 /*yield*/, axios_1["default"].get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + responseProofHashJSON.encryptedDatahash, {
                                headers: {
                                    Accept: "text/plain"
                                }
                            })];
                    case 8:
                        response_Encrypteddatahash = _a.sent();
                        response_Encrypteddatahash_JSON = JSON.parse(JSON.stringify(response_Encrypteddatahash.data));
                        decryptFile = ErasureHelper.crypto.symmetric.decryptMessage(encryptedSymKey, response_Encrypteddatahash_JSON.encryptedData);
                        if (!decryptFile) return [3 /*break*/, 11];
                        // wait 10 seconds
                        console.log("Decrypted Data: ", decryptFile);
                        return [4 /*yield*/, ErasureHelper.multihash({
                                input: decryptFile,
                                inputType: "raw",
                                outputType: "hex"
                            })];
                    case 9:
                        dataHash = _a.sent();
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
                            scaffold_eth_1.notification.remove(id);
                            scaffold_eth_1.notification.success(decryptFile);
                        }
                        return [4 /*yield*/, fetchData()];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, {
                                rawData: encryptedSymKey,
                                hashCheck: hashCheck
                            }];
                    case 11:
                        console.log("Error decrypting message.");
                        return [2 /*return*/, null];
                }
            });
        });
    }
    function revealPost() {
        return __awaiter(this, void 0, void 0, function () {
            var symKeyHash, rawDataHash, pinata, pinataAuth, pin, AbiCoder, dataEncoded, iface, data;
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
                        iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                        data = iface.encodeFunctionData("revealData", [dataEncoded, utils_1.keccak256(sismoData.auths[0].userId)]);
                        txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, sismoResponse));
                        return [4 /*yield*/, fetchData()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function finalizePost() {
        return __awaiter(this, void 0, void 0, function () {
            var iface, data, iface, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Finalizing Data...");
                        if (valid == true) {
                            iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                            data = iface.encodeFunctionData("finalizePost", [
                                valid,
                                utils_1.parseEther("0"),
                                utils_1.keccak256(sismoData.auths[0].userId),
                            ]);
                            txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, utils_1.keccak256(sismoData.auths[0].userId)));
                        }
                        else {
                            iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                            data = iface.encodeFunctionData("finalizePost", [
                                valid,
                                utils_1.parseEther(punishment),
                                utils_1.keccak256(sismoData.auths[0].userId),
                            ]);
                            txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, utils_1.keccak256(sismoData.auths[0].userId)));
                        }
                        return [4 /*yield*/, fetchData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function renounce() {
        return __awaiter(this, void 0, void 0, function () {
            var iface, data;
            return __generator(this, function (_a) {
                iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                data = iface.encodeFunctionData("renouncePost", [sismoResponse, withdrawalAddress, nonce]);
                txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, utils_1.keccak256(sismoData.auths[0].userId)));
                scaffold_eth_1.notification.success("Refund successful");
                return [2 /*return*/];
            });
        });
    }
    //******************** Staking *********************//
    function addStake() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Adding Stake...");
                        txData(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.addStake(sismoResponse, { value: utils_1.parseEther(stakeAmount) }));
                        return [4 /*yield*/, fetchData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function takeAll() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var iface, data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("Take All Stake...");
                        iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                        data = iface.encodeFunctionData("takeFullStake", [
                            (_b = (_a = feedData === null || feedData === void 0 ? void 0 : feedData.postdata) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.tokenId,
                            sismoResponse,
                            withdrawalAddress,
                            nonce,
                        ]);
                        txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, utils_1.keccak256(sismoData.auths[0].userId)));
                        return [4 /*yield*/, fetchData()];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function takeStake() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var iface, data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("Take Stake...");
                        iface = new ethers_1.ethers.utils.Interface(deployedContractFeed === null || deployedContractFeed === void 0 ? void 0 : deployedContractFeed.abi);
                        data = iface.encodeFunctionData("takeStake", [
                            (_b = (_a = feedData === null || feedData === void 0 ? void 0 : feedData.postdata) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.tokenId,
                            utils_1.parseEther(stakeAmount),
                            sismoResponse,
                            withdrawalAddress,
                            nonce,
                        ]);
                        txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.address, data, 0, utils_1.keccak256(sismoData.auths[0].userId)));
                        return [4 /*yield*/, fetchData()];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    //******************** Helpers *********************//
    var fetchData = function fetchData() {
        return __awaiter(this, void 0, void 0, function () {
            var data, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(feedCtx && signer && provider)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.post())];
                    case 1:
                        data = _b.sent();
                        setFeedData(data);
                        _a = setPostCount;
                        return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.postCount())];
                    case 2:
                        _a.apply(void 0, [_b.sent()]);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
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
    var getHashedVaultId = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _hashedVaultId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getHashedVaultId(utils_1.keccak256(sismoData.auths[0].userId)))];
                case 1:
                    _hashedVaultId = _a.sent();
                    setHashedVaultId(_hashedVaultId);
                    return [2 /*return*/, _hashedVaultId];
            }
        });
    }); };
    function encryptMessage(secretKey, message) {
        var algorithm = "aes-256-cbc"; // Algoritmo di cifratura
        var key = crypto_1["default"].createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta
        var iv = crypto_1["default"].randomBytes(16); // Vettore di inizializzazione casuale
        var cipher = crypto_1["default"].createCipheriv(algorithm, key, iv);
        var encrypted = cipher.update(message, "utf8", "hex");
        encrypted += cipher.final("hex");
        // Concatenare il vettore di inizializzazione e il messaggio cifrato
        return iv.toString("hex") + encrypted;
    }
    function decryptMessage(secretKey, encryptedMessage) {
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
    function getStatusText(status) {
        switch (status) {
            case 6:
                return "Revealed";
            case 5:
                return "Punished";
            case 4:
                return "Finalized";
            case 3:
                return "Submitted";
            case 2:
                return "Accepted";
            case 1:
                return "Proposed";
            default:
                return "Waiting for Creator";
        }
    }
    function decodeData() {
        return __awaiter(this, void 0, void 0, function () {
            var decryptedData, encryptedData, encryptedKey, encryptedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(feedData[1][2].decryptedData != "0x30783030")) return [3 /*break*/, 3];
                        decryptedData = AbiCoder.decode(["string", "string"], feedData[1][2].decryptedData);
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
    var handleImageDrop = function (acceptedFiles) {
        setImageFile(acceptedFiles[0]);
        uploadJsonToIpfs(acceptedFiles[0]);
    };
    //******************** IPFS *********************//
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
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, uploadImageToIpfs(imageFile)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    scaffold_eth_1.notification.error('Error uploading file: "${error}');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
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
    //******************** useEffects *********************//
    react_1.useEffect(function () {
        setUserName(localStorage.getItem("userName") || "");
    }, []);
    react_1.useEffect(function () {
        var fetchDataAsync = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _message, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log("Fetching Data...");
                        return [4 /*yield*/, fetchData()];
                    case 1:
                        _a.sent();
                        setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
                        setVerified(localStorage.getItem("verified"));
                        setSismoResponse(localStorage.getItem("sismoResponse"));
                        setNonce(String(localStorage.getItem("nonce")));
                        setWithdrawalAddress(String(localStorage.getItem("withdrawalAddress")));
                        if (!sismoData) return [3 /*break*/, 3];
                        return [4 /*yield*/, getSecretMessage()];
                    case 2:
                        _message = _a.sent();
                        console.log("Message: ", _message);
                        setMessage(_message);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        console.error("Error fetching data:", error_6);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var interval = setInterval(function () {
            if (signer && provider && feedCtx && router.isReady) {
                fetchDataAsync();
            }
        }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));
        // Cleanup function
        return function () { return clearInterval(interval); };
    });
    react_1.useEffect(function () {
        fetchData();
    }, []);
    react_1.useEffect(function () {
        var run = function () { return __awaiter(void 0, void 0, void 0, function () {
            var yourStake;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (feedCtx === null || feedCtx === void 0 ? void 0 : feedCtx.getStake((_b = (_a = feedData === null || feedData === void 0 ? void 0 : feedData.postdata) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.tokenId, utils_1.keccak256(sismoData.auths[0].userId)))];
                    case 1:
                        yourStake = _c.sent();
                        setYourStake(yourStake);
                        return [2 /*return*/];
                }
            });
        }); };
        if (sismoData) {
            run();
        }
    }, [feedCtx]);
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
            console.log("Token ID: ", tokenId);
            return [2 /*return*/];
        });
    }); };
    return (react_1["default"].createElement("div", { className: "flex flex-col items-center pt-2 p-2 w-10/12 mx-auto " }, feedData[0] != null ? (react_1["default"].createElement("div", { className: "flex flex-col text-left bg-primary rounded-lg" },
        react_1["default"].createElement("div", { className: "flex flex-col mb-5  min-w-fit items-left justify-center w-full" },
            react_1["default"].createElement("div", { className: "flex flex-row gap-5 mx-10 my-5" },
                react_1["default"].createElement("div", { className: "dropdown dropdown-bottom" },
                    react_1["default"].createElement("label", { tabIndex: 0, className: "hover:bg-secondary-focus btn btn-ghost bg-inherit" },
                        react_1["default"].createElement(solid_1.DocumentCheckIcon, { className: "h-8 w-8 mx-2" }),
                        " Seller"),
                    react_1["default"].createElement("ul", { tabIndex: 0, className: "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52" },
                        react_1["default"].createElement("li", null,
                            " ",
                            react_1["default"].createElement("label", { htmlFor: "modal-create", className: "feedData.postData font-semibold" }, "Create")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("label", { htmlFor: "modal-submit", className: "feedData.postData font-semibold " }, "Submit")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("label", { htmlFor: "modal-reveal", className: "feedData.postData font-semibold " }, "Reveal")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("label", { className: "feedData.postData font-semibold ", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, renounce()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); } }, "Renounce")))),
                react_1["default"].createElement("div", { className: "dropdown dropdown-bottom" },
                    react_1["default"].createElement("label", { tabIndex: 0, className: "hover:bg-secondary-focus btn btn-ghost bg-inherit" },
                        react_1["default"].createElement(solid_1.MegaphoneIcon, { className: "h-8 w-8 mx-2" }),
                        " Buyer"),
                    react_1["default"].createElement("ul", { tabIndex: 0, className: "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52" },
                        react_1["default"].createElement("li", null,
                            " ",
                            react_1["default"].createElement("label", { htmlFor: "modal-accept", className: " font-semibold" }, "Accept")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("label", { htmlFor: "modal-retrieve", className: "font-semibold" }, "Retrieve")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("label", { htmlFor: "modal-finalize", className: "font-semibold" }, "Finalize")))),
                react_1["default"].createElement("div", { className: "dropdown dropdown-bottom" },
                    react_1["default"].createElement("label", { tabIndex: 0, className: "hover:bg-secondary-focus btn btn-ghost bg-inherit" },
                        react_1["default"].createElement(solid_1.ScaleIcon, { className: "h-8 w-8 mx-2" }),
                        " Stake"),
                    react_1["default"].createElement("ul", { tabIndex: 0, className: "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52" },
                        react_1["default"].createElement("li", null,
                            " ",
                            react_1["default"].createElement("label", { htmlFor: "modal-stake", className: "feedData.postData font-semibold" }, "Stake")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("label", { className: "feedData.postData font-semibold", onClick: function () {
                                    decodeData();
                                } }, "Decode")))))),
        react_1["default"].createElement("div", { className: "flex flex-wrap text-xl mb-5 mx-10 font-bold hover:text-success animate-pulse" }, feedData.postdata.settings.status === 6
            ? "Waiting for Seller"
            : feedData.postdata.settings.status === 5
                ? "Waiting for Seller"
                : feedData.postdata.settings.status === 4
                    ? "Waiting for Seller"
                    : feedData.postdata.settings.status === 3
                        ? "Waiting for buyer validate the data"
                        : feedData.postdata.settings.status === 2
                            ? "Waiting for submission from seller"
                            : feedData.postdata.settings.status === 1
                                ? "Waiting for Acceptance from a buyer"
                                : "Waiting for Seller"),
        react_1["default"].createElement("div", { className: "mx-10  font-base text-lg" },
            "Smart Contract address is ",
            react_1["default"].createElement("strong", null, addr),
            " "),
        react_1["default"].createElement("div", { className: "mx-10  mb-5 font-base text-lg" },
            "Your current deposit is ",
            react_1["default"].createElement("strong", null,
                utils_1.formatEther(yourStake),
                " ETH")),
        react_1["default"].createElement("div", { className: "flex flex-col  mb-16  min-w-fit items-left justify-center w-full" },
            react_1["default"].createElement("ul", { className: "steps" }, allStatuses.map(function (statusText, index) {
                var _a, _b;
                var currentStatus = (_b = (_a = feedData === null || feedData === void 0 ? void 0 : feedData.postdata) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.status;
                var currentStatusText = getStatusText(currentStatus);
                return (react_1["default"].createElement("li", { className: "step " + (statusText === currentStatusText ? "step-info" : ""), key: index }, statusText));
            }))),
        react_1["default"].createElement("div", { className: "flex flex-col mt-5 mb-16 min-w-fit items-left justify-center w-full border-2 p-10 border-primary-focus rounded-xl" },
            react_1["default"].createElement("div", { className: "text-2xl font-bold mx-10" }, "Messenger"),
            react_1["default"].createElement("div", { className: "text-base font-light mx-10" }, "Comunicate with buyer/seller or mecenate community"),
            "s",
            react_1["default"].createElement("a", { href: "https://t.me/mecenate_message_bot", className: "link-hover mx-10" }, "Telegram Bot"),
            react_1["default"].createElement("a", { href: "https://t.me/mecenate_message_bot", className: "link-hover mx-10" }, "Telegram Channel"),
            react_1["default"].createElement("div", { className: "mx-10  font-base text-lg" },
                react_1["default"].createElement("input", { type: "text", className: "input w-full mt-8", placeholder: "Message to send", onChange: function (e) { return setSecretMessage(e.target.value); } }),
                " ",
                react_1["default"].createElement("button", { className: "btn btn-primary mt-8", onClick: function () {
                        sendSecretMessage();
                    } },
                    react_1["default"].createElement(solid_1.PaperAirplaneIcon, { className: "h-8 w-8 mx-2" }),
                    " Send On-Chain"),
                sismoData && sismoData.auths[2] && sismoData.auths[2].userId ? (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("button", { className: "btn btn-primary mt-8 ", onClick: function () {
                            sendTelegramMessage();
                        }, disabled: !sismoData.auths[2].userId },
                        react_1["default"].createElement(solid_1.PaperAirplaneIcon, { className: "h-8 w-8 mx-2" }),
                        " Send Private on Telegram"))) : (react_1["default"].createElement("div", null)),
                react_1["default"].createElement("div", { className: "flex flex-row my-10" },
                    react_1["default"].createElement(solid_1.InboxArrowDownIcon, { className: "h-8 w-8 mx-5 " }),
                    react_1["default"].createElement("div", { className: "flex flex-col" },
                        react_1["default"].createElement("span", { className: "text-xs mb-2" }, "Last On-Chain Message Received"),
                        message && message != "" ? (react_1["default"].createElement("div", { className: "font-base text-lg" }, message)) : (react_1["default"].createElement("div", { className: "font-base text-lg" }, "No Message")))))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("input", { type: "checkbox", id: "modal-create", className: "modal-toggle " }),
            react_1["default"].createElement("div", { className: "modal" },
                react_1["default"].createElement("div", { className: "modal-box rounded-lg shadow-xl" },
                    react_1["default"].createElement("div", { className: "modal-header" },
                        react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Create Post"),
                        react_1["default"].createElement("label", { htmlFor: "modal-create", className: "btn btn-ghost" },
                            react_1["default"].createElement("i", { className: "fas fa-times" }))),
                    react_1["default"].createElement("div", { className: "modal-body w-auto space-y-6 text-left" },
                        react_1["default"].createElement("label", { className: "block text-base-500" }, "Duration"),
                        react_1["default"].createElement("select", { key: 5, className: "form-select w-full mb-8", value: postDuration, onChange: function (e) { return setPostDuration(e.target.value); } },
                            react_1["default"].createElement("option", null, "Select Duration"),
                            react_1["default"].createElement("option", { value: "0" }, "1 Days"),
                            react_1["default"].createElement("option", { value: "1" }, "3 Days"),
                            react_1["default"].createElement("option", { value: "2" }, "1 Week"),
                            react_1["default"].createElement("option", { value: "3" }, "2 Weeks"),
                            react_1["default"].createElement("option", { value: "4" }, "1 Month")),
                        react_1["default"].createElement("label", { className: "block text-base-500 mt-8" }, "Stake"),
                        react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Amount", value: postStake, onChange: function (e) { return setPostStake(e.target.value); } }),
                        react_1["default"].createElement("label", { className: "text-black font-semibold text-sm", htmlFor: "request" }, "Currency"),
                        react_1["default"].createElement("select", { className: "select select-text bg-transparent my-4", name: "tokens", id: "tokens", onChange: function (e) { return handleSelectToken(e.target.value); } },
                            react_1["default"].createElement("option", { value: "Nan" }, "Select Token"),
                            react_1["default"].createElement("option", { value: "ETH" }, "ETH"),
                            react_1["default"].createElement("option", { value: "DAI" }, "DAI"),
                            react_1["default"].createElement("option", { value: "MUSE" }, "MUSE")),
                        react_1["default"].createElement("label", { className: "block text-base-500 mt-8" }, "Buyer Payment "),
                        react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Put 0 to allow buyer decide the payment", value: buyerPayment, onChange: function (e) { return setBuyerPayment(e.target.value); } }),
                        react_1["default"].createElement("label", { className: "block text-base-500" }, "Type"),
                        react_1["default"].createElement("select", { className: "form-select w-full", value: postType, onChange: function (e) { return setPostType(e.target.value); } },
                            react_1["default"].createElement("option", null, "Select Type"),
                            react_1["default"].createElement("option", { value: "0" }, "Text"),
                            react_1["default"].createElement("option", { value: "1" }, "Image"),
                            react_1["default"].createElement("option", { value: "2" }, "Video"),
                            react_1["default"].createElement("option", { value: "3" }, "Audio"),
                            react_1["default"].createElement("option", { value: "4" }, "File")),
                        postType == 0 ? (react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-base-500" }, "Message"),
                            react_1["default"].createElement("input", { type: "text", className: "input w-full my-4", placeholder: "Data", value: postRawData, onChange: function (e) { return setPostRawData(e.target.value); } }))) : postType == 1 || 2 || 3 || 4 ? (react_1["default"].createElement("div", null,
                            react_1["default"].createElement(react_dropzone_1["default"], { onDrop: handleImageDrop }, function (_a) {
                                var getRootProps = _a.getRootProps, getInputProps = _a.getInputProps;
                                return (react_1["default"].createElement("div", __assign({}, getRootProps(), { className: "flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer" }),
                                    react_1["default"].createElement("input", __assign({}, getInputProps())),
                                    imageFile ? (react_1["default"].createElement("p", null, imageFile === null || imageFile === void 0 ? void 0 : imageFile.name)) : (react_1["default"].createElement("p", null, "Drag 'n' drop an image here, or click to select a file"))));
                            }))) : null,
                        react_1["default"].createElement("button", { className: "btn btn-primary w-full mt-4", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    createPost();
                                    return [2 /*return*/];
                                });
                            }); } }, "Create Post")),
                    react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                        react_1["default"].createElement("label", { htmlFor: "modal-create", className: "btn" }, "Close")))),
            react_1["default"].createElement("input", { type: "checkbox", id: "modal-submit", className: "modal-toggle " }),
            react_1["default"].createElement("div", { className: "modal" },
                react_1["default"].createElement("div", { className: "modal-box" },
                    react_1["default"].createElement("div", { className: "modal-header" },
                        react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Submit encrypted key"),
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
                        react_1["default"].createElement("select", { key: 5, className: "form-select w-full", value: postType, onChange: function (e) { return setPostType(e.target.value); } },
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
            react_1["default"].createElement("input", { type: "checkbox", id: "modal-retrieve", className: "modal-toggle" }),
            react_1["default"].createElement("div", { className: "modal" },
                react_1["default"].createElement("div", { className: "modal-box" },
                    react_1["default"].createElement("div", { className: "modal-header" },
                        react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Retrieve Post"),
                        react_1["default"].createElement("label", { htmlFor: "modal-retrieve", className: "btn btn-ghost" },
                            react_1["default"].createElement("i", { className: "fas fa-times" }))),
                    react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
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
            react_1["default"].createElement("input", { type: "checkbox", id: "modal-finalize", className: "modal-toggle" }),
            react_1["default"].createElement("div", { className: "modal" },
                react_1["default"].createElement("div", { className: "modal-box" },
                    react_1["default"].createElement("div", { className: "modal-header" },
                        react_1["default"].createElement("div", { className: "modal-title text-2xl font-bold" }, "Finalize Post")),
                    react_1["default"].createElement("div", { className: "modal-body space-y-4 text-left" },
                        react_1["default"].createElement("br", null),
                        "ETH to destroy from seller stake if your data is not valid",
                        react_1["default"].createElement("input", { type: "text", className: "input w-full", placeholder: "Punishment", disabled: valid, value: punishment, onChange: function (e) { return setPunishment(e.target.value); } }),
                        react_1["default"].createElement("span", { className: "divider my-5" }),
                        "Validate and send your payment to seller",
                        react_1["default"].createElement("br", null),
                        react_1["default"].createElement("input", { type: "checkbox", className: "form-checkbox", checked: valid, onChange: function (e) {
                                setValid(e.target.checked);
                            } }),
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
                        react_1["default"].createElement("label", { htmlFor: "modal-finalize", className: "btn" }, "Close")))),
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
                        react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    addStake();
                                    return [2 /*return*/];
                                });
                            }); } }, "Add Stake"),
                        react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    takeStake();
                                    return [2 /*return*/];
                                });
                            }); } }, "Take Stake"),
                        react_1["default"].createElement("button", { className: "btn  w-full", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    takeAll();
                                    return [2 /*return*/];
                                });
                            }); } }, "Take All")),
                    react_1["default"].createElement("div", { className: "modal-action space-x-2 mt-4" },
                        react_1["default"].createElement("label", { htmlFor: "modal-stake", className: "btn" }, "Close"))))),
        react_1["default"].createElement("div", { className: "flex flex-col mb-16  min-w-fit items-left justify-center w-full border-2 p-10 rounded-xl border-primary-focus" },
            react_1["default"].createElement("div", { className: "card w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Feed Info"),
                    react_1["default"].createElement("div", { className: "mt-2" },
                        react_1["default"].createElement("p", { className: "text-base" },
                            react_1["default"].createElement("span", { className: "font-bold" }, "Post Status"),
                            " ",
                            react_1["default"].createElement("br", null),
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
                        react_1["default"].createElement("div", { className: "w-fit" },
                            react_1["default"].createElement("p", { className: "text-base" },
                                react_1["default"].createElement("span", { className: "font-bold" }, "Stake"),
                                " ",
                                react_1["default"].createElement("br", null),
                                " ",
                                utils_1.formatEther(feedData[1][1].stake.toString()),
                                " ETH")),
                        react_1["default"].createElement("div", { className: "w-fit" },
                            react_1["default"].createElement("p", { className: "text-base" },
                                react_1["default"].createElement("span", { className: "font-bold" }, "Reward"),
                                " ",
                                react_1["default"].createElement("br", null),
                                utils_1.formatEther(feedData[1][1].payment.toString()),
                                " ETH"))))),
            react_1["default"].createElement("div", { className: "divider" }),
            react_1["default"].createElement("div", { className: "card w-full md:w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Post Settings"),
                    react_1["default"].createElement("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Creation"),
                            " ",
                            react_1["default"].createElement("br", null),
                            new Date(Number(feedData[1][0].creationTimeStamp) * 1000).toUTCString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Expire"),
                            react_1["default"].createElement("br", null),
                            new Date(Number(feedData[1][0].endTimeStamp) * 1000).toString()),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Duration"),
                            " ",
                            react_1["default"].createElement("br", null),
                            Number(feedData[1][0].duration.toString() * 1000) / 86400000,
                            " days",
                            " "),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "File Type"),
                            " ",
                            react_1["default"].createElement("br", null),
                            feedData[1][0].postType.toString() == 0
                                ? "Text"
                                : feedData[1][0].postType.toString() == 1
                                    ? "Image"
                                    : feedData[1][0].postType.toString() == 2
                                        ? "Video"
                                        : feedData[1][0].postType.toString() == 3
                                            ? "Audio"
                                            : feedData[1][0].postType.toString() == 4
                                                ? "File"
                                                : null),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Status"),
                            react_1["default"].createElement("br", null),
                            feedData[1][0].status.toString() == 0
                                ? "Waiting"
                                : feedData[1][0].status.toString() == 1
                                    ? "Proposed"
                                    : feedData[1][0].status.toString() == 2
                                        ? "Accepted"
                                        : feedData[1][0].status.toString() == 3
                                            ? "Submitted"
                                            : feedData[1][0].status.toString() == 4
                                                ? "Finalized"
                                                : feedData[1][0].status.toString() == 5
                                                    ? "Punished"
                                                    : feedData[1][0].status.toString() == 6
                                                        ? "Revealed"
                                                        : null)))),
            react_1["default"].createElement("div", { className: "divider" }),
            react_1["default"].createElement("div", { className: "card w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Punishment"),
                    react_1["default"].createElement("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Buyer Penalty"),
                            " ",
                            react_1["default"].createElement("br", null),
                            " ",
                            utils_1.formatEther(feedData[1][1].penalty.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Seller Punishment"),
                            " ",
                            react_1["default"].createElement("br", null),
                            " ",
                            utils_1.formatEther(feedData[1][1].punishment.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Seller Stake"),
                            " ",
                            react_1["default"].createElement("br", null),
                            " ",
                            utils_1.formatEther(feedData[1][1].stake.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Buyer Payment"),
                            " ",
                            react_1["default"].createElement("br", null),
                            " ",
                            utils_1.formatEther(feedData[1][1].payment.toString()))))),
            react_1["default"].createElement("div", { className: "divider" }),
            react_1["default"].createElement("div", { className: "card w-fit" },
                react_1["default"].createElement("div", { className: "card-body" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Data"),
                    react_1["default"].createElement("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Encrypted Data"),
                            " ",
                            react_1["default"].createElement("br", null),
                            " ",
                            react_1["default"].createElement("span", { className: "break-all" }, feedData[1][2].encryptedData.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Encrypted Key"),
                            " ",
                            react_1["default"].createElement("br", null),
                            " ",
                            react_1["default"].createElement("span", { className: "break-all" },
                                " ",
                                feedData[1][2].encryptedKey.toString())),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Decrypted Data IPFS Hash"),
                            " ",
                            react_1["default"].createElement("br", null),
                            react_1["default"].createElement("span", { className: "break-all" },
                                " ",
                                feedData[1][2].decryptedData.toString())))))))) : (react_1["default"].createElement(Spinner_1["default"], null))));
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
