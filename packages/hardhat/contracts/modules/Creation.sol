/**
 * @title Creation
 * @dev This contract is an abstract contract that inherits from Staking contract. It provides a function to create a post with the given parameters. The function requires the user to be the owner of the post and to have a stake. The post can have different durations and types. The function returns the created post.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Staking.sol";

abstract contract Creation is Staking {
    function createPost(
        bytes memory encryptedHash,
        Structures.PostType postType,
        Structures.PostDuration postDuration,
        uint256 payment,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external payable returns (Structures.Post memory) {
        // verify user
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        // get encrypted vault id
        bytes32 encryptedVaultId = keccak256(vaultId);

        require(encryptedVaultId == owner, "Not owner");
        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                encryptedVaultId
            ),
            "User does not exist"
        );

        // check if user has stake
        if (post.postdata.escrow.stake == 0) {
            require(msg.value > 0, "Stake is required");
        }

        // check if post is in waiting status
        require(
            post.postdata.settings.status == Structures.PostStatus.Waiting ||
                post.postdata.settings.status ==
                Structures.PostStatus.Finalized ||
                post.postdata.settings.status ==
                Structures.PostStatus.Revealed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Punished ||
                post.postdata.settings.status ==
                Structures.PostStatus.Proposed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Renounced,
            "Wrong Status"
        );

        // set post settings
        postSettingPrivate = Structures.postSettingPrivate({
            vaultIdSeller: vaultId,
            sellerTwitterId: twitterId,
            sellerTelegramId: telegramId,
            vaultIdBuyer: ZEROHASH,
            buyerTwitterId: 0,
            buyerTelegramId: 0
        });

        // set post escrow
        uint256 stake = _addStake(encryptedVaultId, msg.value);
        uint256 duration;

        // set post duration
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

        // set post data
        Structures.User memory creator = Structures.User({
            vaultId: encryptedVaultId
        });

        Structures.PostData memory postdata = Structures.PostData({
            settings: Structures.PostSettings({
                postType: Structures.PostType(postType),
                status: Structures.PostStatus.Proposed,
                creationTimeStamp: block.timestamp,
                endTimeStamp: 0,
                duration: duration
            }),
            escrow: Structures.PostEscrow({
                stake: stake,
                payment: payment,
                punishment: 0,
                penality: 0
            }),
            data: Structures.PostEncryptedData({
                encryptedData: encryptedHash,
                encryptedKey: ZEROHASH,
                decryptedData: ZEROHASH
            })
        });

        // set post
        Structures.Post memory _post = Structures.Post({
            creator: creator,
            postdata: postdata
        });

        post = _post;

        // increment post count
        postCount++;

        emit Created(post);

        return Structures.Post({creator: creator, postdata: postdata});
    }
}
