// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Staking.sol";

abstract contract Finalization is Staking {
    function finalizePost(
        bool valid,
        uint256 punishment,
        bytes32 uid
    ) external virtual {
        require(msg.sender == post.postdata.escrow.buyer, "NOT_SELLER");
        require(locked == true, "NOT_LOCKED");

        require(
            post.postdata.settings.status == Structures.PostStatus.Submitted,
            "NOT_SUBMITTED"
        );

        IEAS eas = IEAS(
            IMecenateFeedFactory(settings.factoryContract).easContract()
        );

        Attestation memory attestation = eas.getAttestation(uid);

        require(
            attestation.attester == post.postdata.escrow.buyer,
            "INVALID_ATTESTATION"
        );

        require(
            attestation.recipient == post.postdata.escrow.seller,
            "INVALID_RECIPIENT"
        );

        require(
            attestation.schema ==
                IMecenateFeedFactory(settings.factoryContract).easSchema(),
            "INVALID_SCHEMA"
        );

        (bool easResult, address feed, bytes memory postBytes) = abi.decode(
            attestation.data,
            (bool, address, bytes)
        );

        require(feed == address(this), "INVALID_FEED");

        require(
            keccak256(abi.encode(postBytes)) ==
                keccak256(abi.encode(post.postdata.data.encryptedData)),
            "INVALID_POST"
        );

        // Common contract addresses and variables
        address treasuryContract = IMecenateFeedFactory(
            settings.factoryContract
        ).treasuryContract();

        uint256 buyerFee = (post.postdata.escrow.payment *
            IMecenateTreasury(treasuryContract).globalFee()) / 10000;

        uint256 amountToAdd = post.postdata.escrow.payment - buyerFee;

        // Variables for stake changes
        uint256 buyerStake;

        uint256 sellerStake;

        if (post.postdata.settings.endTimeStamp < block.timestamp || valid) {
            require(easResult == valid, "INVALID_ATTESTATION");

            // Code for both the timeout and the valid case
            buyerStake = Deposit._decreaseDeposit(
                post.postdata.settings.tokenId,
                post.postdata.escrow.buyer,
                post.postdata.escrow.payment
            );

            sellerStake = Deposit._increaseDeposit(
                post.postdata.settings.tokenId,
                post.postdata.escrow.seller,
                amountToAdd
            );

            _burn(post.postdata.settings.tokenId, treasuryContract, buyerFee);

            post.postdata.escrow.stake = sellerStake;

            post.postdata.escrow.payment = buyerStake;

            _changeStatus(
                valid
                    ? Structures.PostStatus.Finalized
                    : Structures.PostStatus.Punished
            );

            postTimestamps[post.postdata.settings.postId] = Structures
                .PostTimestamp({
                    postResult: Structures.PostResult.Valid,
                    creationTimeStamp: postTimestamps[
                        post.postdata.settings.postId
                    ].creationTimeStamp,
                    endTimeStamp: block.timestamp
                });

            emit Valid(post);
        } else if (!valid) {
            require(
                punishment <= post.postdata.escrow.stake,
                "PUNISHMENT_TOO_HIGH"
            );
            require(settings.punishmentRatio < 1e18, "PUNISHMENT_RATIO_HIGH");

            uint256 penalty = (punishment * settings.punishmentRatio) / 1e18;

            post.postdata.escrow.payment = _burnStake(
                post.postdata.settings.tokenId,
                post.postdata.escrow.buyer,
                penalty
            );

            post.postdata.escrow.stake = _burnStake(
                post.postdata.settings.tokenId,
                post.postdata.escrow.seller,
                punishment
            );

            // Update status and penalties
            post.postdata.settings.status = Structures.PostStatus.Punished;

            post.postdata.escrow.punishment = punishment;

            post.postdata.escrow.penalty = penalty;

            _changeStatus(Structures.PostStatus.Punished);

            postTimestamps[post.postdata.settings.postId] = Structures
                .PostTimestamp({
                    postResult: Structures.PostResult.Punished,
                    creationTimeStamp: postTimestamps[
                        post.postdata.settings.postId
                    ].creationTimeStamp,
                    endTimeStamp: block.timestamp
                });

            emit Invalid(post);
        }

        locked = false;
    }
}
