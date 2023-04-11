// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateTier} from "../features/MecenateTier.sol";
import "../modules/Factory.sol";

contract MecenateTierFactory is Factory {
    event MecenateSubscriptionCreated(address indexed subscriptionAddress);

    constructor(
        address _identityContract,
        address _treasuryContract
    ) Factory(_identityContract, _treasuryContract) {}

    function _createContract(
        address creator
    ) internal override returns (address) {
        MecenateTier tier = new MecenateTier(creator, "", "", 0, 0);
        return address(tier);
    }

    function createMecenateSubscription(
        string memory name,
        string memory description,
        uint256 fee,
        uint256 subscriptionDuration
    ) public payable returns (address) {
        address newContract = createContract();
        MecenateTier tier = MecenateTier(newContract);
        tier.initialize(
            address(this),
            name,
            description,
            fee,
            subscriptionDuration
        );
        return newContract;
    }
}
