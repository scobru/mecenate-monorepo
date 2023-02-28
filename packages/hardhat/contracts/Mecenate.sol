// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IMecenateSubscriptionFactory {
  function subscribeFee() external view returns (uint256);

  function owner() external view returns (address);
}

contract Mecenate is Ownable {
  using SafeMath for uint256;

  string public name;
  mapping(uint256 => uint256) public monthlyFee;
  mapping(address => uint256) public subscriberTier;
  mapping(uint256 => string) public descriptionTier;
  mapping(address => uint256) public lastPaymentTime;

  uint256 public numTiers;
  address public factory;
  uint256 public subscriptionDuration = 30 days;

  event SubscriptionRenewed(address indexed subscriber, uint256 payment, uint256 tier, uint256 nextPaymentTime);
  event TierAdded(uint256 fee);

  constructor(
    address _creator,
    string memory _name,
    uint256[] memory _monthlyFees,
    string[] memory _descriptionTier
  ) {
    require(_monthlyFees.length > 0, "Must provide at least one tier");
    require(_monthlyFees.length == _descriptionTier.length, "Must provide at least one tier");
    name = _name;
    for (uint256 i = 0; i < _monthlyFees.length; i++) {
      addTierInternal(_monthlyFees[i], _descriptionTier[i]);
    }
    transferOwnership(_creator);
    factory = msg.sender;
  }

  function addTier(uint256 fee, string memory description) public onlyOwner {
    addTierInternal(fee, description);
  }

  function addTierInternal(uint256 fee, string memory description) private {
    numTiers++;
    monthlyFee[numTiers] = fee;
    descriptionTier[numTiers] = description;
    emit TierAdded(fee);
  }

  function subscribe(uint256 tier) public payable {
    require(tier > 0 && tier <= getNumberOfTiers(), "Invalid tier");
    require(msg.value == monthlyFee[tier], "Incorrect payment amount");
    require(subscriberTier[msg.sender] != tier, "Already subscribed to this tier");
    require(lastPaymentTime[msg.sender] + subscriptionDuration <= block.timestamp, "Subscription still active");
    // Send Fee
    address factoryOwner = IMecenateSubscriptionFactory(factory).owner();
    uint256 factoryFee = IMecenateSubscriptionFactory(factory).subscribeFee();
    uint256 feeAmount = (msg.value * factoryFee) / 10000;
    payable(factoryOwner).transfer(feeAmount);
    uint256 amountAfter = msg.value - feeAmount;

    subscriberTier[msg.sender] = tier;
    lastPaymentTime[msg.sender] = block.timestamp;
    uint256 nextPaymentTime = block.timestamp + subscriptionDuration;
    emit SubscriptionRenewed(msg.sender, amountAfter, tier, nextPaymentTime);
  }

  function isSubscribed(address subscriber) public view returns (bool) {
    return subscriberTier[subscriber] != 0;
  }

  function changeMonthlyFee(uint256 tier, uint256 newFee) public onlyOwner {
    require(tier > 0 && tier <= getNumberOfTiers(), "Invalid tier");
    monthlyFee[tier] = newFee;
  }

  function changeName(string memory newName) public onlyOwner {
    name = newName;
  }

  function changeDescriptionTier(uint256 tier, string memory newDescription) public onlyOwner {
    require(tier > 0 && tier <= getNumberOfTiers(), "Invalid tier");
    descriptionTier[tier] = newDescription;
  }

  function withdrawFunds() public onlyOwner {
    uint256 balance = address(this).balance;
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success, "Withdrawal failed");
  }

  function getContractBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function getSubscriptionStatus(address subscriber) public view returns (bool, uint256) {
    uint256 tier = subscriberTier[subscriber];
    bool isSub = tier != 0;
    if (lastPaymentTime[subscriber] + subscriptionDuration <= block.timestamp) {
      return (false, tier);
    } else {
      return (isSub, tier);
    }
  }

  function getMonthlyFee(uint256 tier) public view returns (uint256) {
    require(tier > 0 && tier <= getNumberOfTiers(), "Invalid tier");
    return monthlyFee[tier];
  }

  function getDescriptionTier(uint256 tier) public view returns (string memory) {
    require(tier > 0 && tier <= getNumberOfTiers(), "Invalid tier");
    return descriptionTier[tier];
  }

  function getNumberOfTiers() public view returns (uint256) {
    return numTiers;
  }

  receive() external payable {}
}
