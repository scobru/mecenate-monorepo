/**
 * @title Finalization
 * @dev This abstract contract defines the finalization process of a post on the Mecenate platform.
 * It inherits from the Staking contract and provides the finalizePost function to finalize a post.
 * The function checks if the post is submitted and if the end timestamp has passed. If the end timestamp has passed,
 * the function finalizes the post and transfers the buyer fee to the treasury contract, takes the buyer stake and adds it to the seller stake.
 * If the end timestamp has not passed, the function checks if the caller is the buyer and if the post is valid.
 * If the post is valid, it finalizes the post and transfers the buyer fee to the treasury contract, takes the buyer stake and adds it to the seller stake.
 * If the post is invalid, it sets the buyer punishment and transfers the total punishment fee to the treasury contract.
 * The contract also provides the _cancelPostSettingPrivate function to reset the postSettingPrivate struct.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Staking.sol";

abstract contract Finalization is Staking {
    function finalizePost(
        bool valid,
        uint256 punishment,
        bytes32 encryptedVaultId
    ) external virtual {
        require(
            keccak256(postSettingPrivate.vaultIdBuyer) == encryptedVaultId,
            "VaultId does not match"
        );

        require(
            post.postdata.settings.status == Structures.PostStatus.Submitted,
            "Post is not Submitted"
        );

        if (post.postdata.settings.endTimeStamp < block.timestamp) {
            post.postdata.settings.status = Structures.PostStatus.Finalized;

            address treasuryContract = IMecenateFactory(factoryContract)
                .treasuryContract();

            uint256 buyerFee = (post.postdata.escrow.payment *
                IMecenateTreasury(treasuryContract).globalFee()) / 10000;

            uint256 amountToAdd = post.postdata.escrow.payment - buyerFee;

            payable(treasuryContract).transfer(buyerFee);

            uint256 buyerStake = _takeStake(
                keccak256(postSettingPrivate.vaultIdBuyer),
                post.postdata.escrow.payment
            );

            uint256 sellerStake = _addStake(
                keccak256(postSettingPrivate.vaultIdSeller),
                amountToAdd
            );

            post.postdata.escrow.stake = sellerStake;

            post.postdata.escrow.payment = buyerStake;

            emit Valid(post);
        } else if (post.postdata.settings.endTimeStamp > block.timestamp) {
            require(
                keccak256(postSettingPrivate.vaultIdBuyer) == encryptedVaultId,
                "You are not the buyer"
            );

            if (valid == true) {
                address treasuryContract = IMecenateFactory(factoryContract)
                    .treasuryContract();

                uint256 buyerFee = (post.postdata.escrow.payment *
                    IMecenateTreasury(treasuryContract).globalFee()) / 10000;

                uint256 amountToAdd = post.postdata.escrow.payment - buyerFee;

                (bool success, ) = payable(treasuryContract).call{
                    value: buyerFee
                }("");

                require(success, "Transfer failed");

                uint256 buyerStake = _takeStake(
                    keccak256(postSettingPrivate.vaultIdBuyer),
                    post.postdata.escrow.payment
                );

                uint256 sellerStake = _addStake(
                    keccak256(postSettingPrivate.vaultIdSeller),
                    amountToAdd
                );

                post.postdata.escrow.stake = sellerStake;

                post.postdata.escrow.payment = buyerStake;

                post.postdata.settings.status = Structures.PostStatus.Finalized;

                emit Valid(post);
            } else if (valid == false) {
                require(
                    punishment <= post.postdata.escrow.stake,
                    "Punishment is too high"
                );

                require(punishmentRatio < 1e18, "Punishment ratio is too high");

                uint256 penality = (punishment * punishmentRatio) / 1e18;

                address treasuryContract = IMecenateFactory(factoryContract)
                    .treasuryContract();

                uint256 totalPunishmentFee = penality + punishment;

                (bool success, ) = payable(treasuryContract).call{
                    value: totalPunishmentFee
                }("");

                require(success, "Transfer failed");

                post.postdata.settings.status = Structures.PostStatus.Finalized;

                post.postdata.escrow.punishment = punishment;

                post.postdata.escrow.penality = penality;

                post.postdata.escrow.payment = _burnStake(
                    keccak256(postSettingPrivate.vaultIdBuyer),
                    penality
                );

                post.postdata.escrow.stake = _burnStake(
                    keccak256(postSettingPrivate.vaultIdSeller),
                    punishment
                );

                emit Invalid(post);
            }
        }
    }

    function _cancelPostSettingPrivate() internal virtual {
        postSettingPrivate = Structures.postSettingPrivate({
            vaultIdBuyer: ZEROHASH,
            buyerTwitterId: 0,
            buyerTelegramId: 0,
            vaultIdSeller: ZEROHASH,
            sellerTwitterId: 0,
            sellerTelegramId: 0
        });
    }
}
