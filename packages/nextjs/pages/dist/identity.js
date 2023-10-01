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
var utils_js_1 = require("ethers/lib/utils.js");
var sismo_connect_react_1 = require("@sismo-core/sismo-connect-react");
var sismo_config_1 = require("./../sismo.config");
var scaffold_eth_1 = require("~~/hooks/scaffold-eth");
var Spinner_1 = require("~~/components/Spinner");
var scaffold_eth_2 = require("~~/components/scaffold-eth");
var Identity = function () {
    var chain = wagmi_1.useNetwork().chain;
    var signer = wagmi_1.useSigner().data;
    var provider = wagmi_1.useProvider();
    var _a = react_1["default"].useState(), sismoConnectVerifiedResult = _a[0], setSismoConnectVerifiedResult = _a[1];
    var _b = react_1["default"].useState(), sismoConnectResponse = _b[0], setSismoConnectResponse = _b[1];
    var _c = react_1["default"].useState(""), pageState = _c[0], setPageState = _c[1];
    var _d = react_1["default"].useState(), error = _d[0], setError = _d[1];
    var _e = react_1["default"].useState(0), fee = _e[0], setFee = _e[1];
    var _f = react_1["default"].useState(), responseBytes = _f[0], setResponseBytes = _f[1];
    var deployedContractIdentity = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateIdentity");
    var deployedContractUser = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateUsers");
    var deployedContractTreasury = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateTreasury");
    var deployedContractVault = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateVault");
    var txData = scaffold_eth_1.useTransactor(signer);
    var _g = react_1["default"].useState(false), userExists = _g[0], setUserExists = _g[1];
    var _h = react_1["default"].useState(null), sismoData = _h[0], setSismoData = _h[1];
    var _j = react_1["default"].useState(null), verified = _j[0], setVerified = _j[1];
    var _k = react_1["default"].useState(null), sismoResponse = _k[0], setSismoResponse = _k[1];
    var _l = react_1["default"].useState(null), userName = _l[0], setUserName = _l[1];
    var _m = react_1["default"].useState(""), withdrawalAddress = _m[0], setWithdrawalAddress = _m[1];
    var _o = react_1["default"].useState(null), nonce = _o[0], setNonce = _o[1];
    var _p = react_1["default"].useState(""), forwarderAddress = _p[0], setForwarderAddress = _p[1];
    var deployedContractDepositorFactory = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateForwarderFactory");
    var customWallet = new ethers_1.ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);
    var UsersAddress;
    var UsersAbi = [];
    var identityAddress;
    var identityAbi = [];
    var treasuryAddress;
    var treasuryAbi = [];
    var depositorAddress;
    var depositorAbi = [];
    var vaultAddress;
    var vaultAbi = [];
    if (deployedContractIdentity) {
        (identityAddress = deployedContractIdentity.address, identityAbi = deployedContractIdentity.abi);
    }
    if (deployedContractUser) {
        (UsersAddress = deployedContractUser.address, UsersAbi = deployedContractUser.abi);
    }
    if (deployedContractTreasury) {
        (treasuryAddress = deployedContractTreasury.address, treasuryAbi = deployedContractTreasury.abi);
    }
    if (deployedContractVault) {
        (vaultAddress = deployedContractVault.address, vaultAbi = deployedContractVault.abi);
    }
    if (deployedContractDepositorFactory) {
        (depositorAddress = deployedContractDepositorFactory.address, depositorAbi = deployedContractDepositorFactory.abi);
    }
    var vaultCtx = wagmi_1.useContract({
        address: vaultAddress,
        abi: vaultAbi,
        signerOrProvider: customWallet || provider
    });
    var usersCtx = wagmi_1.useContract({
        address: UsersAddress,
        abi: UsersAbi,
        signerOrProvider: customWallet || provider
    });
    var treasury = wagmi_1.useContract({
        address: treasuryAddress,
        abi: treasuryAbi,
        signerOrProvider: customWallet || provider
    });
    var depositorFactory = wagmi_1.useContract({
        address: deployedContractDepositorFactory === null || deployedContractDepositorFactory === void 0 ? void 0 : deployedContractDepositorFactory.address,
        abi: depositorAbi,
        signerOrProvider: customWallet || provider
    });
    var generateNonce = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonce;
        return __generator(this, function (_a) {
            if (localStorage.getItem("nonce"))
                setNonce(localStorage.getItem("nonce"));
            if (localStorage.getItem("withdrawalAddress"))
                setWithdrawalAddress(localStorage.getItem("withdrawalAddress"));
            if (localStorage.getItem("nonce") && localStorage.getItem("withdrawalAddress"))
                return [2 /*return*/];
            nonce = utils_js_1.keccak256(ethers_1.ethers.utils.randomBytes(32));
            setNonce(nonce);
            localStorage.setItem("nonce", nonce);
            return [2 /*return*/];
        });
    }); }, [nonce, withdrawalAddress]);
    var signIn = function () { return __awaiter(void 0, void 0, void 0, function () {
        var iface, data;
        var _a;
        return __generator(this, function (_b) {
            iface = new ethers_1.ethers.utils.Interface(deployedContractUser === null || deployedContractUser === void 0 ? void 0 : deployedContractUser.abi);
            data = iface.encodeFunctionData("registerUser", [
                sismoResponse,
                String(localStorage.getItem("withdrawalAddress")),
                String(localStorage.getItem("nonce")),
                userName,
            ]);
            txData(vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.execute(usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.address, data, 0, utils_js_1.keccak256(String((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId))));
            return [2 /*return*/];
        });
    }); };
    var getContractData = function getContractData() {
        return __awaiter(this, void 0, void 0, function () {
            var fee_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!signer) return [3 /*break*/, 2];
                        return [4 /*yield*/, (treasury === null || treasury === void 0 ? void 0 : treasury.fixedFee())];
                    case 1:
                        fee_1 = _a.sent();
                        setFee(fee_1);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    var checkIfUserExists = function checkIfUserExists() {
        return __awaiter(this, void 0, void 0, function () {
            var localSismoData, localSismoDataConverted, _userExists, _userName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localSismoData = localStorage.getItem("sismoData");
                        if (!localSismoData)
                            return [2 /*return*/];
                        localSismoDataConverted = JSON.parse(String(localSismoData));
                        return [4 /*yield*/, (usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.checkifUserExist(utils_js_1.keccak256(String(localSismoDataConverted === null || localSismoDataConverted === void 0 ? void 0 : localSismoDataConverted.auths[0].userId))))];
                    case 1:
                        _userExists = _a.sent();
                        return [4 /*yield*/, (usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.getUserName(utils_js_1.keccak256(String(localSismoDataConverted === null || localSismoDataConverted === void 0 ? void 0 : localSismoDataConverted.auths[0].userId))))];
                    case 2:
                        _userName = _a.sent();
                        setUserExists(_userExists);
                        setUserName(_userName);
                        return [2 /*return*/];
                }
            });
        });
    };
    var resetLocalStorage = function resetLocalStorage() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                localStorage.removeItem("verified");
                localStorage.removeItem("sismoData");
                localStorage.removeItem("sismoResponse");
                return [2 /*return*/];
            });
        });
    };
    // Funzione per inizializzare lo stato
    var initializeState = function () { return __awaiter(void 0, void 0, void 0, function () {
        var sismoDataFromLocalStorage, verifiedFromLocalStorage, sismoResponseFromLocalStorage, nonceFromLocalStorage, withdrawalAddressFromLocalStorage, nonce_1, pageStateToSet, _username;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getContractData()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, checkIfUserExists()];
                case 2:
                    _a.sent();
                    sismoDataFromLocalStorage = localStorage.getItem("sismoData");
                    verifiedFromLocalStorage = localStorage.getItem("verified");
                    sismoResponseFromLocalStorage = localStorage.getItem("sismoResponse");
                    nonceFromLocalStorage = localStorage.getItem("nonce");
                    withdrawalAddressFromLocalStorage = localStorage.getItem("withdrawalAddress");
                    if (sismoDataFromLocalStorage) {
                        setSismoData(JSON.parse(sismoDataFromLocalStorage));
                    }
                    if (verifiedFromLocalStorage) {
                        setVerified(verifiedFromLocalStorage);
                    }
                    if (sismoResponseFromLocalStorage) {
                        setSismoResponse(sismoResponseFromLocalStorage);
                    }
                    if (nonceFromLocalStorage) {
                        setNonce(nonceFromLocalStorage);
                    }
                    else {
                        nonce_1 = utils_js_1.keccak256(ethers_1.ethers.utils.randomBytes(32));
                        setNonce(nonce_1);
                        localStorage.setItem("nonce", nonce_1);
                    }
                    if (withdrawalAddressFromLocalStorage) {
                        setWithdrawalAddress(withdrawalAddressFromLocalStorage);
                    }
                    else {
                        setWithdrawalAddress("");
                    }
                    pageStateToSet = verifiedFromLocalStorage === "verified" ? "verified" : "init";
                    setPageState(pageStateToSet);
                    if (!sismoData)
                        return [2 /*return*/];
                    if (!userName) return [3 /*break*/, 3];
                    localStorage.setItem("userName", userName);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (usersCtx === null || usersCtx === void 0 ? void 0 : usersCtx.getUserName(utils_js_1.keccak256(String(sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0].userId))))];
                case 4:
                    _username = _a.sent();
                    localStorage.setItem("userName", _username);
                    setUserName(_username);
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /* *************************  Account Abstraction *********************/
    var createForwarder = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            if (sismoData) {
                txData(depositorFactory === null || depositorFactory === void 0 ? void 0 : depositorFactory.createforwarder(utils_js_1.keccak256((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId), vaultCtx === null || vaultCtx === void 0 ? void 0 : vaultCtx.address));
            }
            return [2 /*return*/];
        });
    }); };
    var getForwarder = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(depositorFactory && sismoData)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (depositorFactory === null || depositorFactory === void 0 ? void 0 : depositorFactory.getforwarders(utils_js_1.keccak256((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId)))];
                case 1:
                    result = _b.sent();
                    setForwarderAddress(result);
                    localStorage.setItem("forwarderAddress", result);
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    /* *************************  Reset state *****************************/
    function resetApp() {
        window.location.href = "/";
    }
    react_1.useEffect(function () {
        initializeState();
        setPageState("verified");
    }, []);
    react_1.useEffect(function () {
        var run = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                initializeState();
                generateNonce();
                getForwarder();
                return [2 /*return*/];
            });
        }); };
        // pooling run
        var interval = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, run()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));
        return function () { return clearInterval(interval); };
    });
    var signMessage = function () {
        if (!withdrawalAddress || !nonce)
            return;
        var result = ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [String(withdrawalAddress), String(nonce)]);
        return result;
    };
    return (react_1["default"].createElement("div", { className: "flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 " },
        react_1["default"].createElement("div", { className: "max-w-3xl text-center my-2 text-base-content" },
            react_1["default"].createElement("div", { className: "flex flex-col min-w-fit mx-auto items-center mb-20" },
                react_1["default"].createElement("div", { className: "max-w-3xl text-center" },
                    react_1["default"].createElement("h1", { className: "text-6xl font-bold mb-8" }, "IDENTITY"),
                    react_1["default"].createElement("p", { className: "text-xl  mb-20" }, "Register your identity with zk-proof")),
                react_1["default"].createElement("div", { className: "p-4 " },
                    !(signer === null || signer === void 0 ? void 0 : signer.provider) && react_1["default"].createElement("div", { className: "text-center font-bold text-xl my-5" }, "Please connect your wallet"),
                    pageState == "init" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { className: "mt-10" },
                            react_1["default"].createElement("input", { className: "input input-bordered my-5 w-full", type: "text", placeholder: "Set Withdrawal Address", onChange: function (e) {
                                    setWithdrawalAddress(e.target.value);
                                    localStorage.setItem("withdrawalAddress", e.target.value);
                                } })),
                        react_1["default"].createElement("div", { className: "text-center" },
                            react_1["default"].createElement(sismo_connect_react_1.SismoConnectButton, { config: sismo_config_1.CONFIG, auths: sismo_config_1.AUTHS, signature: {
                                    message: String(signMessage())
                                }, disabled: withdrawalAddress !== "" ? false : true, text: "Join With Sismo", onResponse: function (response) { return __awaiter(void 0, void 0, void 0, function () {
                                    var verifiedResult, data, _a, _b, _c, _d, _e, error_1;
                                    return __generator(this, function (_f) {
                                        switch (_f.label) {
                                            case 0:
                                                setSismoConnectResponse(response);
                                                setPageState("verifying");
                                                getForwarder();
                                                _f.label = 1;
                                            case 1:
                                                _f.trys.push([1, 7, , 8]);
                                                return [4 /*yield*/, fetch("/api/verify", {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: JSON.stringify(__assign(__assign({}, response), { address: localStorage.getItem("withdrawalAddress"), nonce: localStorage.getItem("nonce") }))
                                                    })];
                                            case 2:
                                                verifiedResult = _f.sent();
                                                return [4 /*yield*/, verifiedResult.json()];
                                            case 3:
                                                data = _f.sent();
                                                if (!verifiedResult.ok) return [3 /*break*/, 5];
                                                setSismoConnectVerifiedResult(data);
                                                localStorage.setItem("verified", "verified");
                                                _b = (_a = localStorage).setItem;
                                                _c = ["sismoData"];
                                                _e = (_d = JSON).stringify;
                                                return [4 /*yield*/, data];
                                            case 4:
                                                _b.apply(_a, _c.concat([_e.apply(_d, [_f.sent()])]));
                                                setPageState("verified");
                                                getForwarder();
                                                return [3 /*break*/, 6];
                                            case 5:
                                                setPageState("error");
                                                setError(data.error.toString()); // or JSON.stringify(data.error)
                                                _f.label = 6;
                                            case 6: return [3 /*break*/, 8];
                                            case 7:
                                                error_1 = _f.sent();
                                                console.error("Error:", error_1);
                                                setPageState("error");
                                                setError(error_1);
                                                return [3 /*break*/, 8];
                                            case 8: return [2 /*return*/];
                                        }
                                    });
                                }); }, onResponseBytes: function (responseBytes) {
                                    setResponseBytes(responseBytes);
                                    localStorage.setItem("sismoResponse", responseBytes);
                                } })))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { className: "text-center" },
                            react_1["default"].createElement("br", null),
                            pageState == "verifying" ? (react_1["default"].createElement("div", { className: "text-center items-center flex flex-row gap-3" },
                                react_1["default"].createElement(Spinner_1["default"], null),
                                " ",
                                react_1["default"].createElement("div", { className: "text-blue-500 text-center font-semibold" }, "Verifying ZK Proofs..."))) : (react_1["default"].createElement(react_1["default"].Fragment, null, Boolean(error) ? (react_1["default"].createElement("span", { className: "text-red-500 font-bold" },
                                "Error verifying ZK Proofs: ",
                                error)) : (react_1["default"].createElement("div", { className: "flex flex-col" },
                                react_1["default"].createElement("div", { className: "status-wrapper" },
                                    react_1["default"].createElement("button", { className: "btn btn-primary my-10 text-base-content border-2 border-secondary-focus rounded-xl  hover:bg-red-700  font-bold py-2 px-4 hover:text-white focus:outline-none focus:shadow-outline", onClick: function () {
                                            window.location.href = "/identity";
                                            resetLocalStorage();
                                            resetApp();
                                        } },
                                        " ",
                                        "RESET",
                                        " ")),
                                react_1["default"].createElement("div", { className: "text-green-500 font-bold my-5 " }, "ZK Proofs verified!"),
                                react_1["default"].createElement("div", { className: "font-semibold text-xl" }, "\u26A0\uFE0F Deposit into vault before sign-in"),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xl  mb-2" }, "Create forwarder address used to deposit into vault"),
                                    react_1["default"].createElement("button", { className: "btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700 my-5", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, createForwarder()];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }, disabled: Boolean(forwarderAddress != ethers_1.ethers.constants.AddressZero) }, "Create"),
                                    forwarderAddress == ethers_1.ethers.constants.AddressZero && forwarderAddress ? (react_1["default"].createElement("p", { className: "text-xl mb-10" }, "Create forwarder first")) : (react_1["default"].createElement("div", null,
                                        " ",
                                        react_1["default"].createElement("p", { className: "text-xl mb-10" }, "Send ETH to deposit at:"),
                                        react_1["default"].createElement(scaffold_eth_2.Address, { address: forwarderAddress, format: "long" })))),
                                react_1["default"].createElement("div", { className: "mt-10" },
                                    react_1["default"].createElement("input", { className: "input input-bordered my-5 w-full", type: "text", placeholder: "Set UserName", onInput: function (e) { return setUserName(e.target.value); } }),
                                    react_1["default"].createElement("button", { className: "btn btn-primary w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline", onClick: signIn, disabled: userExists && withdrawalAddress != "" && userName != "" },
                                        "Sign In",
                                        " "))))))))))))));
};
exports["default"] = Identity;
