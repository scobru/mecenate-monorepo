// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateIdentity.sol";

contract Data is Ownable {
  uint256 public constant punishmentRatio = 100000000000000000;
  Structures.Post public post;
  uint256 public postCount;
  address public usersModuleContract;
  address public identityContract;
}
