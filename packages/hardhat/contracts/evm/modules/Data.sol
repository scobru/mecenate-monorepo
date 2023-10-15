// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../interfaces/IMecenateFeed.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFeedFactory.sol";

/**
 * @title Data
 * @dev This contract stores data related to Mecenate posts and provides functions to interact with it.
 */
contract Data {
    bytes internal constant ZEROHASH = "0x00";

    address public owner;

    Structures.Post public post;

    Structures.PostSettingPrivate internal postSettingPrivate;

    Structures.FeedSettings internal settings;

    mapping(uint8 => uint256) internal postDurationToDays;

    mapping(uint8 => bool) internal validStatuses;

    constructor(
        address usersModuleContract,
        address factoryContract,
        string memory version
    ) {
        settings.punishmentRatio = 100000000000000000; // Constant value
        settings.postCount = 0; // Initialize postCount to 0
        settings.usersModuleContract = usersModuleContract;
        settings.factoryContract = msg.sender;
        settings.router = IMecenateFeedFactory(factoryContract).router();
        post.postdata.settings.status = Structures.PostStatus.Waiting;

        postDurationToDays[uint8(Structures.PostDuration.OneDay)] = 1 days;
        postDurationToDays[uint8(Structures.PostDuration.ThreeDays)] = 3 days;
        postDurationToDays[uint8(Structures.PostDuration.OneWeek)] = 7 days;
        postDurationToDays[uint8(Structures.PostDuration.TwoWeeks)] = 14 days;
        postDurationToDays[uint8(Structures.PostDuration.OneMonth)] = 30 days;
        validStatuses[uint8(Structures.PostStatus.Waiting)] = true;

        settings.version = version;
    }

    function version() external view returns (string memory) {
        return settings.version;
    }

    function _changeStatus(Structures.PostStatus newStatus) internal {
        validStatuses[uint8(post.postdata.settings.status)] = false;
        validStatuses[uint8(newStatus)] = true;
        post.postdata.settings.status = newStatus;
    }

    function getStatus() external view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }

    function getTokenId() external view returns (Structures.Tokens) {
        return post.postdata.settings.tokenId;
    }

    function getTokenIdAddress() public view returns (address) {
        if (post.postdata.settings.tokenId == Structures.Tokens.MUSE) {
            return IMecenateFeedFactory(settings.factoryContract).museToken();
        } else if (post.postdata.settings.tokenId == Structures.Tokens.DAI) {
            return IMecenateFeedFactory(settings.factoryContract).daiToken();
        } else {
            return address(0);
        }
    }

    function _checkToken(Structures.Tokens _token) internal view {
        require(_token == post.postdata.settings.tokenId, "WRONG_TOKEN");
    }

    function getPaymentRequested() external view returns (uint256) {
        return post.postdata.escrow.payment;
    }

    function getStakeRequested() external view returns (uint256) {
        return post.postdata.escrow.stake;
    }

    function postCount() external view returns (uint256) {
        return settings.postCount;
    }

    receive() external payable {}
}
