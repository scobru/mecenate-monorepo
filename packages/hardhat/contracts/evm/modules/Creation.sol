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
        uint256 stakeAmount,
        Structures.Tokens tokenId,
        address funder
    )
        external
        payable
        onlyValidTokenID(tokenId)
        returns (Structures.Post memory)
    {
        require(msg.sender == owener);

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                msg.sender
            ),
            "USER_NOT_EXIST"
        );

        require(
            validStatuses[uint8(post.postdata.settings.status)],
            "INVALID_STATUS"
        );

        require(stakeAmount > 0, "STAKE_AMOUNT_ZERO");

        uint256 duration = postDurationToDays[uint8(postDuration)];

        uint256 stake = _addStake(tokenId, msg.sender, funder, stakeAmount);

        // Change status to Proposed
        _changeStatus(Structures.PostStatus.Proposed);

        // Initialize the new Post struct with named arguments for clarity
        Structures.Post memory newPost = Structures.Post({
            creator: Structures.User({vaultId: encryptedVaultId}),
            postdata: Structures.PostData({
                settings: Structures.PostSettings({
                    postType: postType,
                    status: Structures.PostStatus.Proposed,
                    creationTimeStamp: block.timestamp,
                    endTimeStamp: 0,
                    duration: duration,
                    tokenId: tokenId
                }),
                escrow: Structures.PostEscrow({
                    stake: stake,
                    payment: payment,
                    punishment: 0,
                    penalty: 0
                }),
                data: Structures.PostEncryptedData({
                    encryptedData: encryptedHash,
                    encryptedKey: ZEROHASH,
                    decryptedData: ZEROHASH
                })
            })
        });

        // Update storage and emit event
        post = newPost;

        settings.postCount++;

        postSettingPrivate.sellerAddress = msg.sender;

        emit Created(newPost);

        return newPost;
    }
}
