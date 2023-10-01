"use strict";

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

exports.__esModule = true;

var react_1 = require("react");

var wagmi_1 = require("wagmi");

var utilsContract_1 = require("../components/scaffold-eth/Contract/utilsContract");

var scaffold_eth_1 = require("~~/utils/scaffold-eth");

var utils_js_1 = require("ethers/lib/utils.js");

var store_1 = require("~~/services/store/store");

var scaffold_eth_2 = require("~~/hooks/scaffold-eth");

var DEBUG = true;

function readibleHex(userId, startLength, endLength, separator) {
  if (startLength === void 0) {
    startLength = 6;
  }

  if (endLength === void 0) {
    endLength = 4;
  }

  if (separator === void 0) {
    separator = "...";
  }

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
        var auth = _c[_b];

        if (auth.authType === authType) {
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

var Vault = function Vault() {
  var chain = wagmi_1.useNetwork().chain;
  var signer = wagmi_1.useSigner().data;
  var provider = wagmi_1.useProvider();

  var _a = react_1["default"].useState(),
      sismoConnectVerifiedResult = _a[0],
      setSismoConnectVerifiedResult = _a[1];

  var _b = react_1["default"].useState(),
      sismoConnectResponse = _b[0],
      setSismoConnectResponse = _b[1];

  var _c = react_1["default"].useState("init"),
      pageState = _c[0],
      setPageState = _c[1];

  var _d = react_1["default"].useState(),
      error = _d[0],
      setError = _d[1];

  var _e = react_1["default"].useState(0),
      fee = _e[0],
      setFee = _e[1];

  var _f = react_1["default"].useState(),
      responseBytes = _f[0],
      setResponseBytes = _f[1];

  var deployedContractUser = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateUsers");
  var deployedContractTreasury = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateTreasury");
  var deployedContractWallet = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateVault");
  var deployedContractDepositorFactory = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateETHDepositorFactory");
  var txData = scaffold_eth_2.useTransactor();

  var _g = react_1["default"].useState(),
      signature = _g[0],
      setSignature = _g[1];

  var _h = react_1["default"].useState(0),
      amount = _h[0],
      setAmount = _h[1];

  var _j = react_1["default"].useState(0),
      depositedBalance = _j[0],
      setDepositedBalance = _j[1];

  var _k = react_1["default"].useState(""),
      to = _k[0],
      setTo = _k[1];

  var _l = react_1["default"].useState(null),
      sismoData = _l[0],
      setSismoData = _l[1];

  var _m = react_1["default"].useState(null),
      verified = _m[0],
      setVerified = _m[1];

  var _o = react_1["default"].useState(null),
      sismoResponse = _o[0],
      setSismoResponse = _o[1];

  var store = store_1.useAppStore();

  var _p = react_1["default"].useState(""),
      tokenAddress = _p[0],
      setTokenAddress = _p[1];

  var _q = react_1["default"].useState(""),
      userCommitment = _q[0],
      setUserCommitment = _q[1];

  var _r = react_1["default"].useState(""),
      randomBytes32Hash = _r[0],
      setRandomBytes32Hash = _r[1];

  var _s = react_1["default"].useState(0),
      nonce = _s[0],
      setNonce = _s[1];

  var _t = react_1["default"].useState(""),
      withdrawalAddress = _t[0],
      setWithdrawalAddress = _t[1];

  var walletAddress;
  var walletAbi = [];

  if (deployedContractWallet) {
    walletAddress = deployedContractWallet.address, walletAbi = deployedContractWallet.abi;
  }

  var wallet = wagmi_1.useContract({
    address: walletAddress,
    abi: walletAbi,
    signerOrProvider: signer || provider
  });

  var getDeposit = function getDeposit() {
    return __awaiter(void 0, void 0, void 0, function () {
      var tx;

      var _a;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!sismoData) return [3
            /*break*/
            , 2];
            return [4
            /*yield*/
            , wallet === null || wallet === void 0 ? void 0 : wallet.getEthDeposit(utils_js_1.keccak256((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId))];

          case 1:
            tx = _b.sent();
            if (tx) setDepositedBalance(Number(utils_js_1.formatEther(tx)));
            _b.label = 2;

          case 2:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  react_1.useEffect(function () {
    if (!depositedBalance) getDeposit();
    var interval = setInterval(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4
              /*yield*/
              , getDeposit()];

            case 1:
              _a.sent();

              setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
              setNonce(localStorage.getItem("nonce"));
              setWithdrawalAddress(localStorage.getItem("withdrawalAddress"));
              setVerified(localStorage.getItem("verified"));
              setSismoResponse(localStorage.getItem("sismoResponse"));
              return [2
              /*return*/
              ];
          }
        });
      });
    }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));
    return function () {
      return clearInterval(interval);
    };
  });

  var deposit = function deposit() {
    return __awaiter(void 0, void 0, void 0, function () {
      var tx;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , wallet === null || wallet === void 0 ? void 0 : wallet.depositETH(utils_js_1.keccak256(sismoData.auths[0].userId), {
              value: utils_js_1.parseEther(String(amount))
            })];

          case 1:
            tx = _a.sent();

            if (tx === null || tx === void 0 ? void 0 : tx.hash) {
              scaffold_eth_1.notification.success("Deposit successful!");
            }

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  var withdraw = function withdraw() {
    return __awaiter(void 0, void 0, void 0, function () {
      var tx;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , wallet === null || wallet === void 0 ? void 0 : wallet.withdrawETH(utils_js_1.parseEther(String(amount)), sismoResponse, withdrawalAddress, nonce)];

          case 1:
            tx = _a.sent();

            if (tx === null || tx === void 0 ? void 0 : tx.hash) {
              scaffold_eth_1.notification.success("Withdrawal successful!");
            }

            return [2
            /*return*/
            ];
        }
      });
    });
  }; // Nuove funzioni per gestire i token ERC20


  var depositToken = function depositToken(tokenAddress) {
    return __awaiter(void 0, void 0, void 0, function () {
      var tx;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , wallet === null || wallet === void 0 ? void 0 : wallet.depositToken(tokenAddress, utils_js_1.parseEther(String(amount)), sismoResponse)];

          case 1:
            tx = _a.sent();

            if (tx === null || tx === void 0 ? void 0 : tx.hash) {
              scaffold_eth_1.notification.success("Token Deposit successful!");
            }

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  var withdrawToken = function withdrawToken(tokenAddress) {
    return __awaiter(void 0, void 0, void 0, function () {
      var tx;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , wallet === null || wallet === void 0 ? void 0 : wallet.withdrawToken(tokenAddress, to, utils_js_1.parseEther(String(amount)), sismoResponse)];

          case 1:
            tx = _a.sent();

            if (tx === null || tx === void 0 ? void 0 : tx.hash) {
              scaffold_eth_1.notification.success("Token Withdrawal successful!");
            }

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  var getDepositToken = function getDepositToken(tokenAddress) {
    return __awaiter(void 0, void 0, void 0, function () {
      var commitment, tx;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            commitment = userCommitment || utils_js_1.keccak256(sismoData.auths[0].userId);
            if (!commitment) return [3
            /*break*/
            , 2];
            return [4
            /*yield*/
            , wallet === null || wallet === void 0 ? void 0 : wallet.getTokenDeposit(tokenAddress, commitment)];

          case 1:
            tx = _a.sent();

            if (tx) {// Aggiorna il saldo del token depositato
            }

            _a.label = 2;

          case 2:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  function generateRandomBytes32() {
    var _this = this;

    var array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    var result = "0x" + Array.from(array).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
    setRandomBytes32Hash(result);
    setUserCommitment(result);
    scaffold_eth_1.notification.warning(react_1["default"].createElement("div", {
      id: "alert-additional-content-3",
      className: "p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800",
      role: "alert"
    }, react_1["default"].createElement("div", {
      className: "flex items-center"
    }, react_1["default"].createElement("svg", {
      "aria-hidden": "true",
      className: "w-5 h-5 mr-2",
      fill: "currentColor",
      viewBox: "0 0 20 20",
      xmlns: "http://www.w3.org/2000/svg"
    }, react_1["default"].createElement("path", {
      "fill-rule": "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
      "clip-rule": "evenodd"
    })), react_1["default"].createElement("span", {
      className: "sr-only"
    }, "Info"), react_1["default"].createElement("h3", {
      className: "text-lg font-medium"
    }, "Save Commitment!")), react_1["default"].createElement("div", {
      className: "flex"
    }, react_1["default"].createElement("button", {
      type: "button",
      className: "text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800",
      onClick: function onClick() {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            navigator.clipboard.writeText(result);
            scaffold_eth_1.notification.success("Symmetric key copied to clipboard");
            return [2
            /*return*/
            ];
          });
        });
      }
    }, react_1["default"].createElement("svg", {
      "aria-hidden": "true",
      className: "-ml-0.5 mr-2 h-4 w-4",
      fill: "currentColor",
      viewBox: "0 0 20 20",
      xmlns: "http://www.w3.org/2000/svg"
    }, react_1["default"].createElement("path", {
      d: "M10 12a2 2 0 100-4 2 2 0 000 4z"
    }), react_1["default"].createElement("path", {
      "fill-rule": "evenodd",
      d: "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z",
      "clip-rule": "evenodd"
    })), "Copy to clipboard"))));
    return "0x" + Array.from(array).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  return react_1["default"].createElement("div", {
    className: "flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 "
  }, react_1["default"].createElement("div", {
    className: "max-w-3xl text-center my-2 text-base-content"
  }, react_1["default"].createElement("div", {
    className: "flex flex-col min-w-fit mx-auto items-center mb-5"
  }, react_1["default"].createElement("div", {
    className: "max-w-3xl text-center"
  }, react_1["default"].createElement("h1", {
    className: "text-6xl font-bold mb-8"
  }, "Vault"), react_1["default"].createElement("p", {
    className: "text-2xl  mb-5"
  }, "Where Zero-Knowledge Proofs Meet Secure Deposits."), react_1["default"].createElement("p", {
    className: "text-xl  mb-10"
  }, wallet === null || wallet === void 0 ? void 0 : wallet.address)), react_1["default"].createElement("div", {
    className: "flex flex-col min-w-fit mx-auto items-center mb-5"
  }, react_1["default"].createElement("div", {
    className: "max-w-3xl text-center"
  }, react_1["default"].createElement("button", {
    className: "btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700",
    onClick: function onClick() {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          navigator.clipboard.writeText(utils_js_1.keccak256(sismoData.auths[0].userId));
          scaffold_eth_1.notification.success("Sismo Response copied to clipboard");
          return [2
          /*return*/
          ];
        });
      });
    }
  }, "Copy encrypted vaultId to clipboard"))), react_1["default"].createElement("div", {
    className: "p-4 "
  }, react_1["default"].createElement("div", {
    className: "w-full"
  }, react_1["default"].createElement("div", {
    className: "card card-bordered border-2 bg-secondary my-10 p-10 w-fit mx-auto flex flex-col  text-left"
  }, depositedBalance && wallet && react_1["default"].createElement("p", {
    className: "text-left text-lg mb-5"
  }, "Balance: ", depositedBalance, " ETH"), react_1["default"].createElement("span", {
    className: "text-base font-semibold my-5 "
  }, "Deposit"), react_1["default"].createElement("div", {
    className: "w-full mb-5"
  }, react_1["default"].createElement("input", {
    type: "text",
    className: "input input-bordered w-80",
    placeholder: "Amount to Deposit",
    onChange: function onChange(e) {
      return setAmount(Number(e.target.value));
    }
  })), react_1["default"].createElement("div", {
    className: "w-full mb-5"
  }, react_1["default"].createElement("button", {
    className: "btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700",
    onClick: function onClick() {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!tokenAddress) return [3
              /*break*/
              , 2];
              return [4
              /*yield*/
              , depositToken(tokenAddress)];

            case 1:
              _a.sent();

              return [3
              /*break*/
              , 4];

            case 2:
              return [4
              /*yield*/
              , deposit()];

            case 3:
              _a.sent();

              _a.label = 4;

            case 4:
              return [2
              /*return*/
              ];
          }
        });
      });
    },
    disabled: sismoResponse != null ? false : true
  }, "Deposit")), react_1["default"].createElement("span", {
    className: "text-base font-semibold my-2 "
  }, "Withdraw"), react_1["default"].createElement("div", {
    className: "w-full mb-5"
  }, react_1["default"].createElement("input", {
    type: "text",
    className: "input input-bordered w-full",
    placeholder: "Amount to Withdraw",
    onChange: function onChange(e) {
      return setAmount(Number(e.target.value));
    }
  })), react_1["default"].createElement("div", {
    className: "w-full"
  }, react_1["default"].createElement("button", {
    className: "btn w-full p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700",
    onClick: function onClick() {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!tokenAddress) return [3
              /*break*/
              , 2];
              return [4
              /*yield*/
              , withdrawToken(tokenAddress)];

            case 1:
              _a.sent();

              return [3
              /*break*/
              , 4];

            case 2:
              return [4
              /*yield*/
              , withdraw()];

            case 3:
              _a.sent();

              _a.label = 4;

            case 4:
              return [2
              /*return*/
              ];
          }
        });
      });
    },
    disabled: sismoResponse != null ? false : true && !withdrawalAddress && !nonce
  }, "Withdraw"))))))));
};

exports["default"] = Vault;