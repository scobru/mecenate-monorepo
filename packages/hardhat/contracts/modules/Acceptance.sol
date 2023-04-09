// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Acceptance is Data, Events, Staking {
    function acceptPost(
        bytes memory publicKey,
        address _buyer,
        uint256 payment
    ) public virtual {
        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(_buyer),
            "User does not exist"
        );

        uint256 _payment = _addStake(
            tokenERC20Contract,
            _buyer,
            _buyer,
            payment
        );

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
        require(_buyer != address(0), "Buyer address cannot be zero");

        post.postdata.settings.buyer = _buyer;

        post.postdata.settings.buyerPubKey = publicKey;

        post.postdata.escrow.payment = _payment;

        post.postdata.settings.status = Structures.PostStatus.Accepted;

        emit Accepted(post);
    }
}
