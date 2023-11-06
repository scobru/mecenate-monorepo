import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, run } from "hardhat";

const eas = "0x4200000000000000000000000000000000000021";

async function main() {
  const signers = await ethers.getSigners();
  const contractFactory = await ethers.getContractFactory(
    "MecenateAttesterResolver",
  );

  const mecenateAttester = await contractFactory.deploy(eas);

  await mecenateAttester.deployed();

  console.log("mecenateAttester deployed to:", mecenateAttester.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
