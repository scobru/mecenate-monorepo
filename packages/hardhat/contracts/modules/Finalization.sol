// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Staking.sol";

abstract contract Finalization is Staking {
    function finalizePost(
        bool valid,
        uint256 punishment,
        bytes32 encryptedVaultId
    ) external virtual returns (bool) {
        require(
            postSettingPrivate.vaultIdBuyer == encryptedVaultId ||
                postSettingPrivate.vaultIdSeller == encryptedVaultId,
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
                postSettingPrivate.buyer,
                post.postdata.escrow.payment
            );

            uint256 sellerStake = _addStake(
                postSettingPrivate.seller,
                amountToAdd
            );

            post.postdata.escrow.stake = sellerStake;

            post.postdata.escrow.payment = buyerStake;

            emit Valid(post);
        } else if (post.postdata.settings.endTimeStamp > block.timestamp) {
            require(
                postSettingPrivate.vaultIdBuyer == encryptedVaultId,
                "You are not the buyer"
            );

            if (valid == true) {
                address treasuryContract = IMecenateFactory(factoryContract)
                    .treasuryContract();

                uint256 buyerFee = (post.postdata.escrow.payment *
                    IMecenateTreasury(treasuryContract).globalFee()) / 10000;

                uint256 amountToAdd = post.postdata.escrow.payment - buyerFee;

                payable(treasuryContract).transfer(buyerFee);

                uint256 buyerStake = _takeStake(
                    postSettingPrivate.buyer,
                    post.postdata.escrow.payment
                );

                uint256 sellerStake = _addStake(
                    postSettingPrivate.seller,
                    amountToAdd
                );

                post.postdata.escrow.stake = sellerStake;

                post.postdata.escrow.payment = buyerStake;

                post.postdata.settings.status = Structures.PostStatus.Finalized;

                //_cancelPostSettingPrivate();

                emit Valid(post);
            } else if (valid == false) {
                require(
                    punishment <= post.postdata.escrow.stake,
                    "Punishment is too high"
                );

                uint256 buyerPunishment = (punishment * punishmentRatio) / 1e18;

                require(punishmentRatio < 1e18, "Punishment ratio is too high");

                post.postdata.escrow.buyerPunishment = buyerPunishment;

                post.postdata.settings.status = Structures.PostStatus.Finalized;

                post.postdata.escrow.punishment = punishment;

                address treasuryContract = IMecenateFactory(factoryContract)
                    .treasuryContract();

                uint256 totalPunishmentFee = buyerPunishment + punishment;

                payable(treasuryContract).transfer(totalPunishmentFee);

                uint256 buyerStake = _burnStake(
                    postSettingPrivate.buyer,
                    buyerPunishment
                );
                uint256 sellerStake = _burnStake(
                    postSettingPrivate.seller,
                    punishment
                );

                //_cancelPostSettingPrivate();

                emit Invalid(post);
            }
        }
    }

    function _cancelPostSettingPrivate() internal virtual {
        postSettingPrivate = Structures.postSettingPrivate({
            buyer: address(0),
            vaultIdBuyer: 0x00,
            seller: address(0),
            vaultIdSeller: 0x00
        });
    }
}
