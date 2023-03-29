// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "../interfaces/IFeed.sol";

abstract contract FeedViewer {
  function _getFeedInfo(address feed) internal view returns (Structures.Feed memory) {
    Structures.Feed memory f;
    f.operator = IFeed(feed).owner();
    f.buyer = IFeed(feed).getBuyer();
    f.seller = IFeed(feed).getSeller();
    f.sellerStake = IFeed(feed).getStake(f.seller);
    f.buyerStake = IFeed(feed).getStake(f.buyer);
    f.totalStake = IFeed(feed).getTotalStaked();
    f.postCount = IFeed(feed).postCount();
    f.buyerPayment = IFeed(feed).getBuyerPayment();
    return f;
  }

  function _getFeedsInfo(address[] memory feeds) internal view returns (Structures.Feed[] memory) {
    Structures.Feed[] memory f = new Structures.Feed[](feeds.length);
    for (uint256 i = 0; i < feeds.length; i++) {
      f[i] = _getFeedInfo(feeds[i]);
    }
    return f;
  }
}
