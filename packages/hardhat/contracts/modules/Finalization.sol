// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Staking.sol";

abstract contract Finalization is Staking {
    function finalizePost(
        bool valid,
        uint256 punishment,
        bytes memory sismoConnectResponse
    ) external virtual returns (bool) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

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
                post.postdata.settings.buyer,
                post.postdata.escrow.payment
            );

            uint256 sellerStake = _addStake(
                post.postdata.settings.seller,
                amountToAdd
            );

            post.postdata.escrow.stake = sellerStake;

            post.postdata.escrow.payment = buyerStake;

            emit Valid(post);
        } else if (post.postdata.settings.endTimeStamp > block.timestamp) {
            require(
                post.postdata.settings.buyer == userAddressConverted,
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
                    post.postdata.settings.buyer,
                    post.postdata.escrow.payment
                );

                uint256 sellerStake = _addStake(
                    post.postdata.settings.seller,
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
                    post.postdata.settings.buyer,
                    buyerPunishment
                );
                uint256 sellerStake = _burnStake(
                    post.postdata.settings.seller,
                    punishment
                );

                emit Invalid(post);
            }
        }
    }
}
