// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IMecenateFactory.sol";
import "../interfaces/IMecenateTreasury.sol";

contract MecenateTier is Ownable {
    using SafeMath for uint256;

    address public creator;

    string public name;

    string public description;

    uint256 public subscriptionDuration;

    uint256 public fee;

    uint256 public subscribeCount;

    uint256 public totalFeeCreator;

    address public factoryContract;

    bytes32 private tierCid;

    mapping(address => uint256) public lastPaymentTime;

    event SubscriptionRenewed(
        address indexed subscriber,
        uint256 payment,
        uint256 nextPaymentTime
    );

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

        factoryContract = msg.sender;

        transferOwnership(_creator);
    }

    function initialize(
        address _creator,
        string memory _name,
        string memory _description,
        uint256 _fee,
        uint256 _subscriptionDuration
    ) public {
        require(
            msg.sender == address(factoryContract),
            "Only Factory contract can call this"
        );
        creator = _creator;

        name = _name;

        description = _description;

        fee = _fee;

        subscriptionDuration = _subscriptionDuration;

        factoryContract = msg.sender;

        transferOwnership(_creator);
    }

    function subscribe() public payable {
        require(msg.value == fee, "Incorrect payment amount");

        require(
            lastPaymentTime[msg.sender] + subscriptionDuration <=
                block.timestamp,
            "Subscription still active"
        );

        subscribeCount++;

        // Send Fee
        address treasuryContract = IMecenateFactory(factoryContract)
            .treasuryContract();

        uint256 factoryFee = IMecenateTreasury(treasuryContract).globalFee();

        uint256 feeAmount = (msg.value * factoryFee) / 10000;

        payable(treasuryContract).transfer(feeAmount);

        uint256 amountAfter = msg.value - feeAmount;

        totalFeeCreator += amountAfter;

        payable(creator).transfer(amountAfter);

        lastPaymentTime[msg.sender] = block.timestamp;

        uint256 nextPaymentTime = block.timestamp + subscriptionDuration;
        emit SubscriptionRenewed(msg.sender, amountAfter, nextPaymentTime);
    }

    function changeMonthlyFee(uint256 newFee) external onlyOwner {
        fee = newFee;
    }

    function changeName(string memory newName) external onlyOwner {
        name = newName;
    }

    function changeDescription(
        string memory newDescription
    ) external onlyOwner {
        description = newDescription;
    }

    function getSubscriptionStatus(
        address subscriber
    ) public view returns (bool) {
        if (
            lastPaymentTime[subscriber] + subscriptionDuration <=
            block.timestamp
        ) {
            return false;
        } else {
            return true;
        }
    }

    function setTierCid(bytes32 _tierCid) public onlyOwner {
        tierCid = _tierCid;
    }

    function getTierCid() external view returns (bytes32) {
        require(tierCid != bytes32(0), "Tier CID not set");
        require(getSubscriptionStatus(msg.sender), "Subscription not active");

        return tierCid;
    }
}
