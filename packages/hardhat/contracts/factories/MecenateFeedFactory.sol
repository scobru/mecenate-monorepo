// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateFeed} from "../features/MecenateFeed.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import "../modules/FeedViewer.sol";

interface IMecenateUsers {
  function checkifUserExist(address user) external view returns (bool);
}

contract MecenateFeedFactory is Ownable, FeedViewer {
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
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");
    require(IMecenateUsers(usersMouduleContract).checkifUserExist(msg.sender), "user does not exist");
    MecenateFeed feed = new MecenateFeed(msg.sender, usersMouduleContract, identityContract);
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

  function getFeedInfo(address _feed) public view returns (Structures.Feed memory) {
    return _getFeedInfo(_feed);
  }

  function getFeedsInfo() public view returns (Structures.Feed[] memory) {
    return _getFeedsInfo(feeds);
  }

  function isContractCreated(address contractAddress) public view returns (bool) {
    return createdContracts[contractAddress];
  }

  receive() external payable {}
}
