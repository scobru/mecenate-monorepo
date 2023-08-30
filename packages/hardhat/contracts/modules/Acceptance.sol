// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Events.sol";
import "./Staking.sol";

abstract contract Acceptance is Events, Staking {
    function acceptPost(
        bytes memory sismoConnectResponse
    ) external payable virtual {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        require(
            userAddressConverted != postSettingPrivate.seller,
            "You are the seller"
        );

        if (post.postdata.escrow.payment > 0) {
            require(
                msg.value == post.postdata.escrow.payment,
                "Not enough buyer payment"
            );
        } else {
            require(msg.value > 0, "Payment is required");
        }

        require(
            post.postdata.settings.status == Structures.PostStatus.Proposed,
            "Post is not Proposed"
        );

        _addStake(userAddressConverted, msg.value);

        if (postSettingPrivate.buyer != address(0)) {
            require(
                postSettingPrivate.buyer == userAddressConverted,
                "You are not the buyer"
            );
        }

        post.postdata.escrow.payment = msg.value;

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
