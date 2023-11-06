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
    function renouncePost() external {
        require(msg.sender == post.postdata.escrow.seller, "NOT_SELLER");
        require(locked == true, "NOT_LOCKED");

        // Validate the post status
        Structures.PostStatus currentStatus = post.postdata.settings.status;

        require(validStatuses[uint8(currentStatus)], "INVALID_STATUS");

        // Reset post and post settings
        post = Structures.Post(
            Structures.User({
                evmAddress: address(0),
                sismoVaultId: ZEROHASH,
                publicKey: ZEROHASH
            }),
            Structures.PostData({
                settings: Structures.PostSettings({
                    status: Structures.PostStatus.Renounced,
                    postType: Structures.PostType.Text,
                    creationTimeStamp: 0,
                    endTimeStamp: 0,
                    duration: 0,
                    tokenId: Structures.Tokens.NaN,
                    postId: bytes32(0)
                }),
                escrow: Structures.PostEscrow({
                    buyer: address(0),
                    seller: address(0),
                    stake: 0,
                    payment: 0,
                    punishment: 0,
                    penalty: 0
                }),
                data: Structures.PostEncryptedData({
                    encryptedData: "",
                    encryptedKey: "",
                    decryptedData: ""
                })
            })
        );

        locked = false;

        // Emit event
        emit Renounced(post);
    }
}
