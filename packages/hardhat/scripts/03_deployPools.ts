import { ethers, Wallet } from "ethers";
import { config } from "hardhat";
import hre from "hardhat";

// Token addresses
const DAI_ADDRESS = "0xd2c9a6323EBAab2939228B8bcE11d338599472D3";
const MUSE_ADDRESS = "0x2DE564D6090A66dd1F6818BDFC7C7f25C1aeCc78";

// Uniswap contract address
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
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

  const daiCtx = new Contract(token0, artifacts.Dai.abi, signer);
  const wethCtx = new Contract(token1, artifacts.Weth.abi, signer);
  const museCtx = new Contract(token1, artifacts.Muse.abi, signer);

  await daiCtx
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("10000"));
  await wethCtx
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("10000"));
  await museCtx
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("10000"));

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
    WETH_ADDRESS,
    DAI_ADDRESS,
    500,
    encodePriceSqrt(1, 1),
  );
  console.log("Pool Deployed=", `'${pool}'`);
}

/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
