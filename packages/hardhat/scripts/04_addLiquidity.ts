import { Token, BigintIsh } from "@uniswap/sdk-core";
import { TickMath, Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import { parse } from "dotenv";
import { BigNumber, ethers, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import hre from "hardhat";
const bn = require("bignumber.js");

// Uniswap contract addresses
const DAI_ADDRESS = "0xe3abeFb1CD6D2a1d547C69e9C7B9C66cBefCD69A";
const MUSE_ADDRESS = "0x7dC64e726E425f4145127DCD2308a3b293B44fb2";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const POSITION_MANAGER_ADDRESS = "0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30";
const WETH_MUSE_POOL = "0x958A51a983084620a82CFC92E6c25e5ED064F335";

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

async function main() {
  const [owner] = await hre.ethers.getSigners();

  // Initialize contracts
  const DaiToken = new Token(84531, DAI_ADDRESS, 18, "DAI", "Dai");
  const WethToken = new Token(
    84531,
    WETH_ADDRESS,
    18,
    "WETH",
    "Wrapped Ethereum",
  );
  const MuseToken = new Token(84531, MUSE_ADDRESS, 18, "MUSE", "Muse");

  const poolContract = new Contract(WETH_MUSE_POOL, UniswapV3PoolABI, owner);
  const poolData = await getPoolData(poolContract);
  if (!poolData) {
    throw new Error("Failed to get pool data");
  }
  // Create tokens and pool
  const pool = new Pool(
    MuseToken,
    WethToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick,
  );

  // Calculate position
  const slippageTolerance = BigNumber.from(9900);
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
  /*   const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts; */

  // Calcola gli importi desiderati (se necessario)
  const amount0Desired = await ethers.utils.parseEther("10");
  const amount1Desired = await ethers.utils.parseEther("10");

  // Minting parameters
  const params = {
    token0: WETH_ADDRESS,
    token1: MUSE_ADDRESS,
    fee: poolData.fee,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + 900,
  };

  console.log("Minting parameters:", params);

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
