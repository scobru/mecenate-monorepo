// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Events.sol";
import "./Staking.sol";

abstract contract Acceptance is Events, Staking {
    function acceptPost(
        bytes memory sismoConnectResponse
    ) external payable virtual {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        uint256 _payment = _addStake(userAddressConverted, msg.value);

        if (post.postdata.escrow.payment > 0) {
            require(
                _payment >= post.postdata.escrow.payment,
                "Not enough buyer payment"
            );
        } else {
            require(_payment > 0, "Payment is required");
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

        post.postdata.escrow.payment = post.postdata.escrow.payment;

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
