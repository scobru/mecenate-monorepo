/**
 * @title MecenateVerifier
 * @dev Contract that verifies user identity using SismoConnect and returns user's vaultId, twitterId and telegramId.
 */
pragma solidity ^0.8.17;
import "./helpers/SismoConnectLib.sol";

contract MecenateVerifier is SismoConnect {
    bytes16 public appId;

    constructor(bytes16 _appId) SismoConnect(buildConfig(_appId)) {
        appId = _appId;
    }

    function sismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external view returns (bytes memory, uint256, uint256, bytes memory) {
        require(sismoConnectResponse.length > 0, "empty response");

        // Build authorization requests
        AuthRequest[] memory auths = new AuthRequest[](3);

        auths[0] = buildAuth(AuthType.VAULT);

        auths[1] = buildAuth({
            authType: AuthType.TWITTER,
            isOptional: true,
            isSelectableByUser: true
        });

        auths[2] = buildAuth({
            authType: AuthType.TELEGRAM,
            isOptional: true,
            isSelectableByUser: true
        });

        // Verify the response
        SismoConnectVerifiedResult memory result = verify({
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature({message: abi.encode(_to, _nonce)})
        });

        bytes memory signedMessage = SismoConnectHelper.getSignedMessage(
            result
        );

        // Store the verified auths
        VerifiedAuth[] memory _verifiedAuths = new VerifiedAuth[](
            result.auths.length
        );

        for (uint256 i = 0; i < result.auths.length; i++) {
            _verifiedAuths[i] = result.auths[i];
        }

        // Get the vaultId of the user
        // --> vaultId = hash(userVaultSecret, appId)
        uint256 vaultId = SismoConnectHelper.getUserId(result, AuthType.VAULT);

        // Convert the vaultId to bytes
        bytes memory vaultIdBytes = abi.encodePacked(vaultId);

        // Get the userId of the user
        uint256 twitterId = 0;
        uint256 telegramId = 0;

        for (uint256 i = 0; i < _verifiedAuths.length; i++) {
            if (_verifiedAuths[i].authType == AuthType.TWITTER) {
                twitterId = SismoConnectHelper.getUserId(
                    result,
                    AuthType.TWITTER
                );
            } else if (_verifiedAuths[i].authType == AuthType.TELEGRAM) {
                telegramId = SismoConnectHelper.getUserId(
                    result,
                    AuthType.TELEGRAM
                );
            }
        }

        return (vaultIdBytes, twitterId, telegramId, signedMessage);
    }
}
