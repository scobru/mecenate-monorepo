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
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce,
        Structures.Tokens tokenId,
        uint256 _paymentAmount
    ) external payable virtual {
        require(
            validStatuses[uint8(Structures.PostStatus.Proposed)],
            "INVALID_STATUS"
        );
        _checkToken(tokenId);

        uint256 amountToAdd = tokenId == Structures.Tokens.NaN
            ? msg.value
            : _paymentAmount;
        bytes32 sellerVaultIdHash = keccak256(postSettingPrivate.vaultIdSeller);

        // Get encryptedVaultId only once
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,

        ) = _verifyNonce(sismoConnectResponse, _to, _nonce);
        bytes32 encryptedVaultId = keccak256(vaultId);

        // Use local variable for repeated calls
        uint256 sellerStake = Deposit._getDeposit(tokenId, sellerVaultIdHash);

        require(sellerStake >= post.postdata.escrow.stake, "STAKE_INCORRECT");
        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                encryptedVaultId
            ),
            "USERT_NOT_EXIST"
        );
        require(encryptedVaultId != sellerVaultIdHash, "YOU_ARE_THE_SELLER");

        if (post.postdata.escrow.payment > 0) {
            require(
                _paymentAmount >= post.postdata.escrow.payment,
                "NOT_ENOUGH_PAYMENT"
            );
        } else {
            require(msg.value > 0, "ZERO_MSGVALUE");
            require(_paymentAmount > 0, "ZERO_PAYMENT");
        }

        uint256 payment = _addStake(
            tokenId,
            encryptedVaultId,
            msg.sender,
            amountToAdd
        );

        // Update all at once
        post.postdata.escrow.payment = payment;
        post.postdata.settings.status = Structures.PostStatus.Accepted;
        _changeStatus(Structures.PostStatus.Accepted);

        // Update private settings
        postSettingPrivate.vaultIdBuyer = vaultId;
        postSettingPrivate.buyerTwitterId = twitterId;
        postSettingPrivate.buyerTelegramId = telegramId;

        emit Accepted(post);
    }
}
