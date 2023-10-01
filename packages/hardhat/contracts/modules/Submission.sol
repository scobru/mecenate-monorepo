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
        address _to,
        bytes32 _nonce
    ) external virtual {
        onlyVault();

        Structures.PostStatus currentStatus = post.postdata.settings.status;
        require(
            validStatuses[uint8(currentStatus)] &&
                (currentStatus == Structures.PostStatus.Accepted ||
                    currentStatus == Structures.PostStatus.Submitted),
            "WRONG_STATUS"
        );

        (bytes memory vaultId, , , ) = _verifyNonce(
            sismoConnectResponse,
            _to,
            _nonce
        );
        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                encryptedVaultId
            ),
            "User does not exist"
        );
        require(post.creator.vaultId == encryptedVaultId, "NOT_SELLER");

        _changeStatus(Structures.PostStatus.Submitted);

        settings.encodedSymKey = post.postdata.data.encryptedKey = encryptedKey;
        post.postdata.settings.status = Structures.PostStatus.Submitted;
        post.postdata.settings.endTimeStamp =
            block.timestamp +
            post.postdata.settings.duration;

        emit Valid(post);
    }

    function revealData(
        bytes memory decryptedData,
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external virtual returns (bytes memory) {
        onlyVault();

        Structures.PostStatus currentStatus = post.postdata.settings.status;
        require(
            validStatuses[uint8(currentStatus)] &&
                (currentStatus == Structures.PostStatus.Submitted ||
                    currentStatus == Structures.PostStatus.Revealed ||
                    currentStatus == Structures.PostStatus.Finalized),
            "INVALID_STATUS"
        );

        (bytes memory vaultId, , , ) = _verifyNonce(
            sismoConnectResponse,
            _to,
            _nonce
        );
        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            encryptedVaultId != keccak256(postSettingPrivate.vaultIdSeller),
            "YOU_ARE_THE_SELLER"
        );
        require(
            currentStatus == Structures.PostStatus.Finalized,
            "NOT_FINALIZED"
        );

        post.postdata.data.decryptedData = decryptedData;
        post.postdata.settings.status = Structures.PostStatus.Revealed;

        emit MadePublic(post);

        return decryptedData;
    }
}
