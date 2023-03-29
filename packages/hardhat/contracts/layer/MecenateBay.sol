// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import "../library/Structures.sol";
import "../modules/FeedViewer.sol";

// Comment

interface IUsers {
  function getUserData(address user) external view returns (Structures.User memory);

  function checkifUserExist(address user) external view returns (bool);
}

contract MecenateBay is Ownable, FeedViewer {
  address public identityContract;
  address public usersMouduleContract;

  event RequestCreated(address indexed user, Structures.BayRequest, uint256 indexed index);
  event RequestAccepted(address indexed user, Structures.BayRequest, uint256 indexed index);

  constructor(address _identityContract, address _usersMouduleContract) {
    identityContract = _identityContract;
    usersMouduleContract = _usersMouduleContract;
  }

  mapping(address => Structures.BayRequest[]) public requests;

  Structures.BayRequest[] public allRequests;

  function createRequest(Structures.BayRequest memory request) public payable returns (Structures.BayRequest memory) {
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");
    require(request.stake > 0, "stake is not enough");
    require(request.payment == msg.value, "payment is not enough");
    require(request.postAddress == address(0), "post address is not valid");
    require(request.seller == address(0), "seller is not valid");

    requests[msg.sender].push(request);
    allRequests.push(request);
    emit RequestCreated(msg.sender, request, allRequests.length - 1);
  }

  function acceptRequest(uint256 index, address _feed) public {
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");

    Structures.Feed memory feed = _getFeedInfo(_feed);

    require(feed.seller == msg.sender, "seller is not the same of the feed");
    require(feed.buyerPayment == allRequests[index].payment, "payment is not the same of the feed");
    require(feed.sellerStake == allRequests[index].stake, "stake is not the same of the feed");

    allRequests[index].accepted = true;
    allRequests[index].seller = msg.sender;
    allRequests[index].postAddress = _feed;
    allRequests[index].postCount = feed.postCount;

    bytes memory publicKey = IUsers(usersMouduleContract).getUserData(allRequests[index].buyer).publicKey;
    IFeed(_feed).acceptPost{value: allRequests[index].payment}(publicKey, allRequests[index].buyer);

    emit RequestAccepted(msg.sender, allRequests[index], index);
  }

  function getRequests() public view returns (Structures.BayRequest[] memory) {
    return allRequests;
  }

  function getRequestForAddress(address _address) public view returns (Structures.BayRequest[] memory) {
    return requests[_address];
  }
}