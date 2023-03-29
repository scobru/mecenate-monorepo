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

  constructor(
    address owner,
    address _usersModuleContract,
    address _identityContract
  ) Creation(_usersModuleContract, _identityContract) {
    _transferOwnership(owner);
  }

  function getSeller() public view returns (address) {
    return post.postdata.settings.seller;
  }

  function getBuyer() public view returns (address) {
    return post.postdata.settings.buyer;
  }

  function getBuyerPayment() public view returns (uint256) {
    return post.postdata.escrow.payment;
  }

  function getSellerPayment() public view returns (uint256) {
    return post.postdata.escrow.stake;
  }

  function getPostStatus() public view returns (Structures.PostStatus) {
    return post.postdata.settings.status;
  }

  function getPostCount() public view returns (uint256) {
    return postCount;
  }
}
