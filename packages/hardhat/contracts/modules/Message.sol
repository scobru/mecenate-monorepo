// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Events.sol";

abstract contract Message is Events {
    function _isSellerOrBuyer(
        bytes32 encryptedVaultId
    ) internal view returns (bool) {
        bytes32 sellerVaultIdHash = keccak256(postSettingPrivate.vaultIdSeller);
        bytes32 buyerVaultIdHash = keccak256(postSettingPrivate.vaultIdBuyer);
        return (encryptedVaultId == sellerVaultIdHash ||
            encryptedVaultId == buyerVaultIdHash);
    }

    function getVaultIdSecret(
        bytes32 encryptedVaultId
    ) external view virtual returns (bytes memory) {
        require(_isSellerOrBuyer(encryptedVaultId), "NOT_THE_SELLER_OR_BUYER");
        return postSettingPrivate.vaultIdSeller;
    }

    function getTelegramIds(
        bytes32 encryptedVaultId
    ) external view returns (uint256, uint256) {
        require(
            postSettingPrivate.buyerTelegramId != 0,
            "NO_TELEGRAM_ID_FOR_BUYER"
        );

        require(
            postSettingPrivate.sellerTelegramId != 0,
            "NO_TELEGRAM_ID_FOR_SELLER"
        );

        require(
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer),
            "NOT_THE_SELLER_OR_BUYER"
        );

        return (
            uint160(postSettingPrivate.buyerTelegramId),
            uint160(postSettingPrivate.sellerTelegramId)
        );
    }

    function getHashedVaultId(
        bytes memory sismoConnectResponse,
        address _to,
        address _from
    ) external virtual returns (bytes32) {
        (bytes memory vaultId, , ) = _verifyNonce(
            sismoConnectResponse,
            _to,
            _from
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer),
            "NOT_SELLER_OR_BUYER"
        );

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)) {
            return keccak256(postSettingPrivate.vaultIdSeller);
        } else {
            return keccak256(postSettingPrivate.vaultIdBuyer);
        }
    }

    function write(
        bytes memory encodeMessage,
        bytes32 encryptedVaultId
    ) external virtual {
        require(_isSellerOrBuyer(encryptedVaultId), "NOT_THE_SELLER_OR_BUYER");
        _writeMessage(encodeMessage, encryptedVaultId);
    }

    function _writeMessage(
        bytes memory encodeMessage,
        bytes32 encryptedVaultId
    ) internal {
        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)) {
            settings.lastMessageForBuyer = encodeMessage;
        } else {
            settings.lastMessageForSeller = encodeMessage;
        }
    }

    function getMessage(
        bytes memory sismoConnectResponse,
        address _to,
        address _from
    ) external virtual returns (bytes memory) {
        bytes32 encryptedVaultId = _getEncryptedVaultId(
            sismoConnectResponse,
            _to,
            _from
        );
        require(_isSellerOrBuyer(encryptedVaultId), "NOT_THE_SELLER_OR_BUYER");
        return _getMessage(encryptedVaultId);
    }

    function _getMessage(
        bytes32 encryptedVaultId
    ) internal view returns (bytes memory) {
        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)) {
            return settings.lastMessageForBuyer;
        } else {
            return settings.lastMessageForSeller;
        }
    }

    function _getEncryptedVaultId(
        bytes memory sismoConnectResponse,
        address _to,
        address _from
    ) internal virtual returns (bytes32) {
        (bytes memory vaultId, , ) = _verifyNonce(
            sismoConnectResponse,
            _to,
            _from
        );
        return keccak256(vaultId);
    }
}
