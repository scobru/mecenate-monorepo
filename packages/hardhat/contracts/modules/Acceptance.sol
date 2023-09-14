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
        bytes memory sismoConnectResponse
    ) external payable virtual {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted,
            ,
            uint256 telegramId
        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "FEEDS:user does not exist"
        );

        require(
            userAddressConverted != postSettingPrivate.seller,
            "FEEDS: You are the seller"
        );

        uint256 payment;

        if (post.postdata.escrow.payment > 0) {
            payment = _addStake(userAddressConverted, msg.value);

            require(
                payment >= post.postdata.escrow.payment,
                "FEEDS: Payment is not enough"
            );
        } else {
            require(msg.value > 0, "FEEDS: Payment is zero");
            payment = _addStake(userAddressConverted, msg.value);
        }

        require(
            post.postdata.settings.status == Structures.PostStatus.Proposed,
            "FEEDS: Post is not Proposed"
        );

        if (postSettingPrivate.buyer != address(0)) {
            require(
                postSettingPrivate.buyer == userAddressConverted,
                "You are not the buyer"
            );
        }

        post.postdata.escrow.payment = payment;

        post.postdata.settings.status = Structures.PostStatus.Accepted;

        postSettingPrivate = Structures.postSettingPrivate({
            buyer: userAddressConverted,
            vaultIdBuyer: vaultIdBytes,
            buyerTelegramId: telegramId,
            seller: postSettingPrivate.seller,
            vaultIdSeller: postSettingPrivate.vaultIdSeller,
            sellerTelegramId: postSettingPrivate.sellerTelegramId
        });

        emit Accepted(post);
    }
}
