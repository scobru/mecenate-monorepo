pragma solidity ^0.8.17;

import "./helpers/SismoConnectLib.sol";

contract MecenateVerifier is SismoConnect {
    bytes16 public appId;

    constructor(bytes16 _appId) SismoConnect(buildConfig(_appId)) {
        appId = _appId;
    }

    function sismoVerify(
        bytes memory sismoConnectResponse
    )
        external
        view
        returns (uint256, bytes memory, uint256, address, uint256, uint256)
    {
        require(sismoConnectResponse.length > 0, "empty response");

        AuthRequest[] memory auths = new AuthRequest[](4);

        auths[0] = buildAuth(AuthType.VAULT);

        auths[1] = buildAuth(AuthType.EVM_ACCOUNT);

        auths[2] = buildAuth(AuthType.TWITTER);

        auths[3] = buildAuth({
            authType: AuthType.TELEGRAM,
            isOptional: true,
            isSelectableByUser: true
        });

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

        uint256 twitterId = SismoConnectHelper.getUserId(
            result,
            AuthType.TWITTER
        );

        uint256 telegramId = SismoConnectHelper.getUserId(
            result,
            AuthType.TELEGRAM
        );

        return (
            vaultId,
            vaultIdBytes,
            userAddress,
            userAddressConverted,
            twitterId,
            telegramId
        );
    }
}
