#!/usr/bin/env YARN_SILENT=1 yarn ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cmd_ts_1 = require("cmd-ts");
const ethers_1 = require("ethers");
const client_1 = require("./client");
dotenv_1.default.config();
const pinataKey = String(process.env.PINATA_KEY);
const pinataSecret = String(process.env.PINATA_SECRET);
const privateKey = process.env.PRIVATE_KEY;
const rpc = process.env.PUBLIC_RPC_URL;
const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpc);
const wallet = new ethers_1.ethers.Wallet(String(privateKey), provider);
const client = new client_1.MecenateClient(wallet, pinataKey, pinataSecret);
const figlet_1 = __importDefault(require("figlet"));
const list = (0, cmd_ts_1.command)({
    name: "List Feed",
    args: {},
    handler: async () => {
        await client.listFeed();
    },
});
const post = (0, cmd_ts_1.command)({
    name: "Create Post",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        postDuration: (0, cmd_ts_1.option)({
            type: cmd_ts_1.number,
            long: "postDuration",
            short: "d",
        }),
        postType: (0, cmd_ts_1.option)({
            type: cmd_ts_1.number,
            long: "postType",
            short: "t",
        }),
        postStake: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "postStake",
            short: "ps",
        }),
        rawdata: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "rawdata",
            short: "r",
        }),
        buyer: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "buyer",
            short: "b",
        }),
        buyerPayment: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "buyerPayment",
            short: "p",
        }),
        tokenId: (0, cmd_ts_1.option)({
            type: cmd_ts_1.number,
            long: "tokenId",
            short: "t",
        }),
        funder: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "funder",
            short: "b",
        }),
        seller: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "seller",
            short: "s",
        }),
        useStake: (0, cmd_ts_1.flag)({
            type: cmd_ts_1.boolean,
            long: "useStake",
            short: "u",
        }),
    },
    handler: async ({ address, rawdata, buyer, postType, postDuration, buyerPayment, postStake, tokenId, funder, seller, useStake }) => {
        await client.createPost(address, rawdata, buyer, postType, postDuration, buyerPayment, postStake, tokenId, funder, seller, useStake);
    },
});
const buildFeed = (0, cmd_ts_1.command)({
    name: "Create Feed",
    args: {},
    handler: async () => {
        await client.buildFeed();
    },
});
const registerUser = (0, cmd_ts_1.command)({
    name: "Create User",
    args: {
        sismoConnectResponse: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "sismoConnectResponse",
            short: "a",
        }),
        publicKey: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "publicKey",
            short: "p",
        }),
    },
    handler: async ({ sismoConnectResponse, publicKey }) => {
        await client.registerUser(sismoConnectResponse, publicKey);
    },
});
const verifyIdentity = (0, cmd_ts_1.command)({
    name: "Create User",
    args: {},
    handler: async () => {
        client.verifyIdentity();
    },
});
const createPair = (0, cmd_ts_1.command)({
    name: "Create Key Pair",
    args: {},
    handler: async () => {
        await client.createPair();
        return;
    },
});
const feedInfo = (0, cmd_ts_1.command)({
    name: "Feed Info",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
    },
    handler: async ({ address }) => {
        await client.feedInfo(address);
        return;
    },
});
const acceptPost = (0, cmd_ts_1.command)({
    name: "Accept Feed",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        payment: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "payment",
            short: "p",
        }),
    },
    handler: async ({ address, payment }) => {
        await client.acceptPost(payment, address);
    },
});
const finalizePost = (0, cmd_ts_1.command)({
    name: "Finalize Post",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        valid: (0, cmd_ts_1.flag)({
            type: cmd_ts_1.boolean,
            long: "valid",
            short: "v",
        }),
        punishment: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "punishment",
            short: "p",
        }),
    },
    handler: async ({ address, valid, punishment }) => {
        await client.finalizePost(valid, punishment, address);
    },
});
const submitData = (0, cmd_ts_1.command)({
    name: "Submit Hash",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        symKey: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "Post Symmetric Key",
            short: "sym",
        }),
        secretKey: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "User Secret Key",
            short: "sec",
        }),
    },
    handler: async ({ address, symKey, secretKey }) => {
        await client.submitData(address, symKey, secretKey);
    },
});
const fetchPost = (0, cmd_ts_1.command)({
    name: "Fetch Data",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
    },
    handler: async ({ address }) => {
        await client.fetchPost(address);
    },
});
const getStake = (0, cmd_ts_1.command)({
    name: "Fetch Balance",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
    },
    handler: async ({ address }) => {
        await client.getStake(address);
    },
});
const takeStake = (0, cmd_ts_1.command)({
    name: "Take Stake",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        stakeAmount: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "stakeAmount",
            short: "s",
        }),
        tokenId: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "tokenId",
            short: "t",
        }),
        receiver: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "receiver",
            short: "r",
        }),
    },
    handler: async ({ address, stakeAmount, tokenId, receiver }) => {
        await client.takeStake(tokenId, address, stakeAmount, receiver);
    },
});
const takeAllStake = (0, cmd_ts_1.command)({
    name: "Take Full Stake",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        tokenId: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "tokenId",
            short: "t",
        }),
        receiver: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "receiver",
            short: "r",
        }),
    },
    handler: async ({ address, tokenId, receiver }) => {
        await client.takeAll(tokenId, address, receiver);
    },
});
const addStake = (0, cmd_ts_1.command)({
    name: "Add Stake",
    args: {
        address: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "address",
            short: "a",
        }),
        stakeAmount: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "stakeAMount",
            short: "s",
        }),
        tokenId: (0, cmd_ts_1.option)({
            type: cmd_ts_1.string,
            long: "tokenId",
            short: "t",
        }),
    },
    handler: async ({ tokenId, address, stakeAmount }) => {
        await client.addStake(tokenId, address, stakeAmount);
    },
});
const help = (0, cmd_ts_1.command)({
    name: "Help",
    args: {},
    handler: async () => {
        console.log(figlet_1.default.textSync("Mecenate Protocol", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
        }));
        console.log("Welcome to Mecenate CLI");
        console.log("Usage: cli.ts <command> [options]");
        console.log("Command: post:");
        console.log("  -a, --address ,address of the feed");
        console.log("  -d, --duration ,|| 1. OneDay, 2.ThreeDays , 3. OneWeek, 4. OneMonth");
        console.log("  -t, --type, type of the post || 1. Text, 2. Image, 3. Video, 4. Audio, 5. File");
        console.log("  -s, --stake, stake of the post in Tokens or ETH");
        console.log("  -r, --rawdata, raw data of the post");
        console.log("  -b, --buyer, Buyer of the post");
        console.log("  -p, --payment payment of the feed in Tokens or ETH");
        console.log("Command: accept:");
        console.log("  -a, --address address of the feed");
        console.log("  -p, --payment payment of the feed in Tokens or ETH");
        console.log("Command: info");
        console.log("  -a, --address address of the feed");
        console.log("Command: submit");
        console.log("  -a, --address address of the feed");
        console.log("Command: fetch");
        console.log("  -a, --address address of the feed");
    },
});
const subCommands = (0, cmd_ts_1.subcommands)({
    name: "cli.ts",
    cmds: {
        help,
        list,
        post,
        acceptPost,
        submitData,
        finalizePost,
        feedInfo,
        registerUser,
        verifyIdentity,
        createPair,
        buildFeed,
        fetchPost,
        getStake,
        addStake,
        takeStake,
        takeAllStake,
    },
});
(0, cmd_ts_1.run)(subCommands, process.argv.slice(2));
