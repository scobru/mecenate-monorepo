// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// import IERC20 from openzeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMUSE is IERC20 {
    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external returns (bool);

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) external returns (bool);

    function mint(uint256 amount) external;

    function burn(uint256 amount) external;
}
