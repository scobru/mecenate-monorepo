import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  MecenateFeedFactory__factory,
  MecenateFeedFactory,
  MecenateFeed__factory,
  MecenateFeed,
} from "../typechain-types";


async function main() {
  const [deployer]: SignerWithAddress[] = await ethers.getSigners();

  // Assumo che tu abbia già deployato questi contratti e abbia i loro indirizzi
  const feedFactoryAddress = "0xC0f97ff0FF42769e1EF40CD790661c3a8A7de84b"; // basegoerli

  const factory = await ethers.getContractFactory("MecenateFeedFactory");

  const feedFactoryInstance = factory.attach(feedFactoryAddress);

  const feed = await new MecenateFeed__factory(deployer).deploy();

  await feed.deployed();

  await new Promise((r) => setTimeout(r, 5000));

  console.log("MecenateFeed:", feed.address);

  console.log("Update Factory Implementation");

  await feedFactoryInstance.adminUpdateImplementation(feed.address, 2, 0, 1, {
    gasLimit: 1000000,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
