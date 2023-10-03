import { Token, BigintIsh } from "@uniswap/sdk-core";
import { TickMath, Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import { parse } from "dotenv";
import { BigNumber, ethers, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import hre from "hardhat";
const bn = require("bignumber.js");

// Uniswap contract addresses
const DAI_ADDRESS = "0xd2c9a6323EBAab2939228B8bcE11d338599472D3";
const MUSE_ADDRESS = "0x2DE564D6090A66dd1F6818BDFC7C7f25C1aeCc78";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const POSITION_MANAGER_ADDRESS = "0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30";
const MUSE_WETH_POOL = "0x2fc184fCCEf27093B618bd722aDfc35dFD68cE08";
const DAI_WETH_POOL = "0x1d0BF192A5624f8f71f3FcbfE14239995121F644";

// Import ABIs
const NonfungiblePositionManagerABI =
  require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json").abi;
const ERC20ABI = require("./ERC20ABI.json");
const UniswapV3PoolABI =
  require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json").abi;

const provider = hre.ethers.provider;

export function encodePriceSqrt(reserve1: number, reserve0: number): BigNumber {
  const sqrtPrice = new bn(reserve1.toString())
    .div(reserve0.toString())
    .sqrt()
    .multipliedBy(new bn(2).pow(96))
    .integerValue(3);

  return BigNumber.from(sqrtPrice.toFixed());
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

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Dai: require("./ERC20ABI.json"),
  Weth: require("./ERC20ABI.json"),
  Muse: require("./ERC20ABI.json"),
};

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const DaiToken = new Token(84531, DAI_ADDRESS, 18, "DAI", "Dai");
  const WethToken = new Token(
    84531,
    WETH_ADDRESS,
    18,
    "WETH",
    "Wrapped Ethereum",
  );
  const MuseToken = new Token(84531, MUSE_ADDRESS, 18, "MUSE", "Muse");

  const daiCtx = new Contract(DAI_ADDRESS, artifacts.Dai.abi, owner);
  const wethCtx = new Contract(WETH_ADDRESS, artifacts.Weth.abi, owner);
  const museCtx = new Contract(MUSE_ADDRESS, artifacts.Muse.abi, owner);

  /* await daiCtx
    .connect(owner)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("10000"));
  await wethCtx
    .connect(owner)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("10000"));
  await museCtx
    .connect(owner)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("10000")); */

  const daiBalance = await daiCtx.balanceOf(owner.address);
  console.log(`DAI Balance: ${ethers.utils.formatEther(daiBalance)}`);

  const museBalance = await museCtx.balanceOf(owner.address);
  console.log(`MUSE Balance: ${ethers.utils.formatEther(museBalance)}`);

  const wethBalance = await wethCtx.balanceOf(owner.address);
  console.log(`WETH Balance: ${ethers.utils.formatEther(wethBalance)}`);

  const poolContract = new Contract(MUSE_WETH_POOL, UniswapV3PoolABI, owner);
  const poolData = await getPoolData(poolContract);
  if (!poolData) {
    throw new Error("Failed to get pool data");
  }

  // Create tokens and pool
  const pool = new Pool(
    WethToken,
    DaiToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick,
  );

  const position = new Position({
    pool,
    liquidity: ethers.utils.parseEther("10"),
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
  });

  // Desired amounts
  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  // Calcola gli importi desiderati (se necessario)
  /*  const amount0Desired =  ethers.utils.parseEther("1");
  const amount1Desired =  ethers.utils.parseEther("1"); */

  // Minting parameters
  const params = {
    token0: MUSE_ADDRESS,
    token1: WETH_ADDRESS,
    fee: poolData?.fee,
    tickLower:
      nearestUsableTick(poolData?.tick, poolData?.tickSpacing) -
      poolData?.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData?.tick, poolData?.tickSpacing) +
      poolData?.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  // console.log("Position:", position);
  // console.log("Minting parameters:", params);

  // Initialize NonfungiblePositionManager contract
  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    owner,
  );

  // Execute mint transaction
  const tx = await nonfungiblePositionManager.mint(params, {
    gasLimit: 10000000,
  });

  const receipt = await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
