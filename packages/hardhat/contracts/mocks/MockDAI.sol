pragma solidity 0.8.19;

import "./MintableERC20.sol";

contract MockDAI is MintableERC20 {
    constructor() ERC20("MockDAI", "DAI") {}
}
