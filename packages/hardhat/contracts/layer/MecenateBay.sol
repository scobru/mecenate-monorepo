// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import "../library/Structures.sol";
import "../modules/FeedViewer.sol";

contract MecenateBay is Ownable {
  address public identityContract;

  constructor(address _identityContract) {
    identityContract = _identityContract;
  }

  mapping(address => Structures.BayRequest[]) public requests;
  Structures.BayRequest[] public allRequests;

  /// @notice Creates a new request.
  /// @param  request BayRequest struct.
  /// @return BayRequest struct.
  function createRequest(Structures.BayRequest memory request) public payable returns (Structures.BayRequest memory) {
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");
    require(request.stake > 0, "stake is not enough");
    require(request.payment > 0, "payment is not enough");
    require(request.postAddress == address(0), "post address is not valid");

    requests[msg.sender].push(request);
    allRequests.push(request);
  }

  function getRequests() public view returns (Structures.BayRequest[] memory) {
    return allRequests;
  }

  function acceptRequest(uint256 index, address _feed) public payable {
    require(msg.value == allRequests[index].stake, "stake is not enough");
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");

    Structures.Feed memory feed = _getFeedInfo(_feed);

    require(feed.postdata.settings.seller == msg.sender, "user is not seller");
    require(allRequests[index].stake == address(0), "post address is not valid");
    allRequests[index].accepted = true;
    allRequests[index].seller = msg.sender;
  }
}
