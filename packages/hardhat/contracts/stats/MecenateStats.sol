/**
 * @title MecenateStats
 * @dev This contract provides statistics about the Mecenate platform, including the total number of users, bay requests, feeds, global fee, fixed fee, and treasury balance.
 */
pragma solidity 0.8.19;

import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateFeedFactory.sol";
import "../interfaces/IMecenateBay.sol";
import "../interfaces/IMecenateTreasury.sol";

contract MecenateStats {
    struct Stats {
        uint256 totalUsers;
        uint256 totalBayRequests;
        uint256 totalFeeds;
        uint256 globalFee;
        uint256 fixedFee;
        uint256 treasuryBalance;
    }

    IMecenateUsers public mecenateUsers;
    IMecenateFeedFactory public mecenateFeedFactory;
    IMecenateBay public mecenateBay;
    IMecenateTreasury public mecenateTreasury;

    constructor(
        address mecenateUsersAddress,
        address mecenateFeedFactoryAddress,
        address mecenateBayAddress,
        address mecenateTreasuryAddress
    ) {
        mecenateUsers = IMecenateUsers(mecenateUsersAddress);
        mecenateFeedFactory = IMecenateFeedFactory(mecenateFeedFactoryAddress);
        mecenateBay = IMecenateBay(mecenateBayAddress);
        mecenateTreasury = IMecenateTreasury(mecenateTreasuryAddress);
    }

    function getStats() public view returns (Stats memory) {
        uint256 totalBayRequests = mecenateBay.contractCounter();
        uint256 totalFeeds = mecenateFeedFactory.contractCounter();

        return
            Stats(
                mecenateUsers.getUserCount(),
                totalBayRequests,
                totalFeeds,
                mecenateTreasury.globalFee(),
                mecenateTreasury.fixedFee(),
                address(mecenateTreasury).balance
            );
    }
}
