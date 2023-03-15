import { ethers } from "ethers";
import dotenv from "dotenv";
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

async function listFeed() {
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

  let feedAddress = await MecenateFeedFactory?.getFeeds();
  const len = feedAddress.length;
  console.log("Feed Address: ", feedAddress);

  const results = [];
  for (let i = 0; i < len; i++) {
    const MecenateFeed = new ethers.Contract(
      feedAddress[i],
      contracts["MecenateFeed"].abi,
      signer
    );

    let post = await MecenateFeed.post();
    results.push({
      feedAddress: feedAddress[i],
      creator: post[0],
      /*  settings: post[1][0],
      title: post[1][1],
      description: post[1][2], */
    });
  }
  console.log(results);
}

async function feedInfo(address: string) {
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

  let feedAddress = await MecenateFeedFactory?.getFeeds();
  const len = feedAddress.length;
  console.log("Feed Address: ", feedAddress);

  const results = [];

  const MecenateFeed = new ethers.Contract(
    address,
    contracts["MecenateFeed"].abi,
    signer
  );

  let post = await MecenateFeed.post();
  results.push({
    feedAddress: address,
    creator: post[0],
    settings: post[1][0],
    title: post[1][1],
    description: post[1][2],
  });

  console.log(results);
}
export { listFeed, feedInfo };
