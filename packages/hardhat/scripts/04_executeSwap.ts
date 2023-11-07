import { Token } from "@uniswap/sdk-core";
import { Pool, Route } from "@uniswap/v3-sdk";
import hre from "hardhat";
import { BigNumber, ethers, Contract } from "ethers";

const { log } = console;

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  QuoterV2: require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json"),
  Dai: require("./ERC20ABI.json"),
  Weth: require("./ERC20ABI.json"),
  Muse: require("./ERC20ABI.json"),
};

const DAI_ADDRESS = "0xCFA79Ce44e410a05c6C271bb2F95084Db6D52b33";
const MUSE_ADDRESS = "0x100d7c197a9EF83258C888cb0Fb2d8e0Be2A0584";
const WETH_ADDRESS = "0xa3a0460606Bb07A44Ff47fB90f2532F99de99534";

const SWAP_ROUTER_ADDRESS = "0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d"; // Inserisci l'indirizzo del SwapRouter
const QUOTERV2 = "0xedf539058e28E5937dAef3f69cEd0b25fbE66Ae9";

const MUSE_WETH_POOL_500 = "0xE919AaE29798042af656853F01D1e051fc5EF53d";
const DAI_WETH_POOL_500 = "0xf7C12b19B607f35f8325e330C1Afb35efAF07cDB";

async function main() {
  // Importa ABI
  const ERC20ABI = require("./ERC20ABI.json");
  const SwapRouterABI =
    require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;

  // Indirizzi dei token e del router

  const UniswapV3PoolABI =
    require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json").abi;

  const [owner] = await hre.ethers.getSigners();

  log(`Executing swap as ${owner.address}`);
  log("SwapRouter address:", SWAP_ROUTER_ADDRESS);

  const poolContract = new Contract(DAI_WETH_POOL_500, UniswapV3PoolABI, owner);

  const poolData = await getPoolData(poolContract);

  const daiCtx = new Contract(DAI_ADDRESS, artifacts.Dai.abi, owner);
  const wethCtx = new Contract(WETH_ADDRESS, artifacts.Weth.abi, owner);

  const DaiToken = new Token(84531, DAI_ADDRESS, 18, "mDAI", "mDAI");
  const WethToken = new Token(84531, WETH_ADDRESS, 18, "mWETH", "mWETH");

  const pool = new Pool(
    WethToken,
    DaiToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick,
  );

  log("Pool:", pool);

  // Inizializza il contratto SwapRouter
  const swapRouter = new ethers.Contract(
    String(SWAP_ROUTER_ADDRESS),
    SwapRouterABI,
    owner,
  );

  // get blocktimestamp
  const block = await hre.ethers.provider.getBlock("latest");

  const balance = await wethCtx.balanceOf(owner.address);

  log(`mWETH Balance: ${ethers.utils.formatEther(balance)}`);

  const approveTxDai = await wethCtx.approve(
    SWAP_ROUTER_ADDRESS,
    ethers.utils.parseEther("100000"),
  );

  await approveTxDai.wait();

  log(`Approved mDAI transfer to ${SWAP_ROUTER_ADDRESS}.`);

  const balanceDai = await daiCtx.balanceOf(owner.address);

  log(`mDAI Balance: ${ethers.utils.formatEther(balanceDai)}`);

  // Use ExactInputSingleParams to swap 0.001 WETH for DAI
  const deadline = block.timestamp + 1000 * 20;
  const exactInputSingleParams = {
    tokenIn: WETH_ADDRESS,
    tokenOut: DAI_ADDRESS,
    fee: pool.fee,
    recipient: owner.address,
    deadline: deadline,
    amountIn: ethers.utils.parseEther("0.001"),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  log("Swap params:", exactInputSingleParams);

  // Perform the swap
  const tx = await swapRouter.exactInputSingle(exactInputSingleParams);

  // use exactInput instead of exactInputSingle

  /* 
  const path = ethers.utils.defaultAbiCoder.encode(
    ["address", "address"],
    [WETH_ADDRESS, DAI_ADDRESS],
  );

  const exactInputParams = {
    path: path,
    recipient: owner.address,
    deadline: deadline,
    amountIn: ethers.utils.parseEther("0.001"),
    amountOutMinimum: 1,
  };

  const tx = await swapRouter.exactInput(exactInputParams, {
    gasLimit: 10000000,
  }); 
  */

  const receipt = await tx.wait();
  log(`Swap completed. Transaction Hash: ${receipt.transactionHash}`);
}

async function getPoolData(poolContract: Contract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing,
    fee,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
