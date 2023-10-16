import { Contract, Signer, ethers, providers } from "ethers";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";
import fs from "fs";
const deployedContractJSON = "./hardhat_contracts.json";

import { createIdentity } from "./createIdentity";
import { createKeyPair } from "./createKeyPair";

const chainID = 84531;
const deployedContract = JSON.parse(
  fs.readFileSync(deployedContractJSON, "utf8")
);

export class MecenateSDK {
  private externalProvider: providers.JsonRpcProvider | Signer;
  private contract: Contract;
  private appId: string;

  private contracts: any = {};

  constructor(
    externalProvider: providers.JsonRpcProvider | Signer,
    appId: string
  ) {
    this.externalProvider = externalProvider;
    this.contracts = deployedContract[Number(chainID)][0].contracts;
  }

  async createKeyPair() {
    return createKeyPair();
  }

  async createUser() {
    console.log("Create a user by visit https://mecenate.vercel.app/users");
  }

  async getUser(address: string) {
    // Create a new MecenateUsers contract instance
    const MecenateUsers = new ethers.Contract(
      this.contracts["MecenateUsers"].address,
      this.contracts["MecenateUsers"].abi,
      this.externalProvider
    );

    MecenateUsers.connect(this.externalProvider);

    const user = await MecenateUsers.getUserMetadata(address);
    // format json
    console.log("User: ", user);
    console.log("Get User Successful!");

    return user;
  }
}
