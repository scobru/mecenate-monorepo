// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateTier} from "../features/MecenateTier.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import {IMecenateTreasury} from "../interfaces/IMecenateTreasury.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateTierFactory is Ownable {
    uint256 public contractCounter;

    address[] public tiers;

    mapping(address => bool) public createdContracts;

    uint256 public numSubscriptions;

    uint256 public subscribeFeePercent;

    address public treasuryContract;

    MecenateIdentity public identityContract;

    event MecenateSubscriptionCreated(address indexed subscriptionAddress);

    constructor(address _identityContract, address _treasuryContract) {
        identityContract = MecenateIdentity(_identityContract);
        treasuryContract = _treasuryContract;
        subscribeFeePercent = IMecenateTreasury(_treasuryContract).globalFee();
        _transferOwnership(msg.sender);
    }

    function createMecenateSubscription(
        address creator,
        string memory name,
        string memory description,
        uint256 fee,
        uint256 subscriptionDuration
    ) public payable {
        require(msg.value == getCreationFee(), "Incorrect creation fee amount");
        // Check if the caller has minted an Identity NFT
        require(
            identityContract.balanceOf(msg.sender) > 0,
            "Caller must have an Identity NFT"
        );

        contractCounter++;

        MecenateTier mecenate = new MecenateTier(
            creator,
            name,
            description,
            fee,
            subscriptionDuration
        );
        tiers.push(address(mecenate));
        numSubscriptions++;
        createdContracts[address(mecenate)] = true;

        payable(treasuryContract).transfer(msg.value);

        emit MecenateSubscriptionCreated(address(mecenate));
    }

    function getSubscriptions() public view returns (address[] memory) {
        return tiers;
    }

    function getSubscriptionsOwned(
        address owner
    ) public view returns (address[] memory) {
        address[] memory ownedSubscriptions = new address[](tiers.length);
        for (uint256 i = 0; i < ownedSubscriptions.length; i++) {
            if (payable(MecenateTier(payable(tiers[i])).owner()) == owner) {
                ownedSubscriptions[i] = tiers[i];
            }
        }

        return ownedSubscriptions;
    }

    function isContractCreated(
        address contractAddress
    ) public view returns (bool) {
        return createdContracts[contractAddress];
    }

    function getCreatorData(
        address creator
    ) public view returns (uint256, uint256) {
        address[] memory ownedSubscriptions = getSubscriptionsOwned(creator);
        uint256 totalSubscriptions = 0;
        uint256 totalFees = 0;
        for (uint256 i = 0; i < ownedSubscriptions.length; i++) {
            totalSubscriptions += MecenateTier(payable(ownedSubscriptions[i]))
                .subscribeCount();
            totalFees += MecenateTier(payable(ownedSubscriptions[i]))
                .totalFeeCreator();
        }
        return (totalSubscriptions, totalFees);
    }

    function getCreationFee() public view returns (uint256) {
        return IMecenateTreasury(treasuryContract).fixedFee();
    }

    receive() external payable {}
}
