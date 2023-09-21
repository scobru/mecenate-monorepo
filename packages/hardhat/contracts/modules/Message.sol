/**
 * @title Submission
 * @dev This contract is an abstract contract that defines the functions for submitting and revealing data for a post. It inherits from the Events contract.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Message is Events {
    function getVaultIdSecret(
        bytes32 encryptedVaultId
    ) external view virtual returns (bytes memory) {
        require(
            keccak256(postSettingPrivate.vaultIdBuyer) == encryptedVaultId,
            "VaultId does not match"
        );

        return postSettingPrivate.vaultIdSeller;
    }

    function getTelegramIds(
        bytes32 encryptedVaultId
    ) external view returns (uint256, uint256) {
        require(
            postSettingPrivate.buyerTelegramId != 0,
            "FEEDS: No telegram id for Buyer"
        );

        require(
            postSettingPrivate.sellerTelegramId != 0,
            "FEEDS: No telegram id for Seller"
        );

        require(
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer),
            "FEEDS: You are not the seller or the buyer"
        );

        return (
            uint160(postSettingPrivate.buyerTelegramId),
            uint160(postSettingPrivate.sellerTelegramId)
        );
    }

    function write(
        bytes memory encodeMessage,
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
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer),
            "FEEDS: You are not the seller or the buyer"
        );

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)) {
            lastMessageForBuyer = encodeMessage;
        } else {
            lastMessageForSeller = encodeMessage;
        }
    }

    function getMessage(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external virtual returns (bytes memory) {
        // verify user
        (
            bytes memory vaultId,
            ,
            ,
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
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer),
            "FEEDS: You are not the seller or the buyer"
        );

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)) {
            return lastMessageForBuyer;
        } else {
            return lastMessageForSeller;
        }
    }

    function getHashedVaultId(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external virtual returns (bytes32) {
        // verify user
        (
            bytes memory vaultId,
            ,
            ,
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
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer),
            "FEEDS: You are not the seller or the buyer"
        );

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)) {
            return keccak256(postSettingPrivate.vaultIdSeller);
        } else {
            return keccak256(postSettingPrivate.vaultIdBuyer);
        }
    }
}
