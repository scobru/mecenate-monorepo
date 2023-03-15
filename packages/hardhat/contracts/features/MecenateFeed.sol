// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import "../modules/Events.sol";
import "../modules/Creation.sol";
import "../modules/Acceptance.sol";
import "../modules/Submission.sol";
import "../modules/Finalization.sol";
import "../modules/Data.sol";

contract MecenateFeed is Ownable, Data, Creation, Acceptance, Submission, Finalization {
  using Structures for Structures.Post;

  constructor(address _usersModuleContract, address _identityContract)
    Creation(_usersModuleContract, _identityContract)
  {}
}
