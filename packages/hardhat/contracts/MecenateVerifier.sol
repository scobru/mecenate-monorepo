/**
 * @title MecenateVerifier
 * @dev Contract that verifies user identity using SismoConnect and returns user's vaultId, twitterId and telegramId.
 */
pragma solidity ^0.8.17;
import "./helpers/sismo/SismoConnectLib.sol";

contract MecenateVerifier is SismoConnect {
    bytes16 public appId;

    constructor(bytes16 _appId) SismoConnect(buildConfig(_appId)) {
        appId = _appId;
    }

    function sismoVerify(
        bytes memory sismoConnectResponse
    ) external view returns (bytes memory) {
        require(sismoConnectResponse.length > 0, "empty response");

        // Build authorization requests
        AuthRequest[] memory auths = new AuthRequest[](4);

        auths[0] = buildAuth(AuthType.VAULT);

        auths[1] = buildAuth({
            authType: AuthType.TWITTER,
            isOptional: false,
            isSelectableByUser: false
        });

        auths[2] = buildAuth({
            authType: AuthType.TELEGRAM,
            isOptional: true,
            isSelectableByUser: true
        });

        auths[3] = buildAuth({
            authType: AuthType.GITHUB,
            isOptional: true,
            isSelectableByUser: true
        });

        // Verify the response
        SismoConnectVerifiedResult memory result = verify({
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature({message: abi.encode("I Love Sismo!")})
        });

        bytes memory signedMessage = SismoConnectHelper.getSignedMessage(
            result
        );

        string memory message = abi.decode(signedMessage, (string));

        require(
            keccak256(abi.encodePacked(message)) ==
                keccak256(abi.encodePacked("I Love Sismo!")),
            "Invalid signature"
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

        return (vaultIdBytes);
    }
}
