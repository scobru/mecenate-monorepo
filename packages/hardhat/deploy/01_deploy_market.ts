import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, run, upgrades } from "hardhat";

const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();
  const signers = await ethers.getSigners();

  const { deploy } = hre.deployments;

  const mecenateMarket = await deploy("MecenateMarket", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  mecenateMarket.receipt &&
    console.log(
      "Mecenate Market  deployed at:",
      mecenateMarket.receipt.contractAddress,
    );
};

export default deployYourContract;

deployYourContract.tags = ["MecenateMarket"];
