import { ethers } from "ethers";
const etherInstance = require("ethers");

import dotenv from "dotenv"; // Load environment variables from .env file
import "./helpers";
import fs from "fs";
const deployedContractJSON = "../../nextjs/generated/hardhat_contracts.json";
let contracts: any = {};
let signer: ethers.Wallet;

dotenv.config();

async function connectWallet() {
  // Retrieve the provider URL from environment variables
  const providerUrl = process.env.PROVIDER_URL || "http://localhost:8545";
  // Create a new provider instance
  const provider = new ethers.JsonRpcProvider(providerUrl);
  // Wallet instance from PrivateKey in env file
  signer = new ethers.Wallet(String(process.env.PRIVATEKEY), provider);
  console.log("Wallet address: ", signer.address);

  const network = await provider.getNetwork();
  console.log("Chain ID: ", network.chainId);

  const deployedContract = JSON.parse(
    fs.readFileSync(deployedContractJSON, "utf8")
  );
  const chainID = network.chainId;
  contracts = deployedContract[Number(chainID)][0].contracts;

  console.log(signer);
  console.log("Connection to wallet successful!");
}

async function createFeed() {
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Connected to wallet!");
  // Create a new MecenateFeed contract instance

  const MecenateFeedFactory = new ethers.Contract(
    contracts["MecenateFeedFactory"].address,
    contracts["MecenateFeedFactory"].abi,
    signer
  );

  const feed = await MecenateFeedFactory?.buildFeed();
  console.log("Feed: ", feed);

  let feedAddress = await MecenateFeedFactory?.getFeedsOwned(signer.address);

  const len = feedAddress.length;

  console.log("Feed Address: ", feedAddress[len - 1]);

  const MecenateFeed = new ethers.Contract(
    feedAddress[len - 1],
    contracts["MecenateFeed"].abi,
    signer
  );

  console.log("MecenateFeed: ", await MecenateFeed.getAddress());
  console.log("Create Feed Successful!");
}
export { createFeed };
