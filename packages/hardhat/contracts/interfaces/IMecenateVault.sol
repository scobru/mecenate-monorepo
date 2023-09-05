pragma solidity 0.8.19;

interface IMecenateVault {
    function pay(
        address _to,
        uint256 _amount,
        bytes32 _commitment
    ) external returns (bool);

    function deposit(bytes calldata sismoConnectResponse) external payable;
}
