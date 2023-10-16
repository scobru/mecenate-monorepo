pragma solidity 0.8.19;

interface IMecenateVerifier {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        address _from
    ) external view returns (bytes memory, uint256, uint256);
}
