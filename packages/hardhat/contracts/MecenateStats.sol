pragma solidity 0.8.19;

import "./interfaces/IMecenateUsers.sol";
import "./interfaces/IMecenateFeedFactory.sol";
import "./interfaces/IMecenateBay.sol";
import "./interfaces/IMecenateTreasury.sol";

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
        address _mecenateUsers,
        address _mecenateFeedFactory,
        address _mecenateBay,
        address _mecenateTreasury
    ) {
        mecenateUsers = IMecenateUsers(_mecenateUsers);
        mecenateFeedFactory = IMecenateFeedFactory(_mecenateFeedFactory);

        mecenateBay = IMecenateBay(_mecenateBay);
        mecenateTreasury = IMecenateTreasury(_mecenateTreasury);
    }

    function getStats() public view returns (Stats memory) {
        // sanitizé reverted

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
