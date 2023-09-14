// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {RequestBuilder, SismoConnectRequest, SismoConnectResponse, SismoConnectConfig} from "./utils/RequestBuilder.sol";
import {AuthRequestBuilder, AuthRequest, Auth, VerifiedAuth, AuthType} from "./utils/AuthRequestBuilder.sol";
import {ClaimRequestBuilder, ClaimRequest, Claim, VerifiedClaim, ClaimType} from "./utils/ClaimRequestBuilder.sol";
import {SignatureBuilder, SignatureRequest, Signature} from "./utils/SignatureBuilder.sol";
import {VaultConfig} from "./utils/Structs.sol";
import {ISismoConnectVerifier, SismoConnectVerifiedResult} from "./interfaces/ISismoConnectVerifier.sol";
import {IAddressesProvider} from "./interfaces/IAddressesProvider.sol";
import {SismoConnectHelper} from "./utils/SismoConnectHelper.sol";

contract SismoConnect {
    uint256 public constant SISMO_CONNECT_LIB_VERSION = 2;

    IAddressesProvider public constant ADDRESSES_PROVIDER_V2 =
        IAddressesProvider(0x3Cd5334eB64ebBd4003b72022CC25465f1BFcEe6);

    ISismoConnectVerifier immutable _sismoConnectVerifier;

    // external libraries
    AuthRequestBuilder immutable _authRequestBuilder;
    ClaimRequestBuilder immutable _claimRequestBuilder;
    SignatureBuilder immutable _signatureBuilder;
    RequestBuilder immutable _requestBuilder;

    // config
    bytes16 public immutable APP_ID;
    bool public immutable IS_IMPERSONATION_MODE;

    constructor(SismoConnectConfig memory _config) {
        APP_ID = _config.appId;
        IS_IMPERSONATION_MODE = _config.vault.isImpersonationMode;

        _sismoConnectVerifier = ISismoConnectVerifier(
            ADDRESSES_PROVIDER_V2.get(string("sismoConnectVerifier-v1.2"))
        );
        // external libraries
        _authRequestBuilder = AuthRequestBuilder(
            ADDRESSES_PROVIDER_V2.get(string("authRequestBuilder-v1.1"))
        );
        _claimRequestBuilder = ClaimRequestBuilder(
            ADDRESSES_PROVIDER_V2.get(string("claimRequestBuilder-v1.1"))
        );
        _signatureBuilder = SignatureBuilder(
            ADDRESSES_PROVIDER_V2.get(string("signatureBuilder-v1.1"))
        );
        _requestBuilder = RequestBuilder(
            ADDRESSES_PROVIDER_V2.get(string("requestBuilder-v1.1"))
        );
    }

    // public function because it needs to be used by this contract and can be used by other contracts
    function config() public view returns (SismoConnectConfig memory) {
        return buildConfig(APP_ID);
    }

    function buildConfig(
        bytes16 appId
    ) internal pure returns (SismoConnectConfig memory) {
        SismoConnectConfig memory result = SismoConnectConfig({
            appId: appId,
            vault: buildVaultConfig()
        });
        require(appId != bytes16(0), "appId cannot be empty");
        require(
            result.vault.isImpersonationMode == false,
            "impersonation mode is not supported"
        );
        return result;
    }

    function buildVaultConfig() internal pure returns (VaultConfig memory) {
        return VaultConfig({isImpersonationMode: false});
    }

    function verify(
        bytes memory responseBytes,
        AuthRequest[] memory auths,
        SignatureRequest memory signature
    ) internal view returns (SismoConnectVerifiedResult memory) {
        SismoConnectResponse memory response = abi.decode(
            responseBytes,
            (SismoConnectResponse)
        );
        SismoConnectRequest memory request = buildRequest(auths, signature);
        return _sismoConnectVerifier.verify(response, request, config());
    }

    function buildAuth(
        AuthType authType,
        bool isOptional,
        bool isSelectableByUser
    ) internal view returns (AuthRequest memory) {
        return
            _authRequestBuilder.build(authType, isOptional, isSelectableByUser);
    }

    function buildAuth(
        AuthType authType
    ) internal view returns (AuthRequest memory) {
        return _authRequestBuilder.build(authType);
    }

    function buildSignature(
        bytes memory message
    ) internal view returns (SignatureRequest memory) {
        return _signatureBuilder.build(message);
    }

    function buildRequest(
        AuthRequest[] memory auths,
        SignatureRequest memory signature
    ) internal view returns (SismoConnectRequest memory) {
        return _requestBuilder.build(auths, signature);
    }

    function _GET_EMPTY_SIGNATURE_REQUEST()
        internal
        view
        returns (SignatureRequest memory)
    {
        return _signatureBuilder.buildEmpty();
    }
}
