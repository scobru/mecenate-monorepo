pragma solidity 0.8.19;

interface IMecenateDCAFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function dcas() external view returns (address[] memory);

    function contractCounter() external view returns (uint256);
}
