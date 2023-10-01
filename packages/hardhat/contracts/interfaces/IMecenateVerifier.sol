pragma solidity 0.8.19;

interface IMecenateVerifier {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external view returns (bytes memory, uint256, uint256, bytes memory);
}
