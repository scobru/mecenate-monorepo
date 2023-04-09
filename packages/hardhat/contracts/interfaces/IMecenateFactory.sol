pragma solidity 0.8.19;

interface IMecenateFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function contractCounter() external view returns (uint256);

    function museToken() external view returns (address);

    function router() external view returns (address);
}
