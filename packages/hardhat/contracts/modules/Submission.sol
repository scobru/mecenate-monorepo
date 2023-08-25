// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Submission is Events {
    function submitHash(
        bytes memory encryptedKey,
        bytes memory sismoConnectResponse
    ) external virtual {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        require(
            post.creator.vaultId == keccak256(vaultIdBytes),
            "You are not the creator"
        );

        post.postdata.data.encryptedKey = encryptedKey;
        post.postdata.settings.status = Structures.PostStatus.Submitted;
        post.postdata.settings.endTimeStamp =
            block.timestamp +
            post.postdata.settings.duration;

        emit Valid(post);
    }

    function getVaultIdSecret(
        bytes memory sismoConnectResponse
    ) external view returns (bytes32) {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            keccak256(vaultIdBytes) ==
                keccak256(postSettingPrivate.vaultIdBuyer),
            "VaultId does not match"
        );

        require(
            userAddressConverted == postSettingPrivate.buyer,
            "You are not the buyer"
        );

        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        return keccak256(postSettingPrivate.vaultIdSeller);
    }

    function revealData(
        bytes memory decryptedData,
        bytes memory sismoConnectResponse
    ) external virtual returns (bytes memory) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            post.postdata.settings.status == Structures.PostStatus.Finalized,
            "Post is not Finalized"
        );
        require(
            postSettingPrivate.seller == userAddressConverted,
            "You are not the buyer"
        );
        post.postdata.data.decryptedData = decryptedData;
        post.postdata.settings.status = Structures.PostStatus.Revealed;
        return post.postdata.data.decryptedData;
    }
}
