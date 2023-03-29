import { ethers, formatEther } from "ethers";
import dotenv from "dotenv"; // Load environment variables from .env file
import "./helpers";
import fs from "fs";
import path from "path";
import { parseEther } from "ethers";
import util from "tweetnacl-util";

const deployedContractJSON = "../../nextjs/generated/hardhat_contracts.json";

let contracts: any = {};

let signer: ethers.Wallet;

const ErasureHelper = require("@erasure/crypto-ipfs");

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

async function fetchBalance(_feedAddr: string) {
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));

  const MecenateFeed = new ethers.Contract(
    _feedAddr,
    contracts["MecenateFeed"].abi,
    signer
  );

  MecenateFeed.connect(signer);

  const tx = await MecenateFeed.getStake(signer?.address);

  console.log(formatEther(tx));
}

export { fetchBalance };