pragma solidity 0.8.19;

import "./MockERC20.sol";

contract MockDai is MockERC20 {
    constructor() ERC20("DAI", "DAI") {
        _mint(msg.sender, 100000 * 10 ** 18);
    }
}
