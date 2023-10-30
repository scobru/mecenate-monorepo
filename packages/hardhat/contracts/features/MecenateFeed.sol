// SPDX-License-Identifier: MIT

/**
 * @title MecenateFeed
 * @dev This contract implements the MecenateFeed feature, which allows users to create and manage posts for crowdfunding campaigns.
 * The contract inherits from several modules that provide functionality for post creation, acceptance, submission, finalization, and renouncement.
 * The contract also provides several view functions to retrieve information about a post's buyer payment, seller deposit, seller stake, buyer stake, payment requested, post status, and post count.
 */

pragma solidity ^0.8.9;

import "../modules/Events.sol";
import "../modules/Creation.sol";
import "../modules/Acceptance.sol";
import "../modules/Submission.sol";
import "../modules/Finalization.sol";
import "../modules/Renounce.sol";
import "../modules/Version.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract MecenateFeed is
    Initializable,
    Events,
    Creation,
    Acceptance,
    Renounce,
    Submission,
    Finalization,
    Version
{
    function initialize(
        address _owner,
        address _usersModuleContract,
        address _factoryContract,
        uint256 _maj,
        uint256 _min,
        uint256 _pat
    ) public initializer {
        require(owner == address(0), "ALREADY_INITIALIZED");
        owner = _owner;

        settings.punishmentRatio = 100000000000000000; // Constant value
        settings.postCount = 0; // Initialize postCount to 0
        settings.usersModuleContract = _usersModuleContract;
        settings.factoryContract = msg.sender;
        settings.router = IMecenateFeedFactory(_factoryContract).router();
        settings.version = _version();

        post.postdata.settings.status = Structures.PostStatus.Waiting;

        postDurationToDays[uint8(Structures.PostDuration.OneDay)] = 1 days;
        postDurationToDays[uint8(Structures.PostDuration.ThreeDays)] = 3 days;
        postDurationToDays[uint8(Structures.PostDuration.OneWeek)] = 7 days;
        postDurationToDays[uint8(Structures.PostDuration.TwoWeeks)] = 14 days;
        postDurationToDays[uint8(Structures.PostDuration.OneMonth)] = 30 days;

        validStatuses[uint8(Structures.PostStatus.Waiting)] = true;

        major = _maj;
        minor = _min;
        patch = _pat;
    }
}
