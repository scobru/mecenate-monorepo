pragma solidity 0.8.19;

interface IProxyCall {
    function proxyCallAndReturnAddress(
        address externalContract,
        bytes memory callData
    ) external returns (address payable result);
}
