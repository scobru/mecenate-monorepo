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

  function acceptPost(bytes memory publicKey, address _buyer) public payable virtual {
    require(IUsers(usersModuleContract).checkifUserExist(_buyer), "User does not exist");
    require(msg.value > 0 || post.postdata.escrow.payment > 0, "Payment is required");
    require(post.postdata.settings.status == Structures.PostStatus.Proposed, "Post is not Proposed");
    require(_buyer == post.postdata.settings.buyer, "Only Buyer can accept the post");

    if (post.postdata.escrow.payment > 0) {
      require(msg.value == post.postdata.escrow.payment, "Payment is not correct");
    }

    uint256 stake = _addStake(_buyer, msg.value);

    post.postdata.settings.buyer = _buyer;
    post.postdata.settings.buyerPubKey = publicKey;

    post.postdata.escrow.payment = stake;

    post.postdata.settings.status = Structures.PostStatus.Accepted;

    emit Accepted(post);
  }
}
