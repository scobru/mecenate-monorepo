pragma solidity 0.8.19;

interface IMecenateTierFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function tiers() external view returns (address[] memory);

    function contractCounter() external view returns (uint256);
}
