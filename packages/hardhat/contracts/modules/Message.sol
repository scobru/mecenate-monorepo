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

    /**
     * @dev Function to get the telegramIds.
     * @return telegram ids.
     */
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

    /**
     * @dev Function to get the last message for the buyer.
     */

    function write(
        bytes32 encryptedVaultId,
        bytes memory encodeMessage
    ) external {
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

    /**
     *
     * @dev Function to get the last message for the buyer.
     * @return last message.
     */
    function getMessage(
        bytes32 encryptedVaultId
    ) external view returns (bytes memory) {
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

    /**
     * @dev Function to get the hashed vault id.
     * @param encryptedVaultId The encrypted vault id.
     */
    function getHashedVaultId(
        bytes32 encryptedVaultId
    ) external view returns (bytes32) {
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
