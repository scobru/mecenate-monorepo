import hre from "hardhat";
import { ethers, Contract } from "ethers";
import { Position, nearestUsableTick, Pool } from "@uniswap/v3-sdk";
import ERC721ABI from "./ERC721ABI.json";

// Token addresses
const DAI_ADDRESS = "0x51cD5C233910D00002c2B4Ae2E6fD3494A6f4189";
const MUSE_ADDRESS = "0xe4b03c13BE0B6771D43d884cfA118272aFC09435";

// Uniswap contract address
const WETH_ADDRESS = "0xe556Fc9CD057B9f4e0fE2A92DDf83d9A7ce65871";
const FACTORY_ADDRESS = "0x9323c1d6D800ed51Bd7C6B216cfBec678B7d0BC2";
const SWAP_ROUTER_ADDRESS = "0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d";
const NFT_DESCRIPTOR_ADDRESS = "0xa9C86b1C210C77cfbd00277f530870a969C7E780";
const POSITION_DESCRIPTOR_ADDRESS =
  "0x70F236302AadcE4eC69C6786A36b2C1a3563830A";
const POSITION_MANAGER_ADDRESS = "0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30";

const DAI_WETH_500 = "0x7D0B7eb434C134Eb66aAe683D2B3a59FA7872235";

const PositionID = 292;

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("./ERC20ABI.json"),
  Usdc: require("./ERC20ABI.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const provider = hre.ethers.provider;

async function getPoolData(poolContract: {
  tickSpacing: () => any;
  fee: () => any;
  liquidity: () => any;
  slot0: () => any;
}) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function main() {
  const [owner] = await hre.ethers.getSigners();
  console.log("Owner address:", owner?.address);

  const poolContract = new Contract(
    DAI_WETH_500,
    artifacts.UniswapV3Pool.abi,
    provider,
  );

  // Connettiti a NonfungiblePositionManager e brucia la posizione
  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    owner,
  );

  const position = await nonfungiblePositionManager.positions(PositionID);

  console.log("Position:", position);

  const params = {
    tokenId: PositionID,
    liquidity: position.liquidity, // Quantità di liquidità da rimuovere
    amount0Min: 0, // Minimo importo di token0
    amount1Min: 0, // Minimo importo di token1
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // Deadline
  };

  // Esegui la transazione
  const tx = await nonfungiblePositionManager.decreaseLiquidity(params);
  const receipt = await tx.wait();
  console.log("Liquidity Decreased:", receipt);

  /* const tx2 = await nonfungiblePositionManager.burn(PositionID, { value: 0 });

  const receipt2 = await tx2.wait();
  console.log("Burn transaction receipt:", receipt2); */
}

/*
npx hardhat run --network localhost scripts/04_addLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
