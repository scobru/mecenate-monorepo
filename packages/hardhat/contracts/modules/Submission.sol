/**
 * @title Submission
 * @dev This contract is an abstract contract that defines the functions for submitting and revealing data for a post. It inherits from the Events contract.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Submission is Events {
    function submitHash(
        bytes memory encryptedKey,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external virtual {
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

        bytes32 encryptedVaultId = keccak256(vaultId);

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
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external virtual returns (bytes memory) {
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

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            post.postdata.settings.status == Structures.PostStatus.Finalized,
            "Post is not Finalized"
        );
        post.postdata.data.decryptedData = decryptedData;

        post.postdata.settings.status = Structures.PostStatus.Revealed;

        return post.postdata.data.decryptedData;
    }
}
