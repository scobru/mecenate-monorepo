pragma solidity 0.8.19;

interface IMecenateVault {
    function pay(
        address _to,
        uint256 _amount,
        bytes memory _sismoConnectResponse
    ) external returns (bool);
}
