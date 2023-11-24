import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, run, upgrades } from "hardhat";

const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();
  const signers = await ethers.getSigners();

  const usersAddress = "0x92792054d2Fb584397A27aA71CE4A6b246b713Cc"
  const treasuryAddress = "0x6C4a827d1E9b4E836f98BB2601Ef5e32ceda0448"

  const { deploy } = hre.deployments;

  const mecenateSend = await deploy("MecenateSend", {
    from: deployer,

    args: [usersAddress, treasuryAddress],
    log: true,

    autoMine: true,
  });

  mecenateSend.receipt &&
    console.log(
      "Mecenate Sends  deployed at:",
      mecenateSend.receipt.contractAddress,
    );
};

export default deployYourContract;

deployYourContract.tags = ["MecenateSend"];
