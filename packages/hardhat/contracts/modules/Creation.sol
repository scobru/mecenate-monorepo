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
        address funder,
        address seller,
        bool useStake
    ) external payable onlyValidTokenID(tokenId) {
        require(msg.sender == owner, "NOT_OWNER");
        require(locked == false, "LOCKED");

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                seller
            ),
            "USER_NOT_EXIST"
        );

        require(
            validStatuses[uint8(post.postdata.settings.status)],
            "INVALID_STATUS"
        );

        require(stakeAmount > 0, "STAKE_AMOUNT_ZERO");

        require(payment > 0, "PAYMENT_ZERO");

        uint256 stake;

        if (useStake) {
            require(
                Deposit._getDeposit(tokenId, seller) >= stakeAmount,
                "STAKE_INCORRECT"
            );

            stake = stakeAmount;
        } else {
            if (tokenId == Structures.Tokens.NaN) {
                require(msg.value == stakeAmount, "WRONG_MSG_VALUE");
            }

            stake = _addStake(tokenId, seller, funder, stakeAmount);
        }

        uint256 duration = postDurationToDays[uint8(postDuration)];

        _changeStatus(Structures.PostStatus.Proposed);

        Structures.User memory creator = IMecenateUsers(
            settings.usersModuleContract
        ).getUserMetadata(seller);

        bytes32 newPostId = keccak256(
            abi.encodePacked(encryptedHash, block.timestamp, creator.evmAddress)
        );

        // Initialize the new Post struct with named arguments for clarity
        Structures.Post memory newPost = Structures.Post({
            creator: creator,
            postdata: Structures.PostData({
                settings: Structures.PostSettings({
                    postType: postType,
                    status: Structures.PostStatus.Proposed,
                    creationTimeStamp: block.timestamp,
                    endTimeStamp: 0,
                    duration: duration,
                    tokenId: tokenId,
                    postId: newPostId
                }),
                escrow: Structures.PostEscrow({
                    buyer: address(0),
                    seller: seller,
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

        // add intto postIds
        addPostId(newPostId);

        settings.postCount++;

        postTimestamps[newPostId] = Structures.PostTimestamp({
            postResult: Structures.PostResult.None,
            creationTimeStamp: block.timestamp,
            endTimeStamp: 0
        });

        emit Created(newPost);
    }
}
