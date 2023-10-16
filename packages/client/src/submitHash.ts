import { ethers } from "ethers";
const etherInstance = require("ethers");

import dotenv from "dotenv"; // Load environment variables from .env file
import "./helpers";
import { submitData, fetchKeyPair } from "./helpers";
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

async function submitHash(_feedAddress: string) {
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Connected to wallet!");

  const MecenateFeed = new ethers.Contract(
    _feedAddress,
    contracts["MecenateFeed"].abi,
    signer
  );

  const ipfsPost = fs.readFileSync(
    path.join(__dirname, "./ipfsPost/post_" + _feedAddress + ".json"),
    "utf8"
  );

  const ipfsPostJson = JSON.parse(ipfsPost);

  const symmetricKey = ipfsPostJson.symmetricKey;
  const proofhash = ipfsPostJson.proofhash;

  const post = await MecenateFeed.post();

  const buyerPubKey = post[1][0].buyerPubKey;
  const seller = post[1][0].seller;
  const buyer = post[1][0].buyer;

  console.log("MecenateFeed: ", await MecenateFeed.getAddress());
  console.log("Buyer PubKey: ", buyerPubKey);
  console.log("Proofhash: ", proofhash);
  console.log("Seller: ", seller);

  const submit = await submitData(
    _feedAddress,
    symmetricKey,
    proofhash,
    seller,
    buyer,
    buyerPubKey
  );

  const proofHashBytes = submit?.proofHash58Decode;

  console.log("Submit: ", submit);

  const tx = await MecenateFeed?.submitHash(proofHashBytes);

  console.log("Transaction hash: ", tx.hash);
}

export { submitHash };
