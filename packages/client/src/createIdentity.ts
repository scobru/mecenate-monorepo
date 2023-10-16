import { ethers } from "ethers";
const etherInstance = require("ethers");
import dotenv from "dotenv";
import "./helpers";
import { savePost } from "./helpers";
import fs from "fs";
import path from "path";
import { parseEther, formatEther } from "ethers";
const deployedContractJSON = "./hardhat_contracts.json";
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

async function createIdentity() {
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Connected to wallet!");

  const identityData = {
    name: "New User",
    description: "Mecenate Protocol Identity",
    image: "https://mecenate.com/images/logo.png",
    owner: signer?.address,
  };

  // Create a new MecenateIdentity contract instance
  const MecenateIdentity = new ethers.Contract(
    contracts["MecenateIdentity"].address,
    contracts["MecenateIdentity"].abi,
    signer
  );

  MecenateIdentity.connect(signer);
  const creationFee = await MecenateIdentity.identityCreationFee();

  let tx = await MecenateIdentity.mint(identityData, { value: creationFee });

  console.log("Create Mecenate Idenitity Successful!");
}

export { createIdentity };
