// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Data
 * @notice Contract for storing data
 * @dev Contract for storing data
 */
interface IUsers {
  function getUserData(address user) external view returns (Structures.User memory);

  function checkifUserExist(address user) external view returns (bool);
}

interface IIdentity {
  function identityByAddress(address user) external view returns (uint256);
}

contract Data is Ownable {
  uint256 public constant punishmentRatio = 100000000000000000;
  Structures.Post public post;
  uint256 public postCount;
  address public usersModuleContract;
  address public identityContract;
}
