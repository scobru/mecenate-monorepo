// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Creation is Data, Events, Staking {
    function createPost(
        bytes memory encryptedHash,
        Structures.PostType postType,
        Structures.PostDuration postDuration,
        address buyer,
        uint256 payment
    ) external payable returns (Structures.Post memory) {
        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(msg.sender),
            "User does not exist"
        );

        require(
            msg.value > 0 || post.postdata.escrow.stake > 0,
            "Payment is required"
        );

        require(
            usersModuleContract != address(0),
            "Users module contract not set"
        );

        require(identityContract != address(0), "Identity contract not set");

        require(
            post.postdata.settings.status == Structures.PostStatus.Waiting ||
                post.postdata.settings.status ==
                Structures.PostStatus.Finalized ||
                post.postdata.settings.status ==
                Structures.PostStatus.Revealed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Punished ||
                post.postdata.settings.status == Structures.PostStatus.Proposed,
            "Not Wating or Finalized or Revealed or Proposed"
        );

        uint256 stake = _addStake(msg.sender, msg.value);

        uint256 duration;

        if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.OneDay
        ) {
            duration = 1 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.ThreeDays
        ) {
            duration = 3 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.OneWeek
        ) {
            duration = 7 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.TwoWeeks
        ) {
            duration = 14 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.OneMonth
        ) {
            duration = 30 days;
        }

        Structures.User memory creator = Structures.User({
            mecenateID: IMecenateIdentity(identityContract).identityByAddress(
                msg.sender
            ),
            wallet: msg.sender,
            publicKey: bytes(
                IMecenateUsers(usersModuleContract)
                    .getUserData(msg.sender)
                    .publicKey
            )
        });

        Structures.PostData memory postdata = Structures.PostData({
            settings: Structures.PostSettings({
                postType: Structures.PostType(postType),
                status: Structures.PostStatus.Proposed,
                buyer: buyer,
                buyerPubKey: "0x00",
                seller: msg.sender,
                creationTimeStamp: block.timestamp,
                endTimeStamp: 0,
                duration: duration
            }),
            escrow: Structures.PostEscrow({
                stake: stake,
                payment: payment,
                punishment: 0,
                buyerPunishment: 0
            }),
            data: Structures.PostEncryptedData({
                encryptedData: encryptedHash,
                encryptedKey: "0x00",
                decryptedData: "0x00"
            })
        });

        Structures.Post memory _post = Structures.Post({
            creator: creator,
            postdata: postdata
        });

        post = _post;

        postCount++;

        emit Created(post);

        return Structures.Post({creator: creator, postdata: postdata});
    }

    function changeUsersModuleContract(
        address _usersModuleContract
    ) external onlyOwner {
        usersModuleContract = _usersModuleContract;
    }

    function changeIdentityContract(
        address _identityContract
    ) external onlyOwner {
        identityContract = _identityContract;
    }
}
