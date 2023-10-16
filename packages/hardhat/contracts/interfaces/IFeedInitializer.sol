pragma solidity 0.8.19;

interface IFeedInitializer {
    function initialize(
        address _factoryContract,
        address _treasuryContract,
        address _verifierContract,
        address _usersModuleContract,
        address _proxyCallContract
    ) external;
}
