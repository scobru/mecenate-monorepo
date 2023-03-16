#!/usr/bin/env YARN_SILENT=1 yarn ts-node

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

import { createIdentity } from "./createIdentity";
import { listFeed, feedInfo } from "./listFeed";
import { createPost } from "./createPost";
import { createFeed } from "./createFeed";
import { createUser } from "./createUser";
import { createKeyPair } from "./createKeyPair";
import { acceptFeed } from "./acceptFeed";
import { submitHash } from "./submitHash";
import { fetchData } from "./fetchData";
import { finalizePost } from "./finalize";
import { fetchBalance } from "./balance";
import { takeStake, takeFullStake, addStake } from "./stake";

const figlet = require("figlet");

const id = command({
  name: "Create ID",
  args: {},
  handler: async () => {
    await createIdentity();
  },
});

const list = command({
  name: "List Feed",
  args: {},
  handler: async () => {
    await listFeed();
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
    duration: option({
      type: number,
      long: "duration",
      short: "d",
    }),
    type: option({
      type: number,
      long: "type",
      short: "t",
    }),
    stake: option({
      type: string,
      long: "stake",
      short: "s",
    }),
    rawdata: option({
      type: string,
      long: "rawdata",
      short: "r",
    }),
  },
  handler: async ({ address, duration, type, stake, rawdata }) => {
    await createPost(address, Number(duration), type, stake, rawdata);
  },
});

const feed = command({
  name: "Create Feed",
  args: {},
  handler: async () => {
    await createFeed();
  },
});

const user = command({
  name: "Create User",
  args: {},
  handler: async () => {
    await createUser();
  },
});

const keypair = command({
  name: "Create Key Pair",
  args: {},
  handler: async () => {
    await createKeyPair();
  },
});

const info = command({
  name: "Feed Info",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await feedInfo(address);
  },
});

const accept = command({
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
    await acceptFeed(address, payment);
  },
});

const finalize = command({
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
    await finalizePost(address, valid, punishment);
  },
});

const submit = command({
  name: "Submit Hash",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await submitHash(address);
  },
});

const fetch = command({
  name: "Fetch Data",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await fetchData(address);
  },
});

const balance = command({
  name: "Fetch Balance",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await fetchBalance(address);
  },
});

const unstake = command({
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
  },
  handler: async ({ address, stakeAmount }) => {
    await takeStake(address, stakeAmount);
  },
});

const unstakeFull = command({
  name: "Take Full Stake",
  args: {
    address: option({
      type: string,
      long: "address",
      short: "a",
    }),
  },
  handler: async ({ address }) => {
    await takeFullStake(address);
  },
});

const stake = command({
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
  },
  handler: async ({ address, stakeAmount }) => {
    await addStake(address, stakeAmount);
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
    id,
    list,
    post,
    accept,
    submit,
    finalize,
    feed,
    info,
    user,
    fetch,
    keypair,
    balance,
    stake,
    unstake,
    unstakeFull,
  },
});

run(subCommands, process.argv.slice(2));
