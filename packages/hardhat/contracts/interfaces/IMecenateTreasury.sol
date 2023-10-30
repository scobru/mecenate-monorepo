// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IMecenateTreasury {
    function globalFee() external view returns (uint256);

    function fixedFee() external view returns (uint256);
}
