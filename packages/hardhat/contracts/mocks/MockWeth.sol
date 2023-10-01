pragma solidity 0.8.19;

import "./MockERC20.sol";

contract MockWeth is MockERC20 {
    constructor() ERC20("WETH", "WETH") {
        _mint(msg.sender, 100000 * 10 ** 18);
    }
}
