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
    function renouncePost(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external {
        // Validate the post status
        Structures.PostStatus currentStatus = post.postdata.settings.status;
        require(validStatuses[uint8(currentStatus)], "INVALID_STATUS");

        // Verify the nonce and get the vault ID
        (bytes memory vaultId, , , ) = _verifyNonce(
            sismoConnectResponse,
            _to,
            _nonce
        );
        bytes32 encryptedVaultId = keccak256(vaultId);

        // Confirm that the caller is the seller
        bytes32 sellerVaultId = keccak256(postSettingPrivate.vaultIdSeller);
        require(encryptedVaultId == sellerVaultId, "NOT_SELLER");

        // Reset post and post settings
        post = Structures.Post(
            Structures.User({vaultId: bytes32(0)}),
            Structures.PostData({
                settings: Structures.PostSettings({
                    status: Structures.PostStatus.Renounced,
                    postType: Structures.PostType.Text,
                    creationTimeStamp: 0,
                    endTimeStamp: 0,
                    duration: 0,
                    tokenId: Structures.Tokens.NaN
                }),
                escrow: Structures.PostEscrow({
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

        postSettingPrivate.vaultIdBuyer = ZEROHASH;
        postSettingPrivate.buyerTwitterId = 0;
        postSettingPrivate.buyerTelegramId = 0;
        postSettingPrivate.vaultIdSeller = ZEROHASH;
        postSettingPrivate.sellerTwitterId = 0;
        postSettingPrivate.sellerTelegramId = 0;

        // Emit event
        emit Renounced(post);
    }
}
