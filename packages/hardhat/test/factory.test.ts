import { ethers } from "hardhat";
import { MecenateSubscriptionFactory } from "../typechain-types/contracts/MecenateSubscriptionFactory";
import { Mecenate } from "../typechain-types/contracts/Mecenate";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { format } from "prettier";

describe("MecenateSubscriptionFactory", function () {
  let factory: MecenateSubscriptionFactory;
  let mecenate: Mecenate;
  let signers: SignerWithAddress[];
  let owner: string;
  let creator: string;

  beforeEach(async function () {
    signers = await ethers.getSigners();
    owner = signers[0].address;
    creator = signers[1].address;

    const MecenateSubscriptionFactory = await ethers.getContractFactory("MecenateSubscriptionFactory");
    factory = await MecenateSubscriptionFactory.deploy(100);
    await factory.deployed();
  });

  it("should create a new Mecenate subscription", async function () {
    const name = "Test Mecenate";
    const monthlyFees = [100, 200, 500];

    const tx = await factory.createMecenateSubscription(creator, name, monthlyFees, { value: 100 });
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }

    const events = receipt.events.filter(event => event.event === "MecenateSubscriptionCreated");
    if (events.length === 0) {
      throw new Error("No MecenateSubscriptionCreated event emitted");
    }

    const mecenateAddress = events[0].args[0];

    mecenate = (await ethers.getContractAt("Mecenate", mecenateAddress)) as Mecenate;

    expect(await mecenate.name()).to.equal(name);
    expect(await mecenate.getMonthlyFee(1)).to.equal(100);
    expect(await mecenate.getMonthlyFee(2)).to.equal(200);
    expect(await mecenate.getMonthlyFee(3)).to.equal(500);

    const balanceBefore = await ethers.provider.getBalance(factory.address);
    expect(balanceBefore).to.be.above(0);
    console.log("balanceBefore", balanceBefore.toString());
  });
  it("should withdraw funds", async function () {
    // send 1 ETH to the factory
    await signers[0].sendTransaction({
      to: factory.address,
      value: ethers.utils.parseEther("100"),
    });
    const balanceBefore = await ethers.provider.getBalance(factory.address);
    console.log("balanceBefore", balanceBefore.toString());
    expect(balanceBefore).to.be.above(0);
    await factory.connect(signers[0]).withdrawFunds();
    const balanceAfter = await ethers.provider.getBalance(factory.address);
    console.log("balanceAfter", balanceAfter.toString());
    expect(balanceAfter.toNumber()).to.equal(0);
  });
  it("should set a new creation fee", async function () {
    const newFee = 200;
    await factory.setCreationFee(newFee);
    expect(await factory.creationFee()).to.equal(newFee);
  });
});
