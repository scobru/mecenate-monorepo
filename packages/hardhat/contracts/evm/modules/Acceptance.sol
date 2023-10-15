/**
 * @title Acceptance
 * @dev This contract is an abstract contract that inherits from Events and Staking contracts. It provides a function to accept a post and add stake to the post. The function accepts a Sismo Connect response as a parameter and verifies the user existence. It also checks if the user is not the seller and if the post is in Proposed status. If the post has an escrow payment, it checks if the buyer has paid enough and adds the payment to the post's escrow. If the post does not have an escrow payment, it requires a payment from the buyer and adds it to the post's escrow. Finally, it changes the post status to Accepted and emits an Accepted event.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Events.sol";
import "./Staking.sol";

abstract contract Acceptance is Events, Staking {
    function acceptPost(
        Structures.Tokens tokenId,
        uint256 paymentAmount,
        address funder
    ) external payable virtual {
        require(
            validStatuses[uint8(Structures.PostStatus.Proposed)],
            "INVALID_STATUS"
        );

        _checkToken(tokenId);

        uint256 amountToAdd = tokenId == Structures.Tokens.NaN
            ? msg.value
            : paymentAmount;

        // Use local variable for repeated calls
        uint256 sellerStake = Deposit._getDeposit(
            tokenId,
            postSettingPrivate.sellerAddress
        );

        require(sellerStake >= post.postdata.escrow.stake, "STAKE_INCORRECT");

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                msg.sender
            ),
            "USERT_NOT_EXIST"
        );

        require(
            msg.sender != postSettingPrivate.sellerAddress,
            "YOU_ARE_THE_SELLER"
        );

        if (post.postdata.escrow.payment > 0) {
            require(
                paymentAmount >= post.postdata.escrow.payment,
                "NOT_ENOUGH_PAYMENT"
            );
        } else {
            require(msg.value > 0, "ZERO_MSGVALUE");
            require(paymentAmount > 0, "ZERO_PAYMENT");
        }

        uint256 payment = _addStake(tokenId, msg.sender, funder, amountToAdd);

        // Update all at once
        post.postdata.escrow.payment = payment;

        post.postdata.settings.status = Structures.PostStatus.Accepted;

        _changeStatus(Structures.PostStatus.Accepted);

        // Update private settings
        postSettingPrivate.buyerAddress = msg.sender;

        emit Accepted(post);
    }
}
