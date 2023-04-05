// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "../interfaces/IMecenateFeed.sol";

abstract contract FeedViewer {
    function _getFeedInfo(
        address feed
    ) internal view returns (Structures.Feed memory) {
        Structures.Feed memory f;
        f.buyer = IMecenateFeed(feed).getBuyer();
        f.seller = IMecenateFeed(feed).getSeller();
        f.sellerStake = IMecenateFeed(feed).getStake(f.seller);
        f.buyerStake = IMecenateFeed(feed).getStake(f.buyer);
        f.totalStake = IMecenateFeed(feed).getTotalStaked();
        f.postCount = IMecenateFeed(feed).postCount();
        f.buyerPayment = IMecenateFeed(feed).getBuyerPayment();
        return f;
    }

    function _getFeedsInfo(
        address[] memory feeds
    ) internal view returns (Structures.Feed[] memory) {
        Structures.Feed[] memory f = new Structures.Feed[](feeds.length);
        for (uint256 i = 0; i < feeds.length; i++) {
            f[i] = _getFeedInfo(feeds[i]);
        }
        return f;
    }
}
