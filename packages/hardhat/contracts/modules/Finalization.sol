// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title Finalization
 * @notice Contract for finalizing posts
 * @dev Contract for finalizing posts
 */

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Finalization is Data, Events, Staking {
  /**
   * @notice Finalizes a post
   * @param  valid - if the post is valid
   * @param  punishment - punishment for the seller
   * @return bool - if the post is valid
   */

  function finalizePost(bool valid, uint256 punishment) public virtual returns (bool) {
    require(post.postdata.settings.status == Structures.PostStatus.Submitted, "Post is not Submitted");

    if (post.postdata.settings.endTimeStamp < block.timestamp) {
      post.postdata.settings.status = Structures.PostStatus.Finalized;

      uint256 buyerStake = _takeStake(post.postdata.settings.buyer, post.postdata.escrow.payment);
      uint256 sellerStake = _addStake(post.postdata.settings.seller, post.postdata.escrow.payment);

      post.postdata.escrow.stake = sellerStake;
      post.postdata.escrow.payment = buyerStake;

      emit Valid(post);
    } else if (post.postdata.settings.endTimeStamp > block.timestamp) {
      require(post.postdata.settings.buyer == msg.sender, "You are not the buyer");
      if (valid == true) {
        uint256 buyerStake = _takeStake(post.postdata.settings.buyer, post.postdata.escrow.payment);
        uint256 sellerStake = _addStake(post.postdata.settings.seller, post.postdata.escrow.payment);

        post.postdata.escrow.stake = sellerStake;
        post.postdata.escrow.payment = buyerStake;

        post.postdata.settings.status = Structures.PostStatus.Finalized;

        emit Valid(post);
      } else if (valid == false) {
        require(punishment <= post.postdata.escrow.stake, "Punishment is too high");

        uint256 buyerPunishment = (punishment * punishmentRatio) / 1e18;

        post.postdata.escrow.buyerPunishment = buyerPunishment;
        post.postdata.settings.status = Structures.PostStatus.Finalized;
        post.postdata.escrow.punishment = punishment;

        uint256 buyerStake = _burnStake(post.postdata.settings.buyer, buyerPunishment);
        uint256 sellerStake = _burnStake(post.postdata.settings.seller, punishment);

        emit Invalid(post);
      }
    }
  }
}
