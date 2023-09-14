/**
 * @title FeedViewer
 * @dev This contract provides functions to retrieve information about Mecenate feeds.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "../interfaces/IMecenateFeed.sol";

contract FeedViewer {
    function _getFeedInfo(
        address feed
    ) internal view returns (Structures.Feed memory) {
        Structures.Feed memory f;
        f.contractAddress = feed;
        f.operator = IMecenateFeed(feed).owner();
        f.sellerStake = IMecenateFeed(feed).getSellerStake();
        f.buyerStake = IMecenateFeed(feed).getBuyerStake();
        f.totalStake = IMecenateFeed(feed).getTotalStaked();
        f.postCount = IMecenateFeed(feed).postCount();
        f.buyerPayment = IMecenateFeed(feed).getBuyerPayment();
        return f;
    }

    function _getFeedsInfo(
        address[] memory _feeds
    ) internal view returns (Structures.Feed[] memory) {
        Structures.Feed[] memory f = new Structures.Feed[](_feeds.length);

        for (uint256 i = 0; i < _feeds.length; i++) {
            f[i] = _getFeedInfo(_feeds[i]);
        }
        return f;
    }
}
