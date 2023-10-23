import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { deployPool, encodePriceSqrt } from "../scripts/01_deployPools";

// Goerli Base
const router = "0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d";
const eas = "0x4200000000000000000000000000000000000021";
const schema =
  "0xa685677ba3ea1c2df3ed44de688bf5147c36f910b54ec32f08e1e0de4914a113";

// Version
const version = "v2.0.0";

const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();

  const { deploy } = hre.deployments;

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
    console.log("Feed Factory deployed at:", verifier.receipt.contractAddress);

  const users = await deploy("MecenateUsers", {
    from: deployer,
    args: [verifier.address],
    log: true,
    autoMine: true,
  });

  users.receipt &&
    console.log("Users deployed at:", users.receipt.contractAddress);

  const feedFactory = await deploy("MecenateFeedFactory", {
    from: deployer,

    args: [],
    log: true,

    autoMine: true,
  });

  const feedFactoryInstance = await ethers.getContractAt(
    "MecenateFeedFactory",
    feedFactory.address,
  );

  feedFactory.receipt &&
    console.log(
      "Feed Factory deployed at:",
      feedFactory.receipt.contractAddress,
    );

  const gasPrice = await ethers.provider.getGasPrice();

  const feed = await deploy("MecenateFeed", {
    from: deployer,
    args: [
      ethers.constants.AddressZero,
      users.address,
      feedFactory.address,
      2,
      0,
      0,
    ],
    log: true,

    autoMine: true,
  });

  feed.receipt &&
    console.log("Feed deployed at:", feed.receipt.contractAddress);

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

  const mecenateStats = await deploy("MecenateStats", {
    from: deployer,

    args: [
      users.address,
      feedFactory.address,
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

  await feedFactoryInstance.changeMultipleSettings(
    treasury.address,
    users.address,
    eas,
    schema,
    mockWeth.address,
    muse.address,
    mockDai.address,
    router,
  );

  const setByteCode = await feedFactoryInstance.setFeedByteCode(
    feed.bytecode,
    2,
    0,
    0,
  );

  setByteCode.wait();

  console.log("Feed Bytecode setted");
};

export default deployYourContract;

deployYourContract.tags = ["Mecenate"];
