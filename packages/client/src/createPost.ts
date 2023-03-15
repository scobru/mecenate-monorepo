import { ethers } from "ethers";
import dotenv from "dotenv"; // Load environment variables from .env file
import "./helpers";
import { savePost } from "./helpers";
import fs from "fs";
import path from "path";
import { parseEther } from "ethers";

let contracts: any = {};
let signer: ethers.Wallet;

const deployedContractJSON = "../../nextjs/generated/hardhat_contracts.json";
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

async function createPost(
  _feedAddr: string,
  _duration: number,
  _postType: number,
  _stake: string,
  _RawData: string
) {
  // Create a new MecenateFeed contract instance
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));

  const MecenateFeedFactory = new ethers.Contract(
    contracts["MecenateFeedFactory"].address,
    contracts["MecenateFeedFactory"].abi,
    signer
  );

  let feedAddress = await MecenateFeedFactory?.getFeedsOwned(signer.address);

  const len = feedAddress.length;
  console.log("Feed Address: ", feedAddress[len - 1]);

  const MecenateFeed = new ethers.Contract(
    _feedAddr,
    contracts["MecenateFeed"].abi,
    signer
  );

  MecenateFeed.connect(signer);

  const keyPair = fs.readFileSync(
    path.join(__dirname, "./keypair/keypair.json"),
    "utf8"
  );

  const keyPairJson = JSON.parse(keyPair);
  const publicKey = keyPairJson.publicKey;

  const abicoder = new ethers.AbiCoder();
  const publicKeyBytes = abicoder.encode(["string"], [publicKey]);

  const RawData = "This is an example data";
  const duration = _duration;
  const postType = _postType;
  const stake = parseEther(_stake);
  const ipfsData = await savePost(RawData, signer.address, publicKeyBytes);

  // store keypair
  const ipfsPath = "./ipfsPost/post_" + _feedAddr + ".json";
  // if doesnt exit create folder
  if (!fs.existsSync("./ipfsPost")) {
    fs.mkdirSync("./ipfsPost");
  }

  if (!fs.existsSync(ipfsPath)) {
    fs.writeFileSync(ipfsPath, JSON.stringify(ipfsData));
    console.log(JSON.stringify(ipfsData));
    console.log("Ipfs data saved!");
  } else {
    console.log("Ipfs data already exists!");
  }

  /*  const proofHash = ethers.toUtf8Bytes(ipfsData?.proofhash);
  const proofHashSlice = proofHash.slice(0, 32); */

  const proofHash58 = await ErasureHelper.multihash({
    input: ipfsData?.proofhash,
    inputType: "raw",
    outputType: "digest",
  });

  // convert publicKey to Bytes32

  const tx = await MecenateFeed.createPost(proofHash58, postType, duration, {
    value: stake,
  });

  const post = await MecenateFeed.post();
  console.log("Post: ", post);
  console.log("Post created!");
}

export { createPost };
