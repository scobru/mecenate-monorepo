// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

/**
 * @title Acceptance
 * @notice Contract for accepting posts
 * @dev Contract for accepting posts
 */
abstract contract Acceptance is Data, Events, Staking {
  /**
   * @notice Accepts the post and sets the buyer
   */

  function acceptPost(bytes memory publicKey) public payable virtual {
    require(msg.value > 0 || post.postdata.escrot.payment > 0, "Payment is required");
    require(post.postdata.settings.status == Structures.PostStatus.Proposed, "Post is not Proposed");
    uint256 stake = _addStake(msg.sender, msg.value);
    post.postdata.settings.buyer = msg.sender;
    post.postdata.settings.buyerPubKey = publicKey;
    post.postdata.escrow.payment = stake;
    post.postdata.settings.status = Structures.PostStatus.Accepted;

    emit Accepted(post);
  }
}
