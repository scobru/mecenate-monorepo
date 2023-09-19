pragma solidity 0.8.19;

interface IMecenateVerifier {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external view returns (bytes memory, uint256, uint256, bytes memory);
}
