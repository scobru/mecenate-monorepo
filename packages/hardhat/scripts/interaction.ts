import { parseEther, formatEther } from "ethers/lib/utils";
import { Feed } from "../typechain-types";
import "./numerai-helper";
import { retrievePost, savePost, submitData } from "./numerai-helper";

async function main() {
  const hre = require("hardhat");
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const feed = await deploy("Feed", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log(feed.address);

  // Create two fake address account and mint 100 ETH to each of them
  const accounts = await hre.ethers.getSigners();
  const account1 = accounts[1];
  const account2 = accounts[2];
  const stakeAmount = parseEther("1000");
  const paymentAmount = parseEther("100");
  const feedContract: Feed = await hre.ethers.getContractAt("Feed", feed.address, account1);
  const numPost = await feedContract.numPosts();
  const id = Number(numPost) + 1;
  const duration = 3600;
  const punishment = parseEther("500");
  const result = false;

  console.log("Post ID: ", id);

  // account1 connect to feed

  const balance0 = await hre.ethers.provider.getBalance(feed.address);

  console.log("Contract balance start: ", formatEther(balance0.toString()));

  const balance01 = await hre.ethers.provider.getBalance(account1.address);
  const balance02 = await hre.ethers.provider.getBalance(account2.address);

  console.log("Account 1 balance: ", formatEther(balance01.toString()));
  console.log("Account 2 balance: ", formatEther(balance02.toString()));
  console.log("Creating seller data... (this may take a while)");

  console.log("--------------------------------------------------");
  console.log("FORMAT DATA");
  console.log("--------------------------------------------------");

  const RawData = "***M E S S A G E  -  E N C R Y P T E D***";
  const sellerData: any = await savePost(RawData, account1.address);

  // console.log("Seller data: ", sellerData);

  console.log("------------------------------------");
  console.log("PROPOSE");
  console.log("-------------------------------------");
  await new Promise(resolve => setTimeout(resolve, 5000));

  let tx = await feedContract.submitPost(sellerData.proofhash, duration, {
    value: stakeAmount,
    from: account1.address,
  });

  let post = await feedContract.posts(id);

  post = await feedContract.posts(id);
  console.log(post.status);

  const feedContract2: Feed = await hre.ethers.getContractAt("Feed", feed.address, account2);

  console.log("---------------------------------");
  console.log("ACCEPT");
  console.log("---------------------------------");

  await feedContract2.acceptPost(post.id, { value: paymentAmount });
  console.log("Accepting post... (this may take a while)");

  post = await feedContract.posts(id);
  console.log("Status:", post.status);

  const balance = await hre.ethers.provider.getBalance(feed.address);
  console.log("Contract balance: ", formatEther(balance.toString()));

  const balance1 = await hre.ethers.provider.getBalance(account1.address);
  const balance2 = await hre.ethers.provider.getBalance(account2.address);

  console.log("Account 1 balance: ", formatEther(balance1.toString()));
  console.log("Account 2 balance: ", formatEther(balance2.toString()));

  console.log("-------------------------------------");
  console.log("SUBMIT");
  console.log("------------------------------------");

  const buyerData: any = await submitData(
    sellerData.symmetricKey,
    sellerData.proofhash,
    account1.address,
    account2.address,
  );

  // console.log("Buyer data: ", buyerData);
  console.log("Submitting buyer data... (this may take a while)");

  await feedContract.submitHash(post.id, buyerData.proofHash58, { from: account1.address });

  await new Promise(resolve => setTimeout(resolve, 5000));

  post = await feedContract.posts(id);
  console.log("Status:", post.status);

  console.log("-----------------------------------");
  console.log("REVEAL");
  console.log("-----------------------------------");

  await feedContract2.revealData(post.id);

  // console.log("Buyer Data:", buyerData);

  const decodeData: any = await retrievePost(
    buyerData.proofJson.proofhash,
    buyerData.proofJson.encryptedSymKey,
    account1.address,
  );
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("Decoded Data:", decodeData);
  await feedContract.connect(account2);

  post = await feedContract.posts(id);
  console.log("Status:", post.status);

  console.log("------------------------------");
  console.log("FINALIZE");
  console.log("------------------------------");
  // account2 finalize the post
  await feedContract2.finalizePost(post.id, result, punishment);

  post = await feedContract.posts(id);
  console.log(post.status);
  console.log(Number(post.punishment / 1e18));
  console.log(Number(post.buyerPunishment / 1e18));

  // get ETH balance of contract
  const Abalance = await hre.ethers.provider.getBalance(feed.address);
  console.log("Contract balance: ", formatEther(Abalance.toString()));
  // get Account 1 and 2 balance
  const Abalance1 = await hre.ethers.provider.getBalance(account1.address);
  const Abalance2 = await hre.ethers.provider.getBalance(account2.address);
  console.log("Account 1 balance: ", formatEther(Abalance1.toString()));
  console.log("Account 2 balance: ", formatEther(Abalance2.toString()));

  console.log(Number(Abalance1 - balance01) / 1e18);
  console.log(Number(Abalance2 - balance02) / 1e18);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
