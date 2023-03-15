import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";
import fs from "fs";
import { Buffer } from "buffer";
const hre = require("hardhat");

const content = "Hello, world!";
const buffer = Buffer.from(content, "utf8");

const file = {
  buffer: buffer,
  name: "hello.txt",
};

const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";
const randomAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
const privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
const message = "Hello, world!";
const EthCrypto = require("eth-crypto");
const IPFS = require("ipfs");

async function signMessage(address: string, privateKey: string, message: string) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  console.log("OK: ", deployer);

  // Sign the message with the wallet
  const signature = await deployer.signMessage(message);
  console.log("OK: ", signature);
  // Verify the signature matches the provided address
  const signer = ethers.utils.verifyMessage(message, signature);
  console.log("OK: ", signer);

  if (signer.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Invalid signature - address does not match");
  }

  return signature;
}

async function uploadFileToIPFS(file: any, signature: string, address: string) {
  const ipfs = IPFS.create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

  // Read file contents as array buffer
  const content = file.buffer;

  // Encrypt the content using the signature and a random address
  const encryptionKey = EthCrypto.keccak256(signature);
  const encryptedContent = await EthCrypto.encryptWithPublicKey(randomAddress, encryptionKey, content);

  // Upload the encrypted content to IPFS
  const ipfsHash = await ipfs.add(encryptedContent);

  // Create a metadata object with the IPFS hash, original file name, signature, and address
  const metadata = {
    ipfsHash,
    fileName: file.name,
    signature,
    address,
  };

  return metadata;
}

// Example usage

const main: any = async function (hre: HardhatRuntimeEnvironment) {
  const signature = await signMessage(address, privateKey, message);
  const metadata = await uploadFileToIPFS(file, signature, address);
  console.log(metadata);
};

export default main;
