{
    "11155111";
    [
        {
            "name": "sepolia",
            "chainId": "11155111",
            "contracts": {
                "MecenateTreasury": {
                    "address": "0x917C5Fc4FB2010743ee4a5c368d1b4A3139C6385",
                    "abi": [
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "previousOwner",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "OwnershipTransferred",
                            "type": "event"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "token",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "_amount",
                                    "type": "uint256"
                                }
                            ],
                            "name": "addLiquidity",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_native",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_unirouter",
                                    "type": "address"
                                }
                            ],
                            "name": "configLiquidityProvider",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_token",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "_amount",
                                    "type": "uint256"
                                }
                            ],
                            "name": "customApprove",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "_amount",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_identityContract",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_usersContract",
                                    "type": "address"
                                }
                            ],
                            "name": "distribute",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "fixedFee",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "globalFee",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "lastDistributed",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "native",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "owner",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "renounceOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "_fixedFee",
                                    "type": "uint256"
                                }
                            ],
                            "name": "setFixedFee",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "_globalFee",
                                    "type": "uint256"
                                }
                            ],
                            "name": "setGlobalFee",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "_slippage",
                                    "type": "uint256"
                                }
                            ],
                            "name": "setSlippage",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bool",
                                    "name": "_splitLiquidity",
                                    "type": "bool"
                                }
                            ],
                            "name": "setSplitLiqudity",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "slippage",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "splitLiquidity",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "token1",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "token2",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "amount",
                                    "type": "uint256"
                                }
                            ],
                            "name": "swapTokensForTokens",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "transferOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "unirouter",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address payable",
                                    "name": "_to",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "_amount",
                                    "type": "uint256"
                                }
                            ],
                            "name": "withdrawNative",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_token",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_to",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "_amount",
                                    "type": "uint256"
                                }
                            ],
                            "name": "withdrawTokens",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "stateMutability": "payable",
                            "type": "receive"
                        }
                    ]
                },
                "MecenateVerifier": {
                    "address": "0x12c6daD1D12e410f3c000FF6785b9ff51a18DC77",
                    "abi": [
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes16",
                                    "name": "_appId",
                                    "type": "bytes16"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "enum AuthType",
                                    "name": "authType",
                                    "type": "uint8"
                                }
                            ],
                            "name": "AuthTypeNotFoundInVerifiedResult",
                            "type": "error"
                        },
                        {
                            "inputs": [],
                            "name": "ADDRESSES_PROVIDER_V2",
                            "outputs": [
                                {
                                    "internalType": "contract IAddressesProvider",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "APP_ID",
                            "outputs": [
                                {
                                    "internalType": "bytes16",
                                    "name": "",
                                    "type": "bytes16"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "IS_IMPERSONATION_MODE",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "SISMO_CONNECT_LIB_VERSION",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "appId",
                            "outputs": [
                                {
                                    "internalType": "bytes16",
                                    "name": "",
                                    "type": "bytes16"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "config",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes16",
                                            "name": "appId",
                                            "type": "bytes16"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bool",
                                                    "name": "isImpersonationMode",
                                                    "type": "bool"
                                                }
                                            ],
                                            "internalType": "struct VaultConfig",
                                            "name": "vault",
                                            "type": "tuple"
                                        }
                                    ],
                                    "internalType": "struct SismoConnectConfig",
                                    "name": "",
                                    "type": "tuple"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "sismoVerify",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        }
                    ]
                },
                "MecenateUsers": {
                    "address": "0x9D043e7642262bc251bCcd762c6b491f08B05949",
                    "abi": [
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_verifierContract",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "previousOwner",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "OwnershipTransferred",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": false,
                                    "internalType": "bytes",
                                    "name": "vaultID",
                                    "type": "bytes"
                                }
                            ],
                            "name": "UserRegistered",
                            "type": "event"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "user",
                                    "type": "uint256"
                                }
                            ],
                            "name": "checkifUserExist",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "startIndex",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "endIndex",
                                    "type": "uint256"
                                }
                            ],
                            "name": "getPaginatedUsers",
                            "outputs": [
                                {
                                    "internalType": "uint256[]",
                                    "name": "users",
                                    "type": "uint256[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getUserCount",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "count",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getUsers",
                            "outputs": [
                                {
                                    "internalType": "uint256[]",
                                    "name": "users",
                                    "type": "uint256[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "owner",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "registerUser",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "renounceOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "transferOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "verifierContract",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        }
                    ]
                },
                "MecenateFeedFactory": {
                    "address": "0x239E9d170dDbD7569B06D5ee9886D6C5b068D094",
                    "abi": [
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_usersMouduleContract",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_treasuryContract",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_verifierContract",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "addr",
                                    "type": "address"
                                }
                            ],
                            "name": "FeedCreated",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "previousOwner",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "OwnershipTransferred",
                            "type": "event"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "name": "authorized",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "buildFeed",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_treasury",
                                    "type": "address"
                                }
                            ],
                            "name": "changeTreasury",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "contractCounter",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "name": "createdContracts",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "name": "feeds",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_feed",
                                    "type": "address"
                                }
                            ],
                            "name": "getFeedInfo",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "address",
                                            "name": "contractAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "operator",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "sellerStake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "buyerStake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "totalStake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "buyerPayment",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Structures.Feed",
                                    "name": "",
                                    "type": "tuple"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getFeeds",
                            "outputs": [
                                {
                                    "internalType": "address[]",
                                    "name": "",
                                    "type": "address[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getFeedsInfo",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "address",
                                            "name": "contractAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "operator",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "sellerStake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "buyerStake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "totalStake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "buyerPayment",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Structures.Feed[]",
                                    "name": "",
                                    "type": "tuple[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "owner",
                                    "type": "address"
                                }
                            ],
                            "name": "getFeedsOwned",
                            "outputs": [
                                {
                                    "internalType": "address[]",
                                    "name": "",
                                    "type": "address[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "contractAddress",
                                    "type": "address"
                                }
                            ],
                            "name": "isContractCreated",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "owner",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_addr",
                                    "type": "address"
                                }
                            ],
                            "name": "removeAuthorized",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "renounceOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_addr",
                                    "type": "address"
                                }
                            ],
                            "name": "setAuthorized",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "transferOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "treasuryContract",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "stateMutability": "payable",
                            "type": "receive"
                        }
                    ]
                },
                "MecenateFeed": {
                    "address": "0x8486Bd03e24e08C45d94273eBAF36d109d3A4F5c",
                    "abi": [
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "owner",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_usersModuleContract",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_verifierContract",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Accepted",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Created",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": false,
                                    "internalType": "address",
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "newDeposit",
                                    "type": "uint256"
                                }
                            ],
                            "name": "DepositDecreased",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": false,
                                    "internalType": "address",
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "newDeposit",
                                    "type": "uint256"
                                }
                            ],
                            "name": "DepositIncreased",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Finalized",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Invalid",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "MadePublic",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "previousOwner",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "OwnershipTransferred",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Refunded",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Renounced",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": false,
                                    "internalType": "address",
                                    "name": "staker",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount",
                                    "type": "uint256"
                                }
                            ],
                            "name": "StakeBurned",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.Post",
                                    "name": "post",
                                    "type": "tuple"
                                }
                            ],
                            "name": "Valid",
                            "type": "event"
                        },
                        {
                            "inputs": [],
                            "name": "ZEROHASH",
                            "outputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "",
                                    "type": "bytes"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "acceptPost",
                            "outputs": [],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "addStake",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_usersModuleContract",
                                    "type": "address"
                                }
                            ],
                            "name": "changeUsersModuleContract",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "encryptedHash",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "enum Structures.PostType",
                                    "name": "postType",
                                    "type": "uint8"
                                },
                                {
                                    "internalType": "enum Structures.PostDuration",
                                    "name": "postDuration",
                                    "type": "uint8"
                                },
                                {
                                    "internalType": "address",
                                    "name": "buyer",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "payment",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "createPost",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "vaultId",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "wallet",
                                                    "type": "address"
                                                }
                                            ],
                                            "internalType": "struct Structures.User",
                                            "name": "creator",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "enum Structures.PostStatus",
                                                            "name": "status",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "enum Structures.PostType",
                                                            "name": "postType",
                                                            "type": "uint8"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "buyer",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "buyerPubKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "address",
                                                            "name": "seller",
                                                            "type": "address"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "creationTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "endTimeStamp",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "duration",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostSettings",
                                                    "name": "settings",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "stake",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "payment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "punishment",
                                                            "type": "uint256"
                                                        },
                                                        {
                                                            "internalType": "uint256",
                                                            "name": "buyerPunishment",
                                                            "type": "uint256"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEscrow",
                                                    "name": "escrow",
                                                    "type": "tuple"
                                                },
                                                {
                                                    "components": [
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedData",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "encryptedKey",
                                                            "type": "bytes"
                                                        },
                                                        {
                                                            "internalType": "bytes",
                                                            "name": "decryptedData",
                                                            "type": "bytes"
                                                        }
                                                    ],
                                                    "internalType": "struct Structures.PostEncryptedData",
                                                    "name": "data",
                                                    "type": "tuple"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostData",
                                            "name": "postdata",
                                            "type": "tuple"
                                        }
                                    ],
                                    "internalType": "struct Structures.Post",
                                    "name": "",
                                    "type": "tuple"
                                }
                            ],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "factoryContract",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bool",
                                    "name": "valid",
                                    "type": "bool"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "punishment",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "finalizePost",
                            "outputs": [
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getBuyer",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getBuyerPayment",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getPostCount",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getPostStatus",
                            "outputs": [
                                {
                                    "internalType": "enum Structures.PostStatus",
                                    "name": "",
                                    "type": "uint8"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getSeller",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getSellerStake",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "staker",
                                    "type": "address"
                                }
                            ],
                            "name": "getStake",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "amount",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getTotalStaked",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "owner",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "post",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes",
                                            "name": "vaultId",
                                            "type": "bytes"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "wallet",
                                            "type": "address"
                                        }
                                    ],
                                    "internalType": "struct Structures.User",
                                    "name": "creator",
                                    "type": "tuple"
                                },
                                {
                                    "components": [
                                        {
                                            "components": [
                                                {
                                                    "internalType": "enum Structures.PostStatus",
                                                    "name": "status",
                                                    "type": "uint8"
                                                },
                                                {
                                                    "internalType": "enum Structures.PostType",
                                                    "name": "postType",
                                                    "type": "uint8"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "buyer",
                                                    "type": "address"
                                                },
                                                {
                                                    "internalType": "bytes",
                                                    "name": "buyerPubKey",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "address",
                                                    "name": "seller",
                                                    "type": "address"
                                                },
                                                {
                                                    "internalType": "uint256",
                                                    "name": "creationTimeStamp",
                                                    "type": "uint256"
                                                },
                                                {
                                                    "internalType": "uint256",
                                                    "name": "endTimeStamp",
                                                    "type": "uint256"
                                                },
                                                {
                                                    "internalType": "uint256",
                                                    "name": "duration",
                                                    "type": "uint256"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostSettings",
                                            "name": "settings",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "internalType": "uint256",
                                                    "name": "stake",
                                                    "type": "uint256"
                                                },
                                                {
                                                    "internalType": "uint256",
                                                    "name": "payment",
                                                    "type": "uint256"
                                                },
                                                {
                                                    "internalType": "uint256",
                                                    "name": "punishment",
                                                    "type": "uint256"
                                                },
                                                {
                                                    "internalType": "uint256",
                                                    "name": "buyerPunishment",
                                                    "type": "uint256"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostEscrow",
                                            "name": "escrow",
                                            "type": "tuple"
                                        },
                                        {
                                            "components": [
                                                {
                                                    "internalType": "bytes",
                                                    "name": "encryptedData",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "bytes",
                                                    "name": "encryptedKey",
                                                    "type": "bytes"
                                                },
                                                {
                                                    "internalType": "bytes",
                                                    "name": "decryptedData",
                                                    "type": "bytes"
                                                }
                                            ],
                                            "internalType": "struct Structures.PostEncryptedData",
                                            "name": "data",
                                            "type": "tuple"
                                        }
                                    ],
                                    "internalType": "struct Structures.PostData",
                                    "name": "postdata",
                                    "type": "tuple"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "postCount",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "punishmentRatio",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "renounceOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "renouncePost",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "decryptedData",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "revealData",
                            "outputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "",
                                    "type": "bytes"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "encryptedKey",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "submitHash",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "takeFullStake",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "amountToTake",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "sismoConnectResponse",
                                    "type": "bytes"
                                }
                            ],
                            "name": "takeStake",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "transferOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "usersModuleContract",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "verifierContract",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        }
                    ]
                },
                "MecenateBay": {
                    "address": "0xcA032401b0cb6714C6710B1009eEa88bA3b95DFE",
                    "abi": [
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_usersMouduleContract",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "previousOwner",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "OwnershipTransferred",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes32",
                                            "name": "request",
                                            "type": "bytes32"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "payment",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "stake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "postAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "bool",
                                            "name": "accepted",
                                            "type": "bool"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.BayRequest",
                                    "name": "",
                                    "type": "tuple"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "uint256",
                                    "name": "index",
                                    "type": "uint256"
                                }
                            ],
                            "name": "RequestAccepted",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes32",
                                            "name": "request",
                                            "type": "bytes32"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "payment",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "stake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "postAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "bool",
                                            "name": "accepted",
                                            "type": "bool"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "indexed": false,
                                    "internalType": "struct Structures.BayRequest",
                                    "name": "",
                                    "type": "tuple"
                                },
                                {
                                    "indexed": true,
                                    "internalType": "uint256",
                                    "name": "index",
                                    "type": "uint256"
                                }
                            ],
                            "name": "RequestCreated",
                            "type": "event"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "index",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_feed",
                                    "type": "address"
                                }
                            ],
                            "name": "acceptRequest",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "name": "allRequests",
                            "outputs": [
                                {
                                    "internalType": "bytes32",
                                    "name": "request",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "address",
                                    "name": "buyer",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "seller",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "payment",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "stake",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "postAddress",
                                    "type": "address"
                                },
                                {
                                    "internalType": "bool",
                                    "name": "accepted",
                                    "type": "bool"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "postCount",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "contractCounter",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes32",
                                            "name": "request",
                                            "type": "bytes32"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "payment",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "stake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "postAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "bool",
                                            "name": "accepted",
                                            "type": "bool"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Structures.BayRequest",
                                    "name": "request",
                                    "type": "tuple"
                                }
                            ],
                            "name": "createRequest",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes32",
                                            "name": "request",
                                            "type": "bytes32"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "payment",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "stake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "postAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "bool",
                                            "name": "accepted",
                                            "type": "bool"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Structures.BayRequest",
                                    "name": "",
                                    "type": "tuple"
                                }
                            ],
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_address",
                                    "type": "address"
                                }
                            ],
                            "name": "getRequestForAddress",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes32",
                                            "name": "request",
                                            "type": "bytes32"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "payment",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "stake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "postAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "bool",
                                            "name": "accepted",
                                            "type": "bool"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Structures.BayRequest[]",
                                    "name": "",
                                    "type": "tuple[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "getRequests",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "bytes32",
                                            "name": "request",
                                            "type": "bytes32"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "buyer",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "seller",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "payment",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "stake",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "address",
                                            "name": "postAddress",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "bool",
                                            "name": "accepted",
                                            "type": "bool"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "postCount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Structures.BayRequest[]",
                                    "name": "",
                                    "type": "tuple[]"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "owner",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "index",
                                    "type": "uint256"
                                }
                            ],
                            "name": "removeRequest",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "renounceOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "name": "requests",
                            "outputs": [
                                {
                                    "internalType": "bytes32",
                                    "name": "request",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "address",
                                    "name": "buyer",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "seller",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "payment",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "stake",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "postAddress",
                                    "type": "address"
                                },
                                {
                                    "internalType": "bool",
                                    "name": "accepted",
                                    "type": "bool"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "postCount",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "newOwner",
                                    "type": "address"
                                }
                            ],
                            "name": "transferOwnership",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "usersMouduleContract",
                            "outputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        }
                    ]
                },
                "MecenateStats": {
                    "address": "0x06811f648Af49C51EDeeea8763b193A998e7D2d5",
                    "abi": [
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_mecenateUsers",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_mecenateFeedFactory",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_mecenateBay",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "_mecenateTreasury",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "inputs": [],
                            "name": "getStats",
                            "outputs": [
                                {
                                    "components": [
                                        {
                                            "internalType": "uint256",
                                            "name": "totalUsers",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "totalBayRequests",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "totalFeeds",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "globalFee",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "fixedFee",
                                            "type": "uint256"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "treasuryBalance",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct MecenateStats.Stats",
                                    "name": "",
                                    "type": "tuple"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "mecenateBay",
                            "outputs": [
                                {
                                    "internalType": "contract IMecenateBay",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "mecenateFeedFactory",
                            "outputs": [
                                {
                                    "internalType": "contract IMecenateFeedFactory",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "mecenateTreasury",
                            "outputs": [
                                {
                                    "internalType": "contract IMecenateTreasury",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "mecenateUsers",
                            "outputs": [
                                {
                                    "internalType": "contract IMecenateUsers",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        }
                    ]
                }
            }
        }
    ];
}