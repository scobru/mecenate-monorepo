// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Submission is Events {
    function submitHash(
        bytes memory encryptedKey,
        bytes32 encryptedVaultId
    ) external virtual {
        require(
            keccak256(postSettingPrivate.vaultIdSeller) == encryptedVaultId,
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

        encodedSymKey = encryptedKey;
        post.postdata.data.encryptedKey = encryptedKey;
        post.postdata.settings.status = Structures.PostStatus.Submitted;
        post.postdata.settings.endTimeStamp =
            block.timestamp +
            post.postdata.settings.duration;

        emit Valid(post);
    }

    function revealData(
        bytes memory decryptedData,
        bytes32 encryptedVaultId
    ) external virtual returns (bytes memory) {
        require(
            keccak256(postSettingPrivate.vaultIdSeller) == encryptedVaultId,
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

    function getVaultIdSecret(
        bytes32 encryptedVaultId
    ) external view virtual returns (bytes memory) {
        require(
            keccak256(postSettingPrivate.vaultIdBuyer) == encryptedVaultId,
            "VaultId does not match"
        );

        return postSettingPrivate.vaultIdSeller;
    }
}
