// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../interfaces/IMecenateFeed.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFeedFactory.sol";
import "../helpers/eas/IEAS.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

/**
 * @title Data
 * @dev This contract stores data related to Mecenate posts and provides functions to interact with it.
 */
abstract contract Data {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;
    EnumerableSetUpgradeable.Bytes32Set internal postIds;

    bytes internal constant ZEROHASH = "0x00";

    address public owner;

    Structures.Post public post;
    Structures.FeedSettings internal settings;

    mapping(uint8 => uint256) internal postDurationToDays;
    mapping(uint8 => bool) internal validStatuses;
    mapping(bytes32 => Structures.PostTimestamp) internal postTimestamps;

    bool public locked;

    function _changeStatus(Structures.PostStatus newStatus) internal {
        validStatuses[uint8(post.postdata.settings.status)] = false;
        validStatuses[uint8(newStatus)] = true;
        post.postdata.settings.status = newStatus;
    }

    function addPostId(bytes32 postId) internal {
        postIds.add(postId);
    }

    function getAllPostIds() external view returns (bytes32[] memory) {
        uint256 length = postIds.length();
        bytes32[] memory ids = new bytes32[](length);

        for (uint256 i = 0; i < length; i++) {
            ids[i] = postIds.at(i);
        }

        return ids;
    }

    function getPostId() external view returns (bytes32) {
        return post.postdata.settings.postId;
    }

    function getPostTimestamp(
        bytes32 postId
    ) external view returns (Structures.PostTimestamp memory) {
        return postTimestamps[postId];
    }

    function containPostId(bytes32 postId) external view returns (bool) {
        return postIds.contains(postId);
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

    function getEncryptedPost() external view returns (bytes memory) {
        return post.postdata.data.encryptedData;
    }

    function getPost() external view returns (Structures.Post memory) {
        return post;
    }

    receive() external payable {}
}
