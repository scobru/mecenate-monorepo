// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "../interfaces/IMecenateFeed.sol";

contract FeedViewer {
    function _getFeedInfo(
        address feed
    ) internal view returns (Structures.Feed memory) {
        Structures.Feed memory f;

        IMecenateFeed mecenateFeed = IMecenateFeed(feed);

        f.contractAddress = feed;
        f.owner = mecenateFeed.owner();
        f.sellerStake = mecenateFeed.getSellerStake();
        f.buyerStake = mecenateFeed.getBuyerStake();
        f.totalStake = mecenateFeed.getTotalStaked();
        f.postCount = mecenateFeed.postCount();
        f.paymentRequested = mecenateFeed.getPaymentRequested();
        f.stakeRequested = mecenateFeed.getStakeRequested();
        f.status = mecenateFeed.getStatus();
        f.tokenId = mecenateFeed.getTokenId();
        f.version = mecenateFeed.version();

        return f;
    }

    function _getFeedsInfo(
        address[] memory _feeds
    ) internal view returns (Structures.Feed[] memory) {
        uint256 len = _feeds.length;
        Structures.Feed[] memory f = new Structures.Feed[](len);

        for (uint256 i = 0; i < len; i++) {
            f[i] = _getFeedInfo(_feeds[i]);
        }

        return f;
    }
}
