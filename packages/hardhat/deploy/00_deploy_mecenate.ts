import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, run, upgrades } from "hardhat";

import {
  MecenateFeedFactory__factory,
  MecenateFeedFactory,
  MecenateFeed__factory,
  MecenateFeed,
} from "../typechain-types";

// Goerli Base
const router = "0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d";
const eas = "0x4200000000000000000000000000000000000021";
const schema =
  "0x826a8867a8fa45929593ef87a5b94e5800de3f2e3f7fbc93a995069777076e6a";

const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();
  const signers = await ethers.getSigners();

  const { deploy } = hre.deployments;

  const externalProxyCall = await deploy("ExternalProxyCall", {
    from: deployer,

    args: [],
    log: true,

    autoMine: true,
  });

  externalProxyCall.receipt &&
    console.log(
      "externalProxyCall deployed at:",
      externalProxyCall.receipt.contractAddress,
    );

  const mockDai = await deploy("MockDai", {
    from: deployer,

    args: [],
    log: true,

    autoMine: true,
  });

  mockDai.receipt &&
    console.log("MockDai deployed at:", mockDai.receipt.contractAddress);

  const mockWeth = await deploy("MockWeth", {
    from: deployer,

    args: [],
    log: true,

    autoMine: true,
  });

  mockWeth.receipt &&
    console.log("mockWeth deployed at:", mockWeth.receipt.contractAddress);

  const muse = await deploy("MUSE", {
    from: deployer,

    args: [],
    log: true,

    autoMine: true,
  });

  muse.receipt &&
    console.log("MUSE deployed at:", muse.receipt.contractAddress);

  const treasury = await deploy("MecenateTreasury", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  treasury.receipt &&
    console.log("Treasury deployed at:", treasury.receipt.contractAddress);

  const verifier = await deploy("MecenateVerifier", {
    from: deployer,
    args: ["0x6c434d2de6efa3e7169bc58843b74d74"],
    log: true,
    autoMine: true,
  });

  verifier.receipt &&
    console.log("Verifier deployed at:", verifier.receipt.contractAddress);

  const users = await deploy("MecenateUsers", {
    from: deployer,
    args: [verifier.address],
    log: true,
    autoMine: true,
  });

  users.receipt &&
    console.log("Users deployed at:", users.receipt.contractAddress);

  // Deploy Factory
  /* 
  console.log("Deploying Factory...");

  const factory = (await upgrades.deployProxy(
    await ethers.getContractFactory("MecenateFeedFactory"),
    [
      externalProxyCall.address,
      users.address,
      treasury.address,
      eas,
      schema,
      mockWeth.address,
      muse.address,
      mockDai.address,
      router,
    ],
    {
      initializer: "initialize",
      kind: "transparent",
    },
  )) as MecenateFeedFactory;

  await factory.deployed();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    factory.address,
  );

  await new Promise((r) => setTimeout(r, 10000));

  console.log("MecenateFeedFactory:", factory?.address);

  console.log("MecenateFeedFactory Implementation:", implementationAddress);

  // Deploy Feed
  console.log("Deploying Feed...");

  const feed = await new MecenateFeed__factory(signers[0]).deploy();

  await feed.deployed();

  await new Promise((r) => setTimeout(r, 5000));

  console.log("MecenateFeed:", feed.address);

  console.log("Update Factory Implementation");

  await factory.adminUpdateImplementation(feed.address, 2, 0, 0, {
    gasLimit: 1000000,
  });
  */
  const mecenateBay = await deploy("MecenateBay", {
    from: deployer,
    args: [users.address],
    log: true,
    autoMine: true,
  });

  mecenateBay.receipt &&
    console.log(
      "Mecenate Bay deployed at:",
      mecenateBay.receipt.contractAddress,
    );

  console.log("Setting Mecenate Bay...");

  /*  const mecenateStats = await deploy("MecenateStats", {
    from: deployer,

    args: [
      users.address,
      factory.address,
      mecenateBay.address,
      treasury.address,
    ],
    log: true,

    autoMine: true,
  });

  mecenateStats.receipt &&
    console.log(
      "Mecenate Stats Factory deployed at:",
      mecenateStats.receipt.contractAddress,
    );
 */
  const mecenatePay = await deploy("MecenatePay", {
    from: deployer,

    args: [users.address, treasury.address],
    log: true,

    autoMine: true,
  });

  mecenatePay.receipt &&
    console.log(
      "Mecenate Pay  deployed at:",
      mecenatePay.receipt.contractAddress,
    );
};

export default deployYourContract;

deployYourContract.tags = ["Mecenate"];
