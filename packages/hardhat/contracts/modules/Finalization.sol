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
    require(post.postdata.settings.status == Structures.PostStatus.Revealed, "Post is not revealed");

    if (post.postdata.settings.endTimeStamp < block.timestamp) {
      post.postdata.settings.status = Structures.PostStatus.Finalized;

      uint256 buyerStake = _takeStake(post.postdata.settings.buyer, post.postdata.escrow.payment);
      uint256 sellerStake = _addStake(post.postdata.settings.seller, post.postdata.escrow.payment);

      post.postdata.escrow.stake = sellerStake;
      post.postdata.escrow.payment = buyerStake;

      /* payable(post.postdata.settings.seller).transfer(post.postdata.escrow.payment);
      payable(post.postdata.settings.seller).transfer(post.postdata.escrow.stake); */

      emit Valid(post);
    } else if (post.postdata.settings.endTimeStamp > block.timestamp) {
      require(post.postdata.settings.buyer == msg.sender, "You are not the creator");

      if (valid == true) {
        uint256 buyerStake = _takeStake(post.postdata.settings.buyer, post.postdata.escrow.payment);
        uint256 sellerStake = _addStake(post.postdata.settings.seller, post.postdata.escrow.payment);

        /* payable(post.postdata.settings.seller).transfer(post.postdata.escrow.payment);
        payable(post.postdata.settings.seller).transfer(post.postdata.escrow.stake); */

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
        uint256 sellerStake = _burnStake(post.postdata.settings.buyer, punishment);

        /* payable(address(0)).transfer(buyerPunishment);
        payable(address(0)).transfer(punishment);
        payable(post.postdata.settings.buyer).transfer(post.postdata.escrow.payment - buyerPunishment);
        payable(post.postdata.settings.seller).transfer(post.postdata.escrow.stake - punishment); */

        emit Invalid(post);
      }
    }
  }

  function takeStake(uint256 amountToTake) external payable returns (uint256) {
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Waiting or Finalized"
    );
    uint256 currentDeposit = Deposit.getDeposit(msg.sender);
    uint256 stakerBalance;
    require(currentDeposit >= amountToTake, "Not enough deposit");
    if (msg.sender == post.postdata.settings.buyer) {
      stakerBalance = _takeStake(msg.sender, amountToTake);
      post.postdata.escrow.payment = stakerBalance;
    } else if (msg.sender == post.postdata.settings.seller) {
      stakerBalance = _takeStake(msg.sender, amountToTake);
      post.postdata.escrow.stake = stakerBalance;
    }
    payable(msg.sender).transfer(amountToTake);

    return stakerBalance;
  }

  function takeFullStake() external payable returns (uint256) {
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Waiting or Finalized"
    );
    uint256 currentDeposit = Deposit.getDeposit(msg.sender);
    uint256 stakerBalance = _takeFullStake(msg.sender);
    payable(msg.sender).transfer(stakerBalance);
    return stakerBalance;
  }
}
