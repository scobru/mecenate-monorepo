// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Acceptance is Data, Events, Staking {
    function acceptPost(
        bytes memory sismoConnectResponse
    ) public payable virtual {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(vaultId),
            "User does not exist"
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

        post.postdata.settings.buyer = userAddressConverted;
        post.postdata.settings.buyerPubKey = vaultIdBytes;
        post.postdata.escrow.payment = _payment;
        post.postdata.settings.status = Structures.PostStatus.Accepted;

        emit Accepted(post);
    }
}
