// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Mecenate} from "./Mecenate.sol";
import {Identity} from "./Identity.sol";

contract MecenateSubscriptionFactory {
  address[] public subscriptions;
  mapping(address => bool) public createdContracts;
  uint256 public numSubscriptions;
  uint256 public creationFee;
  uint256 public subscribeFee;
  address payable public owner;
  Identity public identityContract;

  event MecenateSubscriptionCreated(address indexed subscriptionAddress);

  constructor(uint256 _creationFee, address _identityContract) {
    owner = payable(msg.sender);
    creationFee = _creationFee;
    identityContract = Identity(_identityContract);
  }

  function createMecenateSubscription(
    address creator,
    string memory name,
    uint256[] memory monthlyFees,
    string[] memory descriptionTier
  ) public payable {
    require(msg.value == creationFee, "Incorrect creation fee amount");
    require(monthlyFees.length > 0, "Must provide at least one tier");

    // Check if the caller has minted an Identity NFT
    require(identityContract.balanceOf(msg.sender) > 0, "Caller must have an Identity NFT");

    Mecenate mecenate = new Mecenate(creator, name, monthlyFees, descriptionTier);
    subscriptions.push(address(mecenate));
    numSubscriptions++;
    createdContracts[address(mecenate)] = true;

    emit MecenateSubscriptionCreated(address(mecenate));
  }

  function getSubscriptions() public view returns (address[] memory) {
    return subscriptions;
  }

  function setCreationFee(uint256 newFee) public {
    require(msg.sender == owner, "Only owner can set creation fee");
    creationFee = newFee;
  }

  function withdrawFunds() public {
    require(msg.sender == owner, "Only owner can withdraw funds");
    uint256 balance = address(this).balance;
    (bool success, ) = owner.call{value: balance}("");
    require(success, "Transfer failed.");
  }

  function isContractCreated(address contractAddress) public view returns (bool) {
    return createdContracts[contractAddress];
  }

  receive() external payable {}
}
