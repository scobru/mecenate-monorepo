pragma solidity 0.8.19;

interface IMecenateVerifier {
    function sismoVerify(
        bytes memory sismoConnectResponse
    ) external view returns (bytes memory);
}
