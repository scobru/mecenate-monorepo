// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Submission is Events {
    function submitHash(
        bytes memory encryptedKey,
        bytes32 encryptedVaultId
    ) external virtual {
        require(
            postSettingPrivate.vaultIdSeller == encryptedVaultId,
            "VaultId does not match"
        );

        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                encryptedVaultId
            ),
            "user does not exist"
        );

        require(
            post.creator.vaultId == encryptedVaultId,
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
            keccak256(vaultIdBytes) == postSettingPrivate.vaultIdBuyer,
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

        return postSettingPrivate.vaultIdSeller;
    }

    function revealData(
        bytes memory decryptedData,
        bytes32 encryptedVaultId
    ) external virtual returns (bytes memory) {
        require(
            postSettingPrivate.vaultIdSeller == encryptedVaultId,
            "VaultId does not match"
        );

        require(
            post.postdata.settings.status == Structures.PostStatus.Finalized,
            "Post is not Finalized"
        );
        post.postdata.data.decryptedData = decryptedData;
        post.postdata.settings.status = Structures.PostStatus.Revealed;
        return post.postdata.data.decryptedData;
    }
}
