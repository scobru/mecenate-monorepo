// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";

abstract contract Submission is Data, Events {
    function submitHash(bytes memory encryptedKey) public virtual {
        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(msg.sender),
            "User does not exist"
        );
        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        require(post.creator.wallet == msg.sender, "You are not the creator");

        post.postdata.data.encryptedKey = encryptedKey;
        post.postdata.settings.status = Structures.PostStatus.Submitted;
        post.postdata.settings.endTimeStamp =
            block.timestamp +
            post.postdata.settings.duration;

        emit Valid(post);
    }

    function revealData(
        bytes memory decryptedData
    ) public virtual returns (bytes memory) {
        require(
            post.postdata.settings.status == Structures.PostStatus.Finalized,
            "Post is not Finalized"
        );
        require(
            post.postdata.settings.seller == msg.sender,
            "You are not the buyer"
        );
        post.postdata.data.decryptedData = decryptedData;
        post.postdata.settings.status = Structures.PostStatus.Revealed;
        return post.postdata.data.decryptedData;
    }
}
