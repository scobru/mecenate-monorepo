import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  const [deployer]: SignerWithAddress[] = await ethers.getSigners();

  // Assumo che tu abbia già deployato questi contratti e abbia i loro indirizzi
  const feedFactoryAddress = "0x09cCD9c0a8663405703252A0a5b81b919EBf7C63"; // basegoerli
  const usersAddress = "0x35F4cB861C960E398AA8b3C0610D217668EC2fc7"; // basegoerli

  const factory = await ethers.getContractFactory("MecenateFeedFactory");
  const feedFactoryInstance = factory.attach(feedFactoryAddress);

  const feedFactoryDeployment = {
    from: deployer.address,
    args: [
      ethers.constants.AddressZero,
      usersAddress,
      feedFactoryAddress,
      2,
      0,
      1,
    ],
    log: true,
    autoMine: true,
  };

  const feed = await ethers.getContractFactory("MecenateFeed");

  const instance = await feed.deploy(
    ethers.constants.AddressZero,
    usersAddress,
    feedFactoryAddress,
    2,
    0,
    1,
  );

  // get the bytecode of the instance
  await instance.deployTransaction.wait();
  const bytecode = instance.deployTransaction.data;

  await instance.deployed();

  console.log("Feed deployed to:", instance.address);

  if (feed) {
    const setByteCode = await feedFactoryInstance.setFeedByteCode(
      bytecode,
      2,
      0,
      1,
    );

    await setByteCode.wait();

    console.log("Feed Bytecode setted");
  } else {
    console.error("Failed to deploy Feed");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
