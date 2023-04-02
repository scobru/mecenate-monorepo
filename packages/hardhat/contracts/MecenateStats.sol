pragma solidity 0.8.19;

import "./interfaces/IMecenateUsers.sol";
import "./interfaces/IMecenateTierFactory.sol";
import "./interfaces/IMecenateDCAFactory.sol";
import "./interfaces/IMecenateQuestionFactory.sol";
import "./interfaces/IMecenateFeedFactory.sol";
import "./interfaces/IMecenateBay.sol";
import "./interfaces/IMecenateBox.sol";
import "./interfaces/IMecenateIdentity.sol";
import "./interfaces/IMecenateTreasury.sol";

contract MecenateStats {
    struct Stats {
        uint256 totalUsers;
        uint256 totalIdentities;
        uint256 totalBayRequests;
        uint256 totalTiers;
        uint256 totalFeeds;
        uint256 totalQuestions;
        uint256 totalBoxDeposits;
        uint256 globalFee;
        uint256 fixedFee;
        uint256 treasuryBalance;
    }

    IMecenateUsers public mecenateUsers;
    IMecenateTierFactory public mecenateTierFactory;
    IMecenateFeedFactory public mecenateFeedFactory;
    IMecenateQuestionFactory public mecenateQuestionFactory;
    IMecenateDCAFactory public mecenateDCAFactory;
    IMecenateBay public mecenateBay;
    IMecenateBox public mecenateBox;
    IMecenateIdentity public mecenateIdentity;
    IMecenateTreasury public mecenateTreasury;

    constructor(
        address _mecenateUsers,
        address _mecenateTierFactory,
        address _mecenateFeedFactory,
        address _mecenateQuestionFactory,
        address _mecenateDCAFactory,
        address _mecenateBay,
        address _mecenateBox,
        address _mecenateIdentity,
        address _mecenateTreasury
    ) {
        mecenateUsers = IMecenateUsers(_mecenateUsers);
        mecenateTierFactory = IMecenateTierFactory(_mecenateTierFactory);
        mecenateFeedFactory = IMecenateFeedFactory(_mecenateFeedFactory);
        mecenateQuestionFactory = IMecenateQuestionFactory(
            _mecenateQuestionFactory
        );
        mecenateDCAFactory = IMecenateDCAFactory(_mecenateDCAFactory);
        mecenateBay = IMecenateBay(_mecenateBay);
        mecenateIdentity = IMecenateIdentity(_mecenateIdentity);
        mecenateTreasury = IMecenateTreasury(_mecenateTreasury);
        mecenateBox = IMecenateBox(_mecenateBox);
    }

    function getStats() public view returns (Stats memory) {
        // sanitizé reverted

        uint256 totalBayRequests = mecenateBay.contractCounter();
        uint256 totalTiers = mecenateTierFactory.contractCounter();
        uint256 totalFeeds = mecenateFeedFactory.contractCounter();
        uint256 totalQuestions = mecenateQuestionFactory.contractCounter();

        return
            Stats(
                mecenateUsers.getUserCount(),
                mecenateIdentity.getTotalIdentities(),
                totalBayRequests,
                totalTiers,
                totalFeeds,
                totalQuestions,
                mecenateBox.depositCount(),
                mecenateTreasury.globalFee(),
                mecenateTreasury.fixedFee(),
                address(mecenateTreasury).balance
            );
    }
}
