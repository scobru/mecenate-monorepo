// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Refund is Data, Events, Staking {
    function refund() public virtual {
        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted,
            "Post is not accepted"
        );

        require(
            post.postdata.settings.buyer == msg.sender ||
                post.postdata.settings.seller == msg.sender,
            "Only Buyer or Seller can refund the post"
        );

        uint256 payment = post.postdata.escrow.payment;

        require(payment > 0, "Payment is not correct");

        _takeStake(msg.sender, payment);

        payable(post.postdata.settings.buyer).transfer(payment);

        post.postdata.settings.buyer = address(0);

        post.postdata.settings.buyerPubKey = "";

        post.postdata.escrow.payment = 0;

        post.postdata.settings.status = Structures.PostStatus.Waiting;

        emit Refunded(post);
    }
}
