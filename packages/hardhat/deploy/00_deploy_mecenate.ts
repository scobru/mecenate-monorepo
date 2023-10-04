import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { deployPool, encodePriceSqrt } from "../scripts/03_deployPools";

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
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mockDai.receipt &&
    console.log("MockDai deployed at:", mockDai.receipt.contractAddress);

  const mockWeth = await deploy("MockWeth", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mockWeth.receipt &&
    console.log("MockWeth deployed at:", mockWeth.receipt.contractAddress);

  const muse = await deploy("MUSE", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
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
    // Contract constructor arguments
    args: ["0x6c434d2de6efa3e7169bc58843b74d74"],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  verifier.receipt &&
    console.log("Feed Factory deployed at:", verifier.receipt.contractAddress);

  const users = await deploy("MecenateUsers", {
    from: deployer,
    // Contract constructor arguments
    args: [verifier.address, treasury.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  users.receipt &&
    console.log("Users deployed at:", users.receipt.contractAddress);

  const feedFactory = await deploy("MecenateFeedFactory", {
    from: deployer,
    // Contract constructor arguments
    args: [
      users.address,
      treasury.address,
      verifier.address,
      ethers.constants.AddressZero,
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
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
  const newGasPrice = gasPrice.mul(50).div(100); // Increase by 20%
  console.log("Gas Price:", gasPrice.toString());

  const feed = await deploy("MecenateFeed", {
    from: deployer,
    args: [
      ethers.constants.HashZero,
      users.address,
      verifier.address,
      ethers.constants.AddressZero,
      feedFactory.address,
      version,
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  feed.receipt &&
    console.log("Feed deployed at:", feed.receipt.contractAddress);

  const vault = await deploy("MecenateVault", {
    from: deployer,
    // Contract constructor arguments
    args: [
      verifier.address,
      feedFactory.address,
      ethers.constants.AddressZero,
      users.address,
      relayer,
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  vault.receipt &&
    console.log("Vault deployed at:", vault.receipt.contractAddress);

  console.log("Setting Vault...");

  const mecenateBay = await deploy("MecenateBay", {
    from: deployer,
    // Contract constructor arguments
    args: [users.address, verifier.address, vault.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mecenateBay.receipt &&
    console.log(
      "Mecenate Bay deployed at:",
      mecenateBay.receipt.contractAddress,
    );

  // wall setMecenateBay of instance of vault
  console.log("Setting Mecenate Bay...");

  const vaultInstance = await ethers.getContractAt(
    "MecenateVault",
    vault.address,
  );

  const setMecenateBay = await vaultInstance.setMecenateBay(
    mecenateBay.address,
  );

  setMecenateBay.wait();
  console.log("Mecenate Bay setted at:", mecenateBay.address);

  const mecenateStats = await deploy("MecenateStats", {
    from: deployer,
    // Contract constructor arguments
    args: [
      users.address,
      feedFactory.address,
      mecenateBay.address,
      treasury.address,
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mecenateStats.receipt &&
    console.log(
      "Mecenate Stats Factory deployed at:",
      mecenateStats.receipt.contractAddress,
    );

  const mecenateForwarderFactory = await deploy("MecenateForwarderFactory", {
    from: deployer,
    // Contract constructor arguments
    args: [vault.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mecenateForwarderFactory.receipt &&
    console.log(
      "Mecenate Stats Factory deployed at:",
      mecenateForwarderFactory.receipt.contractAddress,
    );

  const setVault = await feedFactoryInstance.changeMultipleSettings(
    treasury.address,
    vault.address,
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

  const mecenateForwarder = await deploy("MecenateForwarder", {
    from: deployer,
    // Contract constructor arguments
    args: [ethers.constants.HashZero],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mecenateForwarder.receipt &&
    console.log(
      "Mecenate Stats Factory deployed at:",
      mecenateForwarder.receipt.contractAddress,
    );
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["Mecenate"];
