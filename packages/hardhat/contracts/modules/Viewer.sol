// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";

interface IFeed {
  function getStake(address user) external view returns (uint256);

  function getTotalStaked() external view returns (uint256);

  function getSeller() external view returns (address);

  function getBuyer() external view returns (address);

  function postCount() external view returns (uint256);

  function owner() external view returns (address);
}

abstract contract Viewer {
  function _getFeedInfo(address feed) internal view returns (Structures.Feed memory) {
    Structures.Feed memory f;
    f.operator = IFeed(feed).owner();
    f.buyer = IFeed(feed).getBuyer();
    f.seller = IFeed(feed).getSeller();
    f.sellerStake = IFeed(feed).getStake(f.seller);
    f.buyerStake = IFeed(feed).getStake(f.buyer);
    f.totalStake = IFeed(feed).getTotalStaked();
    f.postCount = IFeed(feed).postCount();
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
