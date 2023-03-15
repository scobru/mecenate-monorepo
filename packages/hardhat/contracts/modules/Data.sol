// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Data
 * @notice Contract for storing data
 * @dev Contract for storing data
 */

contract Data is Ownable {
  uint256 public constant punishmentRatio = 100000000000000000;
  Structures.Post public post;
  address public usersModuleContract;
  address public identityContract;
}
