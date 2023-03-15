// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateFeed} from "../features/MecenateFeed.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateFeedFactory is Ownable {
  uint256 numFeeds;
  address[] public feeds;
  mapping(address => bool) public createdContracts;
  address public identityContract;
  address public usersMouduleContract;

  event FeedCreated(address indexed addr);

  constructor(address _usersMouduleContract, address _identityContract) {
    identityContract = _identityContract;
    usersMouduleContract = _usersMouduleContract;
    _transferOwnership(msg.sender);
  }

  function buildFeed() public returns (address) {
    MecenateFeed feed = new MecenateFeed(usersMouduleContract, identityContract);
    feeds.push(address(feed));
    numFeeds++;
    createdContracts[address(feed)] = true;

    emit FeedCreated(address(feed));
    return address(feed);
  }

  function getFeeds() public view returns (address[] memory) {
    return feeds;
  }

  function getFeedsOwned(address owner) public view returns (address[] memory) {
    address[] memory ownedFeeds = new address[](feeds.length);
    for (uint256 i = 0; i < ownedFeeds.length; i++) {
      if (payable(MecenateFeed(payable(feeds[i])).owner()) == owner) {
        ownedFeeds[i] = feeds[i];
      }
    }

    return ownedFeeds;
  }

  function isContractCreated(address contractAddress) public view returns (bool) {
    return createdContracts[contractAddress];
  }

  receive() external payable {}
}
