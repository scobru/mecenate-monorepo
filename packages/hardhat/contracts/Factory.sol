// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Mecenate} from "./Mecenate.sol";
import {Identity} from "./Identity.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {
  address[] public subscriptions;
  mapping(address => bool) public createdContracts;

  uint256 public numSubscriptions;
  uint256 public creationFee;
  uint256 public subscribeFeePercent;

  Identity public identityContract;

  event MecenateSubscriptionCreated(address indexed subscriptionAddress);

  constructor(
    uint256 _creationFee,
    uint256 _subscribeFeePercent,
    address _identityContract
  ) {
    creationFee = _creationFee;
    subscribeFeePercent = _subscribeFeePercent;
    identityContract = Identity(_identityContract);
    _transferOwnership(msg.sender);
  }

  function createMecenateSubscription(
    address creator,
    string memory name,
    string memory description,
    uint256 fee,
    uint256 subscriptionDuration
  ) public payable {
    require(msg.value == creationFee, "Incorrect creation fee amount");
    // Check if the caller has minted an Identity NFT
    require(identityContract.balanceOf(msg.sender) > 0, "Caller must have an Identity NFT");

    Mecenate mecenate = new Mecenate(creator, name, description, fee, subscriptionDuration);
    subscriptions.push(address(mecenate));
    numSubscriptions++;
    createdContracts[address(mecenate)] = true;

    payable(owner()).transfer(msg.value);

    emit MecenateSubscriptionCreated(address(mecenate));
  }

  function getSubscriptions() public view returns (address[] memory) {
    return subscriptions;
  }

  function getSubscriptionsOwned(address owner) public view returns (address[] memory) {
    address[] memory ownedSubscriptions = new address[](subscriptions.length);
    for (uint256 i = 0; i < ownedSubscriptions.length; i++) {
      if (payable(Mecenate(payable(subscriptions[i])).owner()) == owner) {
        ownedSubscriptions[i] = subscriptions[i];
      }
    }

    return ownedSubscriptions;
  }

  function changeCreationFee(uint256 newFee) public {
    require(msg.sender == owner(), "Only owner can set creation fee");
    require(newFee <= 1 ether, "Creation fee must be greater than 0");
    creationFee = newFee;
  }

  function changeSubscribeFee(uint256 newFee) public {
    require(msg.sender == owner(), "Only owner can set subscribe fee");
    require(newFee <= 500, "Creation fee must under 5%");
    subscribeFeePercent = newFee;
  }

  function isContractCreated(address contractAddress) public view returns (bool) {
    return createdContracts[contractAddress];
  }

  function getCreatorData(address creator) public view returns (uint256, uint256) {
    address[] memory ownedSubscriptions = getSubscriptionsOwned(creator);
    uint256 totalSubscriptions = 0;
    uint256 totalFees = 0;
    for (uint256 i = 0; i < ownedSubscriptions.length; i++) {
      totalSubscriptions += Mecenate(payable(ownedSubscriptions[i])).subscribeCount();
      totalFees += Mecenate(payable(ownedSubscriptions[i])).totalFeeCreator();
    }
    return (totalSubscriptions, totalFees);
  }

  receive() external payable {}
}
