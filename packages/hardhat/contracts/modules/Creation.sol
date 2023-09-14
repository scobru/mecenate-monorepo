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
        address buyer,
        bytes memory sismoConnectResponse
    ) external payable returns (Structures.Post memory) {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted,
            ,
            uint256 telegramId
        ) = sismoVerify(sismoConnectResponse);

        require(keccak256(vaultIdBytes) == owner, "Not owner");

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "User does not exist"
        );

        if (post.postdata.escrow.stake == 0) {
            require(msg.value > 0, "Stake is required");
        }

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

        postSettingPrivate = Structures.postSettingPrivate({
            seller: userAddressConverted,
            vaultIdSeller: vaultIdBytes,
            sellerTelegramId: telegramId,
            buyer: buyer,
            vaultIdBuyer: ZEROHASH,
            buyerTelegramId: 0
        });

        uint256 stake = _addStake(userAddressConverted, msg.value);

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
            vaultId: keccak256(vaultIdBytes)
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

        Structures.Post memory _post = Structures.Post({
            creator: creator,
            postdata: postdata
        });

        post = _post;

        postCount++;

        emit Created(post);

        return Structures.Post({creator: creator, postdata: postdata});
    }
}
