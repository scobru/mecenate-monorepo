import { ethers, Wallet } from "ethers";
import { config } from "hardhat";
import hre from "hardhat";

// Token addresses
const DAI_ADDRESS = "0xCFA79Ce44e410a05c6C271bb2F95084Db6D52b33";
const MUSE_ADDRESS = "0x100d7c197a9EF83258C888cb0Fb2d8e0Be2A0584";
const WETH_ADDRESS = "0xa3a0460606Bb07A44Ff47fB90f2532F99de99534";

const FACTORY_ADDRESS = "0x9323c1d6D800ed51Bd7C6B216cfBec678B7d0BC2";
const POSITION_MANAGER_ADDRESS = "0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30";

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Dai: require("./ERC20ABI.json"),
  Weth: require("./ERC20ABI.json"),
  Muse: require("./ERC20ABI.json"),
};

const { Contract, BigNumber } = require("ethers");
const bn = require("bignumber.js");

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const signer = hre.ethers.provider.getSigner(0);

const provider = hre.ethers.provider;

export function encodePriceSqrt(reserve1: number, reserve0: number): BigInt {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString(),
  );
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  signer,
);

const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  signer,
);

const daiCtx = new Contract(DAI_ADDRESS, artifacts.Dai.abi, signer);
const wethCtx = new Contract(WETH_ADDRESS, artifacts.Weth.abi, signer);
const museCtx = new Contract(MUSE_ADDRESS, artifacts.Muse.abi, signer);

export async function deployPool(
  token0: string,
  token1: string,
  fee: number,
  price: any,
): Promise<string> {
  console.log(
    "Deploying pool for",
    token0,
    token1,
    "with fee",
    fee,
    "and price",
    price.toString(),
  );

  await daiCtx
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000000"));
  await wethCtx
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000000"));
  await museCtx
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000000"));

  const daiBalance = await daiCtx.balanceOf(signer.getAddress());
  console.log(`mDAI Balance: ${ethers.utils.formatEther(daiBalance)}`);

  const museBalance = await museCtx.balanceOf(signer.getAddress());
  console.log(`MUSE Balance: ${ethers.utils.formatEther(museBalance)}`);

  const wethBalance = await wethCtx.balanceOf(signer.getAddress());
  console.log(`mWETH Balance: ${ethers.utils.formatEther(wethBalance)}`);

  await nonfungiblePositionManager
    .connect(signer)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price);
  const poolAddress = await factory
    .connect(signer)
    .getPool(token0, token1, fee);
  return poolAddress;
}

async function main(): Promise<void> {
  const pool = await deployPool(
    MUSE_ADDRESS,
    WETH_ADDRESS,
    500,
    encodePriceSqrt(1, 2000),
  );
  console.log("Pool Deployed=", `'${pool}'`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
