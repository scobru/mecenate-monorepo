// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Events.sol";
import "./Staking.sol";

abstract contract Acceptance is Events, Staking {
    function acceptPost(
        bytes memory sismoConnectResponse,
        uint256 payment
    ) external virtual {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        bool result = IMecenateWallet(walletContract).pay(
            address(this),
            payment,
            keccak256(vaultIdBytes)
        );

        require(result, "Payment failed");

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        _addStake(userAddressConverted, payment);

        if (post.postdata.escrow.payment > 0) {
            require(
                payment == post.postdata.escrow.payment,
                "Not enough buyer payment"
            );
        } else {
            require(payment > 0, "Payment is required");
        }

        require(
            post.postdata.settings.status == Structures.PostStatus.Proposed,
            "Post is not Proposed"
        );
        require(
            userAddressConverted != address(0),
            "Buyer address cannot be zero"
        );

        if (postSettingPrivate.buyer != address(0)) {
            require(
                postSettingPrivate.buyer == userAddressConverted,
                "You are not the buyer"
            );
        }

        post.postdata.escrow.payment = payment;

        post.postdata.settings.status = Structures.PostStatus.Accepted;

        postSettingPrivate = Structures.postSettingPrivate({
            buyer: userAddressConverted,
            vaultIdBuyer: vaultIdBytes,
            seller: postSettingPrivate.seller,
            vaultIdSeller: postSettingPrivate.vaultIdSeller
        });

        emit Accepted(post);
    }
}
