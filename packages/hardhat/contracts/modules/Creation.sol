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
            address userAddressConverted
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
            usersModuleContract != address(0),
            "Users module contract not set"
        );

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
            "Not Wating or Finalized or Revealed or Proposed"
        );

        postSettingPrivate = Structures.postSettingPrivate({
            seller: userAddressConverted,
            vaultIdSeller: keccak256(vaultIdBytes),
            buyer: buyer,
            vaultIdBuyer: 0x00
        });

        _addStake(userAddressConverted, msg.value);

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
                stake: msg.value,
                payment: payment,
                punishment: 0,
                buyerPunishment: 0
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

    function storeEncodedSymmetricKey(
        bytes memory _encodedSymKey,
        bytes memory sismoConnectResponse
    ) external {
        (, , , address userAddressConverted) = sismoVerify(
            sismoConnectResponse
        );

        require(
            postSettingPrivate.seller == userAddressConverted,
            "You are not the seller"
        );

        encodedSymKey = _encodedSymKey;
    }

    function getEncodedSymmetricKey(
        bytes memory sismoConnectResponse
    ) external view returns (bytes memory) {
        (, , , address userAddressConverted) = sismoVerify(
            sismoConnectResponse
        );

        require(
            postSettingPrivate.seller == userAddressConverted,
            "You are not the seller"
        );
        return encodedSymKey;
    }
}
