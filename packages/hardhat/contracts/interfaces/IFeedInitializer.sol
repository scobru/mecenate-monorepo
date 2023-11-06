// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IFeedInitializer {
    function initialize(
        address _owner,
        address _factoryContract,
        address _usersModuleContract,
        uint256 major,
        uint256 minor,
        uint256 patch
    ) external returns (bool);
}
