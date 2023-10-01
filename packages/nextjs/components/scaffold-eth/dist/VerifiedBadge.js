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
var utilsContract_1 = require("./Contract/utilsContract");
var ethers_1 = require("ethers");
var wagmi_1 = require("wagmi");
var utils_1 = require("ethers/lib/utils");
var Address_1 = require("./Address");
function VerifiedBadge(_a) {
    var _this = this;
    var verified = _a.verified, encryptedVaultId = _a.encryptedVaultId, address = _a.address;
    var _b = react_1.useState(0), depositedBalance = _b[0], setDepositedBalance = _b[1];
    var chain = wagmi_1.useNetwork().chain;
    var deployedContractWallet = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateVault");
    var customProvider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    var customWallet = new ethers_1.ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), customProvider);
    var walletAddress;
    var walletAbi = [];
    if (deployedContractWallet) {
        (walletAddress = deployedContractWallet.address, walletAbi = deployedContractWallet.abi);
    }
    var wallet = wagmi_1.useContract({
        address: walletAddress,
        abi: walletAbi,
        signerOrProvider: customWallet
    });
    var getDeposit = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var tx, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!encryptedVaultId) return [3 /*break*/, 2];
                    return [4 /*yield*/, (wallet === null || wallet === void 0 ? void 0 : wallet.getEthDeposit(encryptedVaultId))];
                case 1:
                    tx = _a.sent();
                    if (tx)
                        setDepositedBalance(Number(utils_1.formatEther(tx)));
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to get deposit:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [encryptedVaultId, wallet]);
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            getDeposit();
        }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));
        return function () {
            clearInterval(interval);
        };
    });
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "inline-flex items-start max-w-fit border-1 p-1 rounded-lg bg-gradient-to-t border-slate-700 shadow-md shadow-slate-600" },
            react_1["default"].createElement("span", { className: "font-semibold ml-2" },
                react_1["default"].createElement(Address_1["default"], { address: address, format: "short" }),
                " ",
                depositedBalance.toFixed(3),
                " ETH"))));
}
exports["default"] = VerifiedBadge;
