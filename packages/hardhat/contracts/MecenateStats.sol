pragma solidity 0.8.19;

import "./interfaces/IMecenateUsers.sol";
import "./interfaces/IMecenateFeedFactory.sol";
import "./interfaces/IMecenateBay.sol";
import "./interfaces/IMecenateIdentity.sol";
import "./interfaces/IMecenateTreasury.sol";

contract MecenateStats {
    struct Stats {
        uint256 totalUsers;
        uint256 totalIdentities;
        uint256 totalBayRequests;
        uint256 totalFeeds;
        uint256 globalFee;
        uint256 fixedFee;
        uint256 treasuryBalance;
    }

    IMecenateUsers public mecenateUsers;
    IMecenateFeedFactory public mecenateFeedFactory;
    IMecenateBay public mecenateBay;
    IMecenateIdentity public mecenateIdentity;
    IMecenateTreasury public mecenateTreasury;

    constructor(
        address _mecenateUsers,
        address _mecenateFeedFactory,
        address _mecenateBay,
        address _mecenateIdentity,
        address _mecenateTreasury
    ) {
        mecenateUsers = IMecenateUsers(_mecenateUsers);
        mecenateFeedFactory = IMecenateFeedFactory(_mecenateFeedFactory);

        mecenateBay = IMecenateBay(_mecenateBay);
        mecenateIdentity = IMecenateIdentity(_mecenateIdentity);
        mecenateTreasury = IMecenateTreasury(_mecenateTreasury);
    }

    function getStats() public view returns (Stats memory) {
        // sanitizé reverted

        uint256 totalBayRequests = mecenateBay.contractCounter();
        uint256 totalFeeds = mecenateFeedFactory.contractCounter();

        return
            Stats(
                mecenateUsers.getUserCount(),
                mecenateIdentity.getTotalIdentities(),
                totalBayRequests,
                totalFeeds,
                mecenateTreasury.globalFee(),
                mecenateTreasury.fixedFee(),
                address(mecenateTreasury).balance
            );
    }
}
