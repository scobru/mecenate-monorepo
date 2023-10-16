import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { deployPool, encodePriceSqrt } from "../scripts/01_deployPools";

const relayer = "0x3db5E84e0eBBEa945a0a82E879DcB7E1D1a587B4";
const router = "0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d";
const version = "v2";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const from = deployer;

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

    args: [verifier.address, treasury.address],
    log: true,

    autoMine: true,
  });

  users.receipt &&
    console.log("Users deployed at:", users.receipt.contractAddress);

  const feedFactory = await deploy("MecenateFeedFactory", {
    from: deployer,

    args: [users.address, treasury.address, verifier.address],
    log: true,

    autoMine: true,
  });

  // feed Factory instance
  const feedFactoryInstance = await ethers.getContractAt(
    "MecenateFeedFactory",
    feedFactory.address,
  );

  const changeVersion = await feedFactoryInstance.changeVersion(version);

  changeVersion.wait();

  console.log("Version changed to v2");

  feedFactory.receipt &&
    console.log(
      "Feed Factory deployed at:",
      feedFactory.receipt.contractAddress,
    );

  const gasPrice = await ethers.provider.getGasPrice();
  console.log("Gas Price:", gasPrice.toString());

  const feed = await deploy("MecenateFeed", {
    from: deployer,
    args: [
      ethers.constants.HashZero,
      users.address,
      verifier.address,
      feedFactory.address,
      version,
    ],
    log: true,

    autoMine: true,
  });

  feed.receipt &&
    console.log("Feed deployed at:", feed.receipt.contractAddress);

  const vault = await deploy("MecenateVault", {
    from: deployer,

    args: [verifier.address],
    log: true,

    autoMine: true,
  });

  vault.receipt &&
    console.log("Vault deployed at:", vault.receipt.contractAddress);

  const mecenateBay = await deploy("MecenateBay", {
    from: deployer,

    args: [users.address, verifier.address],
    log: true,

    autoMine: true,
  });

  mecenateBay.receipt &&
    console.log(
      "Mecenate Bay deployed at:",
      mecenateBay.receipt.contractAddress,
    );

  // wall setMecenateBay of instance of vault
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

  const setVault = await feedFactoryInstance.changeMultipleSettings(
    treasury.address,
    users.address,
    mockWeth.address,
    muse.address,
    mockDai.address,
    router,
  );
  console.log("Vault setted at:", vault.address);

  setVault.wait();

  const setByteCode = await feedFactoryInstance.setFeedByteCode(feed.bytecode);

  setByteCode.wait();

  console.log("Feed Bytecode setted");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["Mecenate"];
