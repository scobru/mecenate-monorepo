pragma solidity ^0.8.17;

import "./helpers/SismoConnectLib.sol";

contract MecenateVerifier is SismoConnect {
    constructor(bytes16 _appId) SismoConnect(buildConfig(_appId)) {}

    function sismoVerify(
        bytes memory sismoConnectResponse
    ) external view returns (uint256, bytes memory, uint256, address) {
        AuthRequest[] memory auths = new AuthRequest[](2);
        auths[0] = buildAuth(AuthType.VAULT);
        auths[1] = buildAuth(AuthType.EVM_ACCOUNT);

        SismoConnectVerifiedResult memory result = verify({
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature({message: "I love Sismo!"})
        });

        // --> vaultId = hash(userVaultSecret, appId)
        uint256 vaultId = SismoConnectHelper.getUserId(result, AuthType.VAULT);
        bytes memory vaultIdBytes = abi.encodePacked(vaultId);

        uint256 userAddress = SismoConnectHelper.getUserId(
            result,
            AuthType.EVM_ACCOUNT
        );

        address userAddressConverted = address(uint160(userAddress));

        return (vaultId, vaultIdBytes, userAddress, userAddressConverted);
    }
}
