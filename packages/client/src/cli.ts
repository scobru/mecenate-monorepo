#!/usr/bin/env YARN_SILENT=1 yarn ts-node
import dotenv from "dotenv"
import {
  run,
  boolean,
  option,
  Type,
  flag,
  extendType,
  command,
  string,
  number,
  subcommands,
} from "cmd-ts";

import { ethers } from "ethers"
import { MecenateClient } from "./client";

dotenv.config()

const pinataKey = String(process.env.PINATA_KEY)
const pinataSecret = String(process.env.PINATA_SECRET)
const privateKey = process.env.PRIVATE_KEY
const rpc = process.env.PUBLIC_RPC_URL

const provider = new ethers.providers.JsonRpcProvider(rpc)
const wallet = new ethers.Wallet(String(privateKey), provider)

const client = new MecenateClient(wallet, pinataKey, pinataSecret)

import figlet from "figlet";

const list = command({
  name: "List Feed",
  args: {},
  handler: async () => {
    await client.listFeed()
  },
});

const post = command({
  name: "Create Post",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    postDuration: option({
      type: number,
      long: "postDuration",
      short: "d",
    }),
    postType: option({
      type: number,
      long: "postType",
      short: "t",
    }),
    postStake: option({
      type: string,
      long: "postStake",
      short: "ps",
    }),
    rawdata: option({
      type: string,
      long: "rawdata",
      short: "r",
    }),
    buyer: option({
      type: string,
      long: "buyer",
      short: "b",
    }),
    buyerPayment: option({
      type: string,
      long: "buyerPayment",
      short: "p",
    }),
    tokenId: option({
      type: number,
      long: "tokenId",
      short: "t",
    }),
    funder: option({
      type: string,
      long: "funder",
      short: "b",
    }),
    seller: option({
      type: string,
      long: "seller",
      short: "s",
    }),
    useStake: flag({
      type: boolean,
      long: "useStake",
      short: "u",
    }),
  },
  handler: async ({
    address,
    rawdata,
    buyer,
    postType,
    postDuration,
    buyerPayment,
    postStake,
    tokenId,
    funder,
    seller,
    useStake
  }) => {
    await client.createPost(
      address,
      rawdata,
      buyer,
      postType,
      postDuration,
      buyerPayment,
      postStake,
      tokenId,
      funder,
      seller,
      useStake
    );
  },
});

const buildFeed = command({
  name: "Create Feed",
  args: {},
  handler: async () => {
    await client.buildFeed();
  },
});

const registerUser = command({
  name: "Create User",
  args: {
    sismoConnectResponse: option({
      type: string,
      long: "sismoConnectResponse",
      short: "a",
    }),
    publicKey: option({
      type: string,
      long: "publicKey",
      short: "p",
    }),
  },
  handler: async ({ sismoConnectResponse, publicKey }) => {
    await client.registerUser(sismoConnectResponse, publicKey);
  },
});

const verifyIdentity = command({
  name: "Create User",
  args: {},
  handler: async () => {
    client.verifyIdentity();
  },
});

const createPair = command({
  name: "Create Key Pair",
  args: {},
  handler: async () => {
    await client.createPair();
    return;
  },
});

const feedInfo = command({
  name: "Feed Info",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await client.feedInfo(address);
    return;
  },
});

const acceptPost = command({
  name: "Accept Feed",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    payment: option({
      type: string,
      long: "payment",
      short: "p",
    }),
  },
  handler: async ({ address, payment }) => {
    await client.acceptPost(payment, address);
  },
});

const finalizePost = command({
  name: "Finalize Post",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    valid: flag({
      type: boolean,
      long: "valid",
      short: "v",
    }),
    punishment: option({
      type: string,
      long: "punishment",
      short: "p",
    }),
  },
  handler: async ({ address, valid, punishment }) => {
    await client.finalizePost(valid, punishment, address);
  },
});

const submitData = command({
  name: "Submit Hash",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    symKey: option({
      type: string,
      long: "Post Symmetric Key",
      short: "sym",
    }),
    secretKey: option({
      type: string,
      long: "User Secret Key",
      short: "sec",
    }),
  },
  handler: async ({ address, symKey, secretKey }) => {
    await client.submitData(address, symKey, secretKey);
  },
});

const fetchPost = command({
  name: "Fetch Data",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await client.fetchPost(address);
  },
});

const getStake = command({
  name: "Fetch Balance",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await client.getStake(address);
  },
});

const takeStake = command({
  name: "Take Stake",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    stakeAmount: option({
      type: string,
      long: "stakeAmount",
      short: "s",
    }),
    tokenId: option({
      type: string,
      long: "tokenId",
      short: "t",
    }),
    receiver: option({
      type: string,
      long: "receiver",
      short: "r",
    }),
  },
  handler: async ({ address, stakeAmount, tokenId, receiver }) => {
    await client.takeStake(tokenId, address, stakeAmount, receiver);
  },
});

const takeAllStake = command({
  name: "Take Full Stake",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    tokenId: option({
      type: string,
      long: "tokenId",
      short: "t",
    }),
    receiver: option({
      type: string,
      long: "receiver",
      short: "r",
    }),
  },
  handler: async ({ address, tokenId, receiver }) => {
    await client.takeAll(tokenId, address, receiver);
  },
});

const addStake = command({
  name: "Add Stake",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
    stakeAmount: option({
      type: string,
      long: "stakeAMount",
      short: "s",
    }),
    tokenId: option({
      type: string,
      long: "tokenId",
      short: "t",
    }),
  },
  handler: async ({ tokenId, address, stakeAmount }) => {
    await client.addStake(tokenId, address, stakeAmount);
  },
});

const help = command({
  name: "Help",
  args: {},
  handler: async () => {
    console.log(
      figlet.textSync("Mecenate Protocol", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      })
    );
    console.log("Welcome to Mecenate CLI");
    console.log("Usage: cli.ts <command> [options]");
    console.log("Command: post:");
    console.log("  -a, --address ,address of the feed");
    console.log(
      "  -d, --duration ,|| 1. OneDay, 2.ThreeDays , 3. OneWeek, 4. OneMonth"
    );
    console.log(
      "  -t, --type, type of the post || 1. Text, 2. Image, 3. Video, 4. Audio, 5. File"
    );
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

const subCommands = subcommands({
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

run(subCommands, process.argv.slice(2));
