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
var scaffold_eth_1 = require("~~/utils/scaffold-eth");
var ipfs_http_client_1 = require("ipfs-http-client");
var buffer_1 = require("buffer");
var sismo_connect_react_1 = require("@sismo-core/sismo-connect-react");
var sismo_config_1 = require("./../sismo.config");
var store_1 = require("~~/services/store/store");
var crypto = require("asymmetric-crypto");
var projectId = process.env.INFURA_PROJECT_ID;
var projectSecret = process.env.INFURA_PROJECT_SECRET;
// const projectGateway = process.env.IPFS_GATEWAY;
var auth = "Basic " + buffer_1.Buffer.from(projectId + ":" + projectSecret).toString("base64");
var DEBUG = true;
function readibleHex(userId, startLength, endLength, separator) {
    if (startLength === void 0) { startLength = 6; }
    if (endLength === void 0) { endLength = 4; }
    if (separator === void 0) { separator = "..."; }
    if (!(userId === null || userId === void 0 ? void 0 : userId.startsWith("0x"))) {
        return userId; // Return the original string if it doesn't start with "0x"
    }
    return userId.substring(0, startLength) + separator + userId.substring(userId.length - endLength);
}
function getProofDataForAuth(sismoConnectResponse, authType) {
    for (var _i = 0, _a = sismoConnectResponse.proofs; _i < _a.length; _i++) {
        var proof = _a[_i];
        if (proof.auths) {
            for (var _b = 0, _c = proof.auths; _b < _c.length; _b++) {
                var auth_1 = _c[_b];
                if (auth_1.authType === authType) {
                    return proof.proofData;
                }
            }
        }
    }
    return null; // returns null if no matching authType is found
}
function getProofDataForClaim(sismoConnectResponse, claimType, groupId, value) {
    for (var _i = 0, _a = sismoConnectResponse.proofs; _i < _a.length; _i++) {
        var proof = _a[_i];
        if (proof.claims) {
            for (var _b = 0, _c = proof.claims; _b < _c.length; _b++) {
                var claim = _c[_b];
                if (claim.claimType === claimType && claim.groupId === groupId && claim.value === value) {
                    return proof.proofData;
                }
            }
        }
    }
    return null; // returns null if no matching claimType, groupId and value are found
}
var Identity = function () {
    var chain = wagmi_1.useNetwork().chain;
    var signer = wagmi_1.useSigner().data;
    var provider = wagmi_1.useProvider();
    var _a = react_1["default"].useState(), sismoConnectVerifiedResult = _a[0], setSismoConnectVerifiedResult = _a[1];
    var _b = react_1["default"].useState(), sismoConnectResponse = _b[0], setSismoConnectResponse = _b[1];
    var _c = react_1["default"].useState("init"), pageState = _c[0], setPageState = _c[1];
    var _d = react_1["default"].useState(), error = _d[0], setError = _d[1];
    var _e = react_1["default"].useState(0), fee = _e[0], setFee = _e[1];
    var _f = react_1["default"].useState(0), identityFee = _f[0], setIdentityFee = _f[1];
    var _g = react_1["default"].useState(""), name = _g[0], setName = _g[1];
    var _h = react_1["default"].useState(""), description = _h[0], setDescription = _h[1];
    var _j = react_1["default"].useState(), imageFile = _j[0], setImageFile = _j[1];
    var _k = react_1["default"].useState(""), image = _k[0], setImage = _k[1];
    var _l = react_1["default"].useState(0), nftBalance = _l[0], setNftBalance = _l[1];
    var _m = react_1["default"].useState({}), nftMetadata = _m[0], setNftMetadata = _m[1];
    var _o = react_1["default"].useState(""), pubKey = _o[0], setPubKey = _o[1];
    var _p = react_1["default"].useState(false), alreadyUser = _p[0], setAlreadyUser = _p[1];
    var _q = react_1["default"].useState(), responseBytes = _q[0], setResponseBytes = _q[1];
    var deployedContractIdentity = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateIdentity");
    var deployedContractUser = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateUsers");
    var deployedContractTreasury = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateTreasury");
    var _r = react_1["default"].useState(), signature = _r[0], setSignature = _r[1];
    var store = store_1.useAppStore();
    /* Create an instance of the client */
    var client = ipfs_http_client_1.create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
            authorization: auth
        }
    });
    var UsersAddress;
    var UsersAbi = [];
    var identityAddress;
    var identityAbi = [];
    var treasuryAddress;
    var treasuryAbi = [];
    if (deployedContractIdentity) {
        (identityAddress = deployedContractIdentity.address, identityAbi = deployedContractIdentity.abi);
    }
    if (deployedContractUser) {
        (UsersAddress = deployedContractUser.address, UsersAbi = deployedContractUser.abi);
    }
    if (deployedContractTreasury) {
        (treasuryAddress = deployedContractTreasury.address, treasuryAbi = deployedContractTreasury.abi);
    }
    var usersCtx = wagmi_1.useContract({
        address: UsersAddress,
        abi: UsersAbi,
        signerOrProvider: signer || provider
    });
    var identity = wagmi_1.useContract({
        address: identityAddress,
        abi: identityAbi,
        signerOrProvider: signer || provider
    });
    var checkIfUserIsRegistered = function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (signer === null || signer === void 0 ? void 0 : signer.getAddress())];
                case 1:
                    address = _a.sent();
                    return [4 /*yield*/, (usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.checkifUserExist(address))];
                case 2:
                    user = _a.sent();
                    if (user) {
                        setAlreadyUser(true);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var treasury = wagmi_1.useContract({
        address: treasuryAddress,
        abi: treasuryAbi,
        signerOrProvider: signer || provider
    });
    var uploadImageToIpfs = function (file) { return __awaiter(void 0, void 0, void 0, function () {
        var added, cid, url_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!file) {
                        throw new Error("No file specified");
                    }
                    return [4 /*yield*/, client.add({ content: file })];
                case 1:
                    added = _a.sent();
                    cid = added.cid.toString();
                    DEBUG && console.log("added", added);
                    DEBUG && console.log("cid", cid);
                    DEBUG && console.log("path", added.path);
                    url_1 = "https://scobru.infura-ipfs.io/ipfs/" + added.cid;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onloadend = function () {
                                resolve(url_1);
                            };
                            reader.onerror = function (event) {
                                reject(event);
                            };
                            console.log(url_1);
                            scaffold_eth_1.notification.info(String(url_1));
                            scaffold_eth_1.notification.success("Image uploaded to IPFS");
                            setImage(url_1);
                        })];
                case 2:
                    error_1 = _a.sent();
                    scaffold_eth_1.notification.error("Error uploading image to IPFS");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var fetchNFTBalance = function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, balance, id, metadata, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (signer === null || signer === void 0 ? void 0 : signer.getAddress())];
                case 1:
                    address = _a.sent();
                    return [4 /*yield*/, (identity === null || identity === void 0 ? void 0 : identity.balanceOf(address))];
                case 2:
                    balance = _a.sent();
                    return [4 /*yield*/, (identity === null || identity === void 0 ? void 0 : identity.identityByAddress(address))];
                case 3:
                    id = _a.sent();
                    return [4 /*yield*/, (identity === null || identity === void 0 ? void 0 : identity.tokenURI(Number(id)))];
                case 4:
                    metadata = _a.sent();
                    return [4 /*yield*/, fetch(metadata)];
                case 5:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: " + response.status);
                    }
                    return [4 /*yield*/, response.json()];
                case 6:
                    data = _a.sent();
                    DEBUG && console.log("id", Number(id));
                    DEBUG && console.log("balance", balance);
                    DEBUG && console.log("metadata", metadata);
                    DEBUG && console.log("data", data);
                    setNftMetadata(data);
                    setNftBalance(balance);
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var uploadJsonToIpfs = function (identityData, imageFile) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, uploadImageToIpfs(imageFile)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    scaffold_eth_1.notification.error("Error uploading image to IPFS");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var createIdentity = function (identityData) { return __awaiter(void 0, void 0, void 0, function () {
        var creator, nftMetadataWrite, payload, errors, urlRegex, response, error_4, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (signer === null || signer === void 0 ? void 0 : signer.getAddress())];
                case 1:
                    creator = _a.sent();
                    nftMetadataWrite = {
                        name: identityData.name,
                        image: image,
                        description: identityData.description,
                        owner: creator
                    };
                    DEBUG && console.log(nftMetadataWrite);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    payload = {
                        values: nftMetadataWrite,
                        chainId: chain === null || chain === void 0 ? void 0 : chain.id.toString()
                    };
                    errors = {
                        name: "",
                        description: "",
                        image: ""
                    };
                    urlRegex = /^(http|https):\/\/[^ "]+$/;
                    if (!nftMetadataWrite.name)
                        errors.name = "Name is required";
                    if (!nftMetadataWrite.description)
                        errors.description = "Message is required";
                    if (nftMetadataWrite.image && !urlRegex.test(nftMetadataWrite.image))
                        errors.image = "URL is invalid";
                    if (errors.name || errors.description || errors.image) {
                        return [2 /*return*/, scaffold_eth_1.notification.error("Error creating identity")];
                    }
                    return [4 /*yield*/, fetch("/api/create_id", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Allow-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify(payload)
                        })];
                case 3:
                    response = _a.sent();
                    if (response.status === 200) {
                        scaffold_eth_1.notification.success(react_1["default"].createElement("span", { className: "font-bold" }, "Submission received! \uD83C\uDF89"));
                    }
                    else {
                        scaffold_eth_1.notification.error(react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement("span", { className: "font-bold" }, "Server Error."),
                            react_1["default"].createElement("br", null),
                            "Something went wrong. Please try again"));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error(error_4);
                    scaffold_eth_1.notification.error(react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("span", { className: "font-bold" }, "Server Error."),
                        react_1["default"].createElement("br", null),
                        "Something went wrong. Please try again"));
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, (identity === null || identity === void 0 ? void 0 : identity.mint(nftMetadataWrite, {
                        value: identityFee
                    }))];
                case 6:
                    tx = _a.sent();
                    if (tx === null || tx === void 0 ? void 0 : tx.hash) {
                        scaffold_eth_1.notification.success("Identity minted successfully!");
                    }
                    fetchNFTBalance();
                    return [2 /*return*/];
            }
        });
    }); };
    function createPair() {
        return __awaiter(this, void 0, void 0, function () {
            var kp, keypairJSON, data, _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("Generating Key Pair...");
                        kp = crypto.keyPair();
                        keypairJSON = JSON.stringify({
                            publicKey: kp.publicKey,
                            secretKey: kp.secretKey
                        });
                        console.log(keypairJSON);
                        setPubKey(kp.publicKey.toString());
                        scaffold_eth_1.notification.success("Key pair created");
                        scaffold_eth_1.notification.warning(react_1["default"].createElement("div", { id: "alert-additional-content-3", className: "p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800", role: "alert" },
                            react_1["default"].createElement("div", { className: "flex items-center" },
                                react_1["default"].createElement("svg", { "aria-hidden": "true", className: "w-5 h-5 mr-2", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
                                    react_1["default"].createElement("path", { "fill-rule": "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", "clip-rule": "evenodd" })),
                                react_1["default"].createElement("span", { className: "sr-only" }, "Info"),
                                react_1["default"].createElement("h3", { className: "text-lg font-medium" }, "Save Your Key Pair!")),
                            react_1["default"].createElement("div", { className: "mt-2 mb-4 text-sm" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", null,
                                        "PUBLIC KEY : ",
                                        react_1["default"].createElement("br", null),
                                        " ",
                                        kp.publicKey.toString()),
                                    react_1["default"].createElement("p", null,
                                        "SECRET KEY : ",
                                        react_1["default"].createElement("br", null),
                                        " ",
                                        kp.secretKey.toString()))),
                            react_1["default"].createElement("div", { className: "flex" },
                                react_1["default"].createElement("button", { type: "button", className: "text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800", onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                        var data, _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    _a = {};
                                                    return [4 /*yield*/, kp.publicKey.toString()];
                                                case 1:
                                                    _a.publicKey = _b.sent();
                                                    return [4 /*yield*/, kp.secretKey.toString()];
                                                case 2:
                                                    data = (_a.secretKey = _b.sent(),
                                                        _a);
                                                    navigator.clipboard.writeText(JSON.stringify(data));
                                                    scaffold_eth_1.notification.success("Public key copied to clipboard");
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); } },
                                    react_1["default"].createElement("svg", { "aria-hidden": "true", className: "-ml-0.5 mr-2 h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
                                        react_1["default"].createElement("path", { d: "M10 12a2 2 0 100-4 2 2 0 000 4z" }),
                                        react_1["default"].createElement("path", { "fill-rule": "evenodd", d: "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", "clip-rule": "evenodd" })),
                                    "Copy to clipboard"))));
                        _a = {};
                        return [4 /*yield*/, kp.publicKey.toString()];
                    case 1:
                        _a.publicKey = _d.sent();
                        return [4 /*yield*/, kp.secretKey.toString()];
                    case 2:
                        data = (_a.secretKey = _d.sent(),
                            _a);
                        _b = downloadFile;
                        _c = {
                            data: JSON.stringify(data)
                        };
                        return [4 /*yield*/, (signer === null || signer === void 0 ? void 0 : signer.getAddress())];
                    case 3:
                        _b.apply(void 0, [(_c.fileName = (_d.sent()) + "_keyPair.json",
                                _c.fileType = "text/json",
                                _c)]);
                        return [2 /*return*/];
                }
            });
        });
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
    function signIn() {
        return __awaiter(this, void 0, void 0, function () {
            var seller, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, createPair()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (signer === null || signer === void 0 ? void 0 : signer.getAddress())];
                    case 2:
                        seller = _a.sent();
                        if (!seller) return [3 /*break*/, 4];
                        return [4 /*yield*/, (usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.registerUser(responseBytes))];
                    case 3:
                        tx = _a.sent();
                        scaffold_eth_1.notification.success("User registered");
                        scaffold_eth_1.notification.info("Transaction hash: " + tx.hash);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    var handleNameChange = function (event) {
        setName(event.target.value);
    };
    var handleDescriptionChange = function (event) {
        setDescription(event.target.value);
    };
    var handleImageDrop = function (acceptedFiles) {
        if (acceptedFiles != null && acceptedFiles.length > 0) {
            setImageFile(function () { return acceptedFiles[0]; });
            if (acceptedFiles[0]) {
                uploadJsonToIpfs({ name: name, description: description }, acceptedFiles[0]);
            }
        }
    };
    var handleFormSubmit = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var identityData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    identityData = { name: name, description: description };
                    return [4 /*yield*/, createIdentity(identityData)];
                case 1:
                    _a.sent();
                    alert("Identity minted successfully!");
                    return [2 /*return*/];
            }
        });
    }); };
    var getContractData = function getContractData() {
        return __awaiter(this, void 0, void 0, function () {
            var fee_1, _identityFee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(identity && signer)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (treasury === null || treasury === void 0 ? void 0 : treasury.fixedFee())];
                    case 1:
                        fee_1 = _a.sent();
                        return [4 /*yield*/, (treasury === null || treasury === void 0 ? void 0 : treasury.fixedFee())];
                    case 2:
                        _identityFee = _a.sent();
                        console.log(_identityFee);
                        return [4 /*yield*/, fetchNFTBalance()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, checkIfUserIsRegistered()];
                    case 4:
                        _a.sent();
                        setFee(fee_1);
                        setIdentityFee(_identityFee);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    react_1.useEffect(function () {
        getContractData();
    }, [signer]);
    var signMessage = function () {
        return ethers_1.ethers.utils.defaultAbiCoder.encode(["string"], ["I love Sismo!"]);
    };
    return (react_1["default"].createElement("div", { className: "flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 " },
        react_1["default"].createElement("div", { className: "max-w-3xl text-center my-2 text-base-content" },
            react_1["default"].createElement("div", { className: "flex flex-col min-w-fit mx-auto items-center mb-20" },
                react_1["default"].createElement("div", { className: "max-w-3xl text-center" },
                    react_1["default"].createElement("h1", { className: "text-6xl font-bold mb-8" }, "Identity"),
                    react_1["default"].createElement("p", { className: "text-xl  mb-20" }, "Mint your NFT. Become a member of the community.")),
                react_1["default"].createElement("div", { className: "p-4 bg-white dark:bg-gray-800" },
                    pageState == "init" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { className: "text-center" },
                            react_1["default"].createElement(sismo_connect_react_1.SismoConnectButton, { config: sismo_config_1.CONFIG, 
                                // Auths = Data Source Ownership Requests. (e.g Wallets, Github, Twitter, Github)
                                auths: sismo_config_1.AUTHS, 
                                // Claims = prove group membership of a Data Source in a specific Data Group.
                                // (e.g ENS DAO Voter, Minter of specific NFT, etc.)
                                // Data Groups = [{[dataSource1]: value1}, {[dataSource1]: value1}, .. {[dataSource]: value}]
                                // Existing Data Groups and how to create one: https://factory.sismo.io/groups-explorer
                                // claims={CLAIMS}
                                // Signature = user can sign a message embedded in their zk proof
                                // encode the signature with abi.encode
                                signature: sismo_config_1.SIGNATURE_REQUEST, text: "Join With Sismo", 
                                // Triggered when received Sismo Connect response from user data vault
                                onResponse: function (response) { return __awaiter(void 0, void 0, void 0, function () {
                                    var _a, verifiedResult, data;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                _a = setSismoConnectResponse;
                                                return [4 /*yield*/, response];
                                            case 1:
                                                _a.apply(void 0, [_b.sent()]);
                                                setPageState("verifying");
                                                return [4 /*yield*/, fetch("/api/verify", {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: JSON.stringify(response)
                                                    })];
                                            case 2:
                                                verifiedResult = _b.sent();
                                                return [4 /*yield*/, verifiedResult.json()];
                                            case 3:
                                                data = _b.sent();
                                                if (verifiedResult.ok) {
                                                    setSismoConnectVerifiedResult(data);
                                                    store.setSismoData(data);
                                                    setPageState("verified");
                                                }
                                                else {
                                                    setPageState("error");
                                                    setError(data);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, onResponseBytes: function (responseBytes) {
                                    setResponseBytes(responseBytes);
                                    store.setSismoResponse(responseBytes);
                                } })))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { className: "text-center" },
                            react_1["default"].createElement("button", { onClick: function () {
                                    window.location.href = "/";
                                } },
                                " ",
                                "RESET",
                                " ")),
                        react_1["default"].createElement("br", null),
                        react_1["default"].createElement("div", { className: "status-wrapper" }, pageState == "verifying" ? (react_1["default"].createElement("span", { className: "text-blue-500" }, "Verifying ZK Proofs...")) : (react_1["default"].createElement(react_1["default"].Fragment, null, Boolean(error) ? (react_1["default"].createElement("span", { className: "text-red-500" },
                            "Error verifying ZK Proofs: ",
                            error.message)) : (react_1["default"].createElement("span", { className: "text-green-500" }, "ZK Proofs verified!"))))))),
                    react_1["default"].createElement("div", { className: "card bordered" },
                        react_1["default"].createElement("div", { className: "card-body" },
                            " ",
                            sismoConnectVerifiedResult && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("h3", null, "Verified Auths"),
                                react_1["default"].createElement("table", null,
                                    react_1["default"].createElement("thead", null,
                                        react_1["default"].createElement("tr", null,
                                            react_1["default"].createElement("th", null, "AuthType"),
                                            react_1["default"].createElement("th", null, "Verified UserId"))),
                                    react_1["default"].createElement("tbody", null, sismoConnectVerifiedResult.auths.map(function (auth, index) { return (react_1["default"].createElement("tr", { key: index },
                                        react_1["default"].createElement("td", null, sismo_config_1.AuthType[auth.authType]),
                                        react_1["default"].createElement("td", null, auth.userId))); }))))),
                            react_1["default"].createElement("br", null),
                            sismoConnectVerifiedResult && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("h3", null, "Verified Claims"),
                                react_1["default"].createElement("table", null,
                                    react_1["default"].createElement("thead", null,
                                        react_1["default"].createElement("tr", null,
                                            react_1["default"].createElement("th", null, "groupId"),
                                            react_1["default"].createElement("th", null, "ClaimType"),
                                            react_1["default"].createElement("th", null, "Verified Value"))))))),
                        react_1["default"].createElement("h3", null, "Auths requested"),
                        react_1["default"].createElement("table", null,
                            react_1["default"].createElement("thead", null,
                                react_1["default"].createElement("tr", null,
                                    react_1["default"].createElement("th", null, "AuthType"),
                                    react_1["default"].createElement("th", null, "Requested UserId"),
                                    react_1["default"].createElement("th", null, "Optional?"),
                                    react_1["default"].createElement("th", null, "ZK proof"))),
                            react_1["default"].createElement("tbody", null, sismo_config_1.AUTHS.map(function (auth, index) { return (react_1["default"].createElement("tr", { key: index },
                                console.log(auth),
                                react_1["default"].createElement("td", null, sismo_config_1.AuthType[auth.authType]),
                                react_1["default"].createElement("td", null, readibleHex(auth.vaultId || "No userId requested")),
                                react_1["default"].createElement("td", null, auth.isOptional ? "optional" : "required"),
                                sismoConnectResponse ? (react_1["default"].createElement("td", null, readibleHex(getProofDataForAuth(sismoConnectResponse, auth.authType)))) : (react_1["default"].createElement("td", null, " ZK proof not generated yet ")))); }))),
                        react_1["default"].createElement("br", null),
                        react_1["default"].createElement("h3", null, "Claims requested"),
                        react_1["default"].createElement("table", null,
                            react_1["default"].createElement("thead", null,
                                react_1["default"].createElement("tr", null,
                                    react_1["default"].createElement("th", null, "GroupId"),
                                    react_1["default"].createElement("th", null, "ClaimType"),
                                    react_1["default"].createElement("th", null, "Requested Value"),
                                    react_1["default"].createElement("th", null, "Can User Select Value?"),
                                    react_1["default"].createElement("th", null, "Optional?"),
                                    react_1["default"].createElement("th", null, "ZK proof")))),
                        react_1["default"].createElement("h3", null, "Signature requested and verified"),
                        react_1["default"].createElement("table", null,
                            react_1["default"].createElement("thead", null,
                                react_1["default"].createElement("tr", null,
                                    react_1["default"].createElement("th", null, "Message Requested"),
                                    react_1["default"].createElement("th", null, "Can User Modify message?"),
                                    react_1["default"].createElement("th", null, "Verified Signed Message"))),
                            react_1["default"].createElement("tbody", null,
                                react_1["default"].createElement("tr", null,
                                    react_1["default"].createElement("td", null, sismo_config_1.SIGNATURE_REQUEST.message),
                                    react_1["default"].createElement("td", null, sismo_config_1.SIGNATURE_REQUEST.isSelectableByUser ? "yes" : "no"),
                                    react_1["default"].createElement("td", null, sismoConnectVerifiedResult
                                        ? sismoConnectVerifiedResult.signedMessage
                                        : "ZK proof not verified yet")))))),
                react_1["default"].createElement("div", { className: "max-w-lg" },
                    react_1["default"].createElement("div", { className: "max-w-3xl text-center my-20  text-base-content" },
                        react_1["default"].createElement("h1", { className: "text-6xl font-bold mb-8" }, "Generate your KeyPair."),
                        react_1["default"].createElement("p", { className: "text-xl  mb-8" }, "Once you create your identity, you will be able to generate your own personal public and private key that will allow you to interact with the protocol. You can encrypt and decrypt the information you want to share with other users in a completely anonymous and decentralized manner.")),
                    react_1["default"].createElement("div", { className: "my-5 " },
                        react_1["default"].createElement("button", { className: "btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500  hover:bg-primary-700", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, signIn()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, disabled: sismoConnectResponse != null ? false : true }, "Sign In")))))));
};
exports["default"] = Identity;
