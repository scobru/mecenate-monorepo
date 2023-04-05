import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther } from "ethers/lib/utils";
/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
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

  console.log(deployer);

  const treasury = await deploy("MecenateTreasury", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  treasury.receipt &&
    console.log("Identity deployed at:", treasury.receipt.contractAddress);

  const identity = await deploy("MecenateIdentity", {
    from: deployer,
    args: [treasury.address],
    log: true,
    autoMine: true,
  });

  identity.receipt &&
    console.log("Identity deployed at:", identity.receipt.contractAddress);

  const factoryTier = await deploy("MecenateTierFactory", {
    from: deployer,
    // Contract constructor arguments
    args: [identity.address, treasury.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  factoryTier.receipt &&
    console.log("Factory deployed at:", factoryTier.receipt.contractAddress);

  const tier = await deploy("MecenateTier", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer, "Test", "Test Tier", parseEther("0.001"), 3600],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  tier.receipt &&
    console.log("Mecenate TIer deployed at:", tier.receipt.contractAddress);

  const users = await deploy("MecenateUsers", {
    from: deployer,
    // Contract constructor arguments
    args: [identity.address],
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
    args: [users.address, identity.address, treasury.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  feedFactory.receipt &&
    console.log(
      "Feed Factory deployed at:",
      feedFactory.receipt.contractAddress
    );

  const feed = await deploy("MecenateFeed", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer, users.address, identity.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  feed.receipt &&
    console.log("Feed deployed at:", feed.receipt.contractAddress);

  const mecenateBay = await deploy("MecenateBay", {
    from: deployer,
    // Contract constructor arguments
    args: [identity.address, users.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  mecenateBay.receipt &&
    console.log(
      "Mecenate Bay deployed at:",
      mecenateBay.receipt.contractAddress
    );

  const box = await deploy("MecenateBox", {
    from: deployer,
    // Contract constructor arguments
    args: [identity.address, treasury.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  box.receipt && console.log("Box deployed at:", box.receipt.contractAddress);

  const dcaFactory = await deploy("MecenateDCAFactory", {
    from: deployer,
    // Contract constructor arguments
    args: [identity.address, treasury.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  dcaFactory.receipt &&
    console.log("DCA Factory deployed at:", dcaFactory.receipt.contractAddress);

  const questionFactory = await deploy("MecenateQuestionFactory", {
    from: deployer,
    // Contract constructor arguments
    args: [identity.address, treasury.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  questionFactory.receipt &&
    console.log(
      "Question Factory deployed at:",
      questionFactory.receipt.contractAddress
    );

  const question = await deploy("MecenateQuestion", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer, deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  question.receipt &&
    console.log(
      "Question Factory deployed at:",
      question.receipt.contractAddress
    );

  const mecenateStats = await deploy("MecenateStats", {
    from: deployer,
    // Contract constructor arguments
    args: [
      users.address,
      factoryTier.address,
      feedFactory.address,
      questionFactory.address,
      dcaFactory.address,
      mecenateBay.address,
      box.address,
      identity.address,
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
      mecenateStats.receipt.contractAddress
    );
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["Mecenate"];
