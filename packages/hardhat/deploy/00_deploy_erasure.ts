import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, ipfs } from "hardhat";
import { utils } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { Feed__factory, SimpleGriefing__factory } from "../typechain-types";
const bs58 = require("bs58");

const { multihash } = require("@erasure/crypto-ipfs");
const RATIO_TYPES = {
  NaN: 0,
  Inf: 1,
  Dec: 2,
};

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [deployer, operator, staker, counterparty] = await ethers.getSigners();

  // deploy MockNMR
  const MockNMR = await ethers.getContractFactory("MockNMR");
  const nmr = await MockNMR.deploy();
  await nmr.deployed();

  await nmr.mintMockTokens(deployer.address, parseEther("1000"));
  await nmr.mintMockTokens(operator.address, parseEther("1000"));
  await nmr.mintMockTokens(staker.address, parseEther("1000"));
  await nmr.mintMockTokens(counterparty.address, parseEther("1000"));

  // Deploy RegistryManager
  // ------------------------------------------------------------//

  const RegistryManager = await ethers.getContractFactory("RegistryManager");
  const registymanager = await RegistryManager.deploy();
  await registymanager.deployed();
  console.log("register manager deployed", registymanager.address);

  // Deploy regitries
  // ------------------------------------------------------------//
  const { deploy } = hre.deployments;

  const erasure_post = await deploy("Erasure_Posts", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("Erasure Posts", erasure_post.address);

  const erasure_users = await deploy("Erasure_Users", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("Erasure Users", erasure_users.address);

  const erasure_agreements = await deploy("Erasure_Agreements", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("Erasure Agreements deployed", erasure_agreements.address);

  const erasure_escrows = await deploy("Erasure_Escrows", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("Erasure Escrow deployed", erasure_agreements.address);

  // Transfer ownership of registries to registry manager
  // ------------------------------------------------------------//

  // Connect to erasure post
  const erasurePostInstance = await ethers.getContractAt("Erasure_Posts", erasure_post.address);
  const erasureAgreementsInstance = await ethers.getContractAt("Erasure_Agreements", erasure_agreements.address);
  const erasureEscrowsInstance = await ethers.getContractAt("Erasure_Escrows", erasure_escrows.address);

  await erasurePostInstance.transferOwnership(registymanager.address);
  await erasureAgreementsInstance.transferOwnership(registymanager.address);
  await erasureEscrowsInstance.transferOwnership(registymanager.address);

  console.log("Erasure Posts ownership transferred to register manager");

  // Deploy Factories
  // ------------------------------------------------------------//

  const feed = await deploy("Feed", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("feed template deployed", feed.address);

  const feed_factory = await deploy("Feed_Factory", {
    from: deployer.address,
    args: [erasure_post.address, feed.address],
    log: true,
    autoMine: true,
  });
  console.log("feed factory deployed", feed_factory.address);

  const simpleGriefing = await deploy("SimpleGriefing", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("SimpleGriefing template deployed", simpleGriefing.address);

  const simpleGriefing_factory = await deploy("SimpleGriefing_Factory", {
    from: deployer.address,
    args: [erasure_agreements.address, simpleGriefing.address],
    log: true,
    autoMine: true,
  });
  console.log("SimpleGriefing factory deployed", simpleGriefing_factory.address);

  const countdownGriefing = await deploy("CountdownGriefing", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("CountdownGriefing template deployed", countdownGriefing.address);

  const countdownGriefing_factory = await deploy("CountdownGriefing_Factory", {
    from: deployer.address,
    args: [erasure_agreements.address, countdownGriefing.address],
    log: true,
    autoMine: true,
  });
  console.log("CountdownGriefing factory deployed", countdownGriefing_factory.address);

  const countdownGriefingescrow = await deploy("CountdownGriefingEscrow", {
    from: deployer.address,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("CountdownGriefingEscrow template deployed", countdownGriefingescrow.address);

  const countdownGriefingEscrow_factory = await deploy("CountdownGriefingEscrow_Factory", {
    from: deployer.address,
    args: [erasure_escrows.address, countdownGriefingescrow.address],
    log: true,
    autoMine: true,
  });
  console.log("CountdownGriefingEscrow factory deployed", countdownGriefingEscrow_factory.address);

  // Add factories to registry manager
  // ------------------------------------------------------------//

  await registymanager.addFactory(erasure_post.address, feed_factory.address, "0x");
  await registymanager.addFactory(erasure_agreements.address, simpleGriefing_factory.address, "0x");
  await registymanager.addFactory(erasure_agreements.address, countdownGriefing_factory.address, "0x");
  await registymanager.addFactory(erasure_escrows.address, countdownGriefingEscrow_factory.address, "0x");
  console.log("feed factory added to register manager");

  // Create Feed
  // ------------------------------------------------------------//

  /* const message = "hi there!";
  console.log("IPFS node is ready");

  const content = Buffer.from(message);
  const results = await ipfs.client.add(content);

  const hash = results[0].hash;
  const proofHash = "0x" + bs58.decode(hash).slice(2).toString("hex");
  console.log(proofHash);

  const mockData = {
    userAddress: operator.address,
    proofhash: await multihash({
      input: "proof",
      inputType: "raw",
      outputType: "digest",
    }),
    metadata: ethers.utils.toUtf8Bytes(
      JSON.stringify({
        metadata_version: "v1.0.0",
        application: "deployment-test",
        app_version: "v0.0.1",
        app_storage: { this_is: "an example metadata for the app" },
        ipld_cid: await multihash({
          input: "metadata",
          inputType: "raw",
          outputType: "hex",
        }),
      }),
    ),
  };

  let args = [operator.address, mockData.proofhash, mockData.metadata];
  let callData = abiEncodeWithSelector("initialize", ["address", "bytes32", "bytes"], args);

  console.log("Deploy Feed Instance");

  // Connect feed_factory to deployer
  const feed_instance = await feed_factory.create(callData);

  // Catch Factory event "InstanceCreated(address instance, address creator)"
  let receipt = await feed_instance.wait();
  let event = receipt.events?.find((e: { event: string }) => e.event === "InstanceCreated");
  const feed_address = event?.args?.instance;

  // Connect feed to operator
  const feed_instance_operator = Feed__factory.connect(feed_address, operator);

  // Submit hash
  let tx = await feed_instance_operator.submitHash(mockData.proofhash);
  receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  // const proofHash = mockData.proofhash;

  if (receipt.logs !== undefined) {
    const log = receipt.logs[0];
    const receivedHash = feed.interface.parseLog(log).args[0];
    if (proofHash !== receivedHash) {
      console.error(proofHash, receivedHash, "are different");
    }
  } else {
    console.error("no logs");
  }

  // Create Simple Griefing Agreement
  args = [operator.address, staker.address, counterparty.address, parseEther("2"), RATIO_TYPES.Dec, mockData.metadata];
  callData = abiEncodeWithSelector("initialize", ["address", "address", "address", "uint256", "uint8", "bytes"], args);
  const simple_griefing_instance = await simpleGriefing_factory.create(callData);

  // Catch Factory event "InstanceCreated(address instance, address creator)"
  receipt = await simple_griefing_instance.wait();
  const event2 = receipt.events?.find((e: { event: string }) => e.event === "InstanceCreated");
  const simple_griefing_instance_address = event2?.args?.instance;

  // Connect feed to operator
  const simple_griefing_operator = SimpleGriefing__factory.connect(simple_griefing_instance_address, staker);
  console.log("agreement deployed");

  // Approve NMR
  await nmr.connect(staker).approve(operator.address, parseEther("1000"));
  console.log("NMR approved");
  await nmr.connect(staker).approve(simple_griefing_operator.address, parseEther("1000"));
  console.log("NMR approved for SimpleGriefing Instance Address");
  await simple_griefing_operator.setTokenAddress(nmr.address);
  await simple_griefing_operator.increaseStake(parseEther("1"));
  console.log("Increase stake called");
  receipt = await ethers.provider.getTransactionReceipt(tx.hash);

  if (receipt.logs !== undefined) {
    const log = receipt.logs[0];
    console.log(log);
  } else {
    console.error("no logs");
  } */
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["Erasure"];

function createSelector(functionName: string, abiTypes: string[]): string {
  const joinedTypes = abiTypes.join(",");
  const functionSignature = `${functionName}(${joinedTypes})`;
  const selector = utils.hexDataSlice(utils.keccak256(utils.toUtf8Bytes(functionSignature)), 0, 4);
  return selector;
}

function abiEncodeWithSelector(
  functionName: string,
  abiTypes: readonly (string | utils.ParamType)[],
  abiValues: readonly any[],
) {
  const abiEncoder = new ethers.utils.AbiCoder();
  const initData = abiEncoder.encode(abiTypes, abiValues);
  const selector = createSelector(functionName, abiTypes);
  const encoded = selector + initData.slice(2);
  return encoded;
}
