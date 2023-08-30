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

        _refundPost();

        uint256 stake = post.postdata.escrow.stake;

        _takeStake(postSettingPrivate.seller, stake);

        payable(postSettingPrivate.seller).transfer(stake);

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
            buyer: address(0),
            vaultIdBuyer: ZEROHASH,
            seller: address(0),
            vaultIdSeller: ZEROHASH
        });

        emit Renounced(post);
    }

    function _refundPost() internal virtual {
        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted,
            "Post is not accepted"
        );

        uint256 payment = post.postdata.escrow.payment;

        require(payment > 0, "Payment is not correct");

        _takeStake(postSettingPrivate.buyer, payment);

        payable(postSettingPrivate.buyer).transfer(payment);

        postSettingPrivate.buyer = address(0);

        post.postdata.escrow.payment = 0;

        post.postdata.settings.status = Structures.PostStatus.Waiting;

        emit Refunded(post);
    }
}
