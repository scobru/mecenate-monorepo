import { Token, BigintIsh } from "@uniswap/sdk-core";
import { TickMath, Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import { parse } from "dotenv";
import { BigNumber, ethers, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import hre from "hardhat";
const bn = require("bignumber.js");

// Uniswap contract addresses
const DAI_ADDRESS = "0xCFA79Ce44e410a05c6C271bb2F95084Db6D52b33";
const MUSE_ADDRESS = "0x100d7c197a9EF83258C888cb0Fb2d8e0Be2A0584";
const WETH_ADDRESS = "0xa3a0460606Bb07A44Ff47fB90f2532F99de99534";

const POSITION_MANAGER_ADDRESS = "0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30";

const MUSE_WETH_POOL_500 = "0xb2155eF7B25741cA05C551A7F7568743AAC122D9";
const MUSE_WETH_POOL_3000 = "0x0dcEB51e39D38aAD0ef0361EE1f06e95341B8b38";
const DAI_WETH_POOL_500 = "0x51dB5E40418c16Ec33c60c9c7eEA43bE644De398";
const DAI_WETH_POOL_3000 = "0x5a12a8E77f3D8C1E1D4b6dc4d070148083faE298";

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

  const DaiToken = new Token(84531, DAI_ADDRESS, 18, "mDAI", "mDAI");
  const WethToken = new Token(84531, WETH_ADDRESS, 18, "mWETH", "mWETH");
  const MuseToken = new Token(84531, MUSE_ADDRESS, 18, "MUSE", "Muse");

  const daiCtx = new Contract(DAI_ADDRESS, artifacts.Dai.abi, owner);
  const wethCtx = new Contract(WETH_ADDRESS, artifacts.Weth.abi, owner);
  const museCtx = new Contract(MUSE_ADDRESS, artifacts.Muse.abi, owner);

  const daiBalance = await daiCtx.balanceOf(owner.address);
  console.log(`DAI Balance: ${ethers.utils.formatEther(daiBalance)}`);

  const museBalance = await museCtx.balanceOf(owner.address);
  console.log(`MUSE Balance: ${ethers.utils.formatEther(museBalance)}`);

  const wethBalance = await wethCtx.balanceOf(owner.address);
  console.log(`WETH Balance: ${ethers.utils.formatEther(wethBalance)}`);

  await daiCtx
    .connect(owner)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000000"));
  await wethCtx
    .connect(owner)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000000"));
  await museCtx
    .connect(owner)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000000"));

  const poolContract = new Contract(
    MUSE_WETH_POOL_500,
    UniswapV3PoolABI,
    owner,
  );
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

  const position = new Position({
    pool,
    liquidity: ethers.utils.parseEther("1000"),
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

  console.log("Liquidty position minted:");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });