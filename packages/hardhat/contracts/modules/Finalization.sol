// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Staking.sol";

abstract contract Finalization is Staking {
    function finalizePost(bool valid, uint256 punishment, bytes32 uid) external virtual {
        require(msg.sender == postSettingPrivate.buyerAddress, "NOT_SELLER");

        require(
            post.postdata.settings.status == Structures.PostStatus.Submitted,
            "NOT_SUBMITTED"
        );

        IEAS eas = IEAS(settings.easContract);

        Attestation memory)attestation = eas.getAttestation(uid);

        require(
            attestation.attester == postSettingPrivate.buyerAddress,
            "INVALID_ATTESTATION"
        );

        require(attestation.recipient == postSettingPrivate.sellerAddress, "INVALID_RECIPIENT");

        require(attestation.schema == IMecenateFeedFactory(
            settings.factoryContract
        ).easSchema(), "INVALID_SCHEMA");

        (bool easResult, address feed, bytes memory post ) = abi.decode(attestation.data, (bool,address,bytes));

        require(feed == address(this), "INVALID_FEED");

        require(post == post.postdata.data.encryptedData, "INVALID_POST");

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
                postSettingPrivate.buyerAddress,
                post.postdata.escrow.payment
            );

            sellerStake = Deposit._increaseDeposit(
                post.postdata.settings.tokenId,
                postSettingPrivate.sellerAddress,
                amountToAdd
            );

            _burn(post.postdata.settings.tokenId, treasuryContract, buyerFee);

            // Update status and stakes
            post.postdata.escrow.stake = sellerStake;

            post.postdata.escrow.payment = buyerStake;

            _changeStatus(
                valid
                    ? Structures.PostStatus.Finalized
                    : Structures.PostStatus.Punished
            );

            emit Valid(post);
        } else if (!valid) {
            require(easResult == valid, "INVALID_ATTESTATION");

            require(
                punishment <= post.postdata.escrow.stake,
                "PUNISHMENT_TOO_HIGH"
            );
            require(settings.punishmentRatio < 1e18, "PUNISHMENT_RATIO_HIGH");

            uint256 penalty = (punishment * settings.punishmentRatio) / 1e18;

            post.postdata.escrow.payment = _burnStake(
                post.postdata.settings.tokenId,
                postSettingPrivate.buyerAddress,
                penalty
            );

            post.postdata.escrow.stake = _burnStake(
                post.postdata.settings.tokenId,
                postSettingPrivate.sellerAddress,
                punishment
            );

            // Update status and penalties
            post.postdata.settings.status = Structures.PostStatus.Punished;

            post.postdata.escrow.punishment = punishment;

            post.postdata.escrow.penalty = penalty;

            _changeStatus(Structures.PostStatus.Punished);

            emit Invalid(post);
        }
    }
}
