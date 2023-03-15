import { ethers } from "ethers";
import dotenv from "dotenv"; // Load environment variables from .env file
import fs from "fs";
import path from "path";
import util from "tweetnacl-util";
const deployedContractJSON = "../../nextjs/generated/hardhat_contracts.json";
const ErasureHelper = require("@erasure/crypto-ipfs");
import utils from "ethers";
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

async function createUser() {
  await connectWallet();
  // wait 2 seconds to connect to wallet
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Connected to wallet!");

  const MecenateIdentity = new ethers.Contract(
    contracts["MecenateIdentity"].address,
    contracts["MecenateIdentity"].abi,
    signer
  );

  // fetch json key pair from folders keypair
  const keyPair = fs.readFileSync(
    path.join(__dirname, "./keypair/keypair.json"),
    "utf8"
  );
  const keyPairJson = JSON.parse(keyPair);

  /* const publicKey = await ErasureHelper.multihash({
    input: keyPairJson.publicKey,
    inputType: "raw",
    outputType: "hex",
  });
 */

  const abicoder = new ethers.AbiCoder();
  const publicKey = abicoder.encode(["string"], [keyPairJson.publicKey]);
  const mecenateID = await MecenateIdentity.identityByAddress(signer.address);

  const UserData = {
    mecenateID: mecenateID,
    wallet: signer.address,
    publicKey: publicKey,
    reputation: { trusted: 0, untrusted: 0 },
    activity: { createdPosts: [], acceptedPosts: [] },
  };

  console.log("User Data: ", UserData);

  // Create a new MecenateUsers contract instance
  const MecenateUsers = new ethers.Contract(
    contracts["MecenateUsers"].address,
    contracts["MecenateUsers"].abi,
    signer
  );

  MecenateUsers.connect(signer);

  let tx = await MecenateUsers.registerUser(UserData);

  await tx.wait();

  user = await MecenateUsers.getUserData(signer.address);

  console.log("Create User Successful!");

  await getUser(signer.address);
  await new Promise((r) => setTimeout(r, 2000));

  console.log("User fetched!");
}

async function getUser(address: string) {
  // Create a new MecenateUsers contract instance
  const MecenateUsers = new ethers.Contract(
    contracts["MecenateUsers"].address,
    contracts["MecenateUsers"].abi,
    signer
  );

  MecenateUsers.connect(signer);
  user = await MecenateUsers.getUserData(address);
  // format json
  console.log("User: ", user);
  console.log("Get User Successful!");
}

export { createUser, getUser };
