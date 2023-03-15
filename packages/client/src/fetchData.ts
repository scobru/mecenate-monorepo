import { ethers } from "ethers";
const etherInstance = require("ethers");

import dotenv from "dotenv"; // Load environment variables from .env file
import "./helpers";
import { retrievePost } from "./helpers";
import fs from "fs";
import path from "path";
import { parseEther, formatEther } from "ethers";
const deployedContractJSON = "../../nextjs/generated/hardhat_contracts.json";
let contracts: any = {};
let signer: ethers.Wallet;
let user: any;

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

async function fetchData(_feedAddress: string) {
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Connected to wallet!");

  const MecenateFeed = new ethers.Contract(
    _feedAddress,
    contracts["MecenateFeed"].abi,
    signer
  );

  const post = await MecenateFeed.post();
  const encryptedKey = post[1][2].encryptedKey;
  await retrievePost(encryptedKey);
}

export { fetchData };
