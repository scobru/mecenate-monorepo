// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IFactory.sol";

contract MecenateTier is Ownable {
  using SafeMath for uint256;

  address public creator;
  string public name;
  string public description;
  uint256 public subscriptionDuration;
  uint256 public fee;
  uint256 public subscribeCount;
  uint256 public totalFeeCreator;
  address public factory;

  mapping(address => uint256) public lastPaymentTime;

  event SubscriptionRenewed(address indexed subscriber, uint256 payment, uint256 nextPaymentTime);

  constructor(
    address _creator,
    string memory _name,
    string memory _description,
    uint256 _fee,
    uint256 _subscriptionDuration
  ) {
    creator = _creator;

    name = _name;

    description = _description;

    fee = _fee;

    subscriptionDuration = _subscriptionDuration;

    transferOwnership(_creator);

    factory = msg.sender;
  }

  function subscribe() public payable {
    require(msg.value == fee, "Incorrect payment amount");

    require(lastPaymentTime[msg.sender] + subscriptionDuration <= block.timestamp, "Subscription still active");

    subscribeCount++;
    // Send Fee
    address factoryOwner = IFactory(factory).owner();

    uint256 factoryFee = IFactory(factory).subscribeFeePercent();

    uint256 feeAmount = (msg.value * factoryFee) / 10000;

    payable(factoryOwner).transfer(feeAmount);

    uint256 amountAfter = msg.value - feeAmount;

    totalFeeCreator += amountAfter;

    payable(creator).transfer(amountAfter);

    lastPaymentTime[msg.sender] = block.timestamp;

    uint256 nextPaymentTime = block.timestamp + subscriptionDuration;

    emit SubscriptionRenewed(msg.sender, amountAfter, nextPaymentTime);
  }

  function changeMonthlyFee(uint256 newFee) public onlyOwner {
    fee = newFee;
  }

  function changeName(string memory newName) public onlyOwner {
    name = newName;
  }

  function changeDescription(string memory newDescription) public onlyOwner {
    description = newDescription;
  }

  function getSubscriptionStatus(address subscriber) public view returns (bool) {
    if (lastPaymentTime[subscriber] + subscriptionDuration <= block.timestamp) {
      return false;
    } else {
      return true;
    }
  }

  // payable fallback function to allow contract to receive ETH
  receive() external payable {}
}
