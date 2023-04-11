pragma solidity 0.8.19;

import "./MintableERC20.sol";

contract MockWETH is MintableERC20 {
    constructor() ERC20("MockWETH", "WETH") {}
}
