pragma solidity 0.8.19;

interface IMecenateTier {
    function isValidSubscription(
        address _subscriber
    ) external view returns (bool);

    function subscribe() external payable;

    function fee() external view returns (uint256);
}
