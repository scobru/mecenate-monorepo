// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Renounce is Data, Events, Staking {
    function renouncePost(bytes memory sismoConnectResponse) public virtual {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            userAddressConverted == post.postdata.settings.seller,
            "You are not the seller"
        );

        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        _refundPost(userAddressConverted);

        uint256 stake = post.postdata.escrow.stake;

        _takeStake(post.postdata.settings.seller, stake);

        payable(post.postdata.settings.seller).transfer(stake);

        // Reset the post struct
        post.creator = Structures.User("0x00", address(0));
        post.postdata = Structures.PostData(
            Structures.PostSettings(
                Structures.PostStatus.Waiting,
                Structures.PostType.Text,
                address(0),
                "",
                address(0),
                0,
                0,
                0
            ),
            Structures.PostEscrow(0, 0, 0, 0),
            Structures.PostEncryptedData("", "", "")
        );

        // Update the post status and emit an event
        post.postdata.settings.status = Structures.PostStatus.Renounced;
        emit Renounced(post);
    }

    function _refundPost(address to) internal virtual {
        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted,
            "Post is not accepted"
        );

        require(
            post.postdata.settings.seller == to,
            "Only  Seller can refund the post"
        );

        uint256 payment = post.postdata.escrow.payment;

        require(payment > 0, "Payment is not correct");

        _takeStake(post.postdata.settings.buyer, payment);

        payable(post.postdata.settings.buyer).transfer(payment);

        post.postdata.settings.buyer = address(0);

        post.postdata.settings.buyerPubKey = "";

        post.postdata.escrow.payment = 0;

        post.postdata.settings.status = Structures.PostStatus.Waiting;

        emit Refunded(post);
    }
}
