/**
 * @title Submission
 * @dev This contract is an abstract contract that defines the functions for submitting and revealing data for a post. It inherits from the Events contract.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Submission is Events {
    function submitHash(bytes memory encryptedKey) external virtual {
        require(msg.sender == post.postdata.escrow.seller, "NOT_SELLER");

        Structures.PostStatus currentStatus = post.postdata.settings.status;
        require(
            validStatuses[uint8(currentStatus)] &&
                (currentStatus == Structures.PostStatus.Accepted ||
                    currentStatus == Structures.PostStatus.Submitted),
            "WRONG_STATUS"
        );

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                msg.sender
            ),
            "User does not exist"
        );

        require(post.creator.evmAddress == msg.sender, "NOT_SELLER");

        _changeStatus(Structures.PostStatus.Submitted);

        post.postdata.data.encryptedKey = encryptedKey;
        post.postdata.settings.status = Structures.PostStatus.Submitted;
        post.postdata.settings.endTimeStamp =
            block.timestamp +
            post.postdata.settings.duration;

        emit Valid(post);
    }

    function revealData(
        bytes memory decryptedData
    ) external virtual returns (bytes memory) {
        Structures.PostStatus currentStatus = post.postdata.settings.status;
        require(
            validStatuses[uint8(currentStatus)] &&
                (currentStatus == Structures.PostStatus.Submitted ||
                    currentStatus == Structures.PostStatus.Revealed ||
                    currentStatus == Structures.PostStatus.Finalized),
            "INVALID_STATUS"
        );

        require(
            msg.sender != post.postdata.escrow.seller,
            "YOU_ARE_THE_SELLER"
        );

        require(
            currentStatus == Structures.PostStatus.Finalized,
            "NOT_FINALIZED"
        );

        post.postdata.data.decryptedData = decryptedData;
        post.postdata.settings.status = Structures.PostStatus.Revealed;

        emit MadePublic(post);

        return decryptedData;
    }
}
