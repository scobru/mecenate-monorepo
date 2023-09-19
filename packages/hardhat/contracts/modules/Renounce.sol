/**
 * @title Renounce
 * @dev This abstract contract extends the Staking contract and provides functionality for a seller to renounce a post.
 * The seller can only renounce a post if they are the original creator of the post and the post is in the Accepted or Submitted status.
 * Renouncing a post refunds the buyer's payment and transfers the seller's stake to the seller's address.
 * The post struct is reset and the post status is updated to Renounced.
 * This contract also provides an internal function for refunding a post, which is called by the renouncePost function.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Staking.sol";

abstract contract Renounce is Staking {
    function renouncePost(bytes32 encryptedVaultId) external virtual {
        require(
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller),
            "You are not the seller"
        );

        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        // Reset the post struct
        post.creator = Structures.User(bytes32(0));
        post.postdata = Structures.PostData(
            Structures.PostSettings(
                Structures.PostStatus.Waiting,
                Structures.PostType.Text,
                0,
                0,
                0
            ),
            Structures.PostEscrow(0, 0, 0, 0),
            Structures.PostEncryptedData("", "", "")
        );

        // Update the post status and emit an event
        post.postdata.settings.status = Structures.PostStatus.Renounced;

        postSettingPrivate = Structures.postSettingPrivate({
            vaultIdBuyer: ZEROHASH,
            buyerTwitterId: 0,
            buyerTelegramId: 0,
            vaultIdSeller: ZEROHASH,
            sellerTwitterId: 0,
            sellerTelegramId: 0
        });

        emit Renounced(post);
    }
}
