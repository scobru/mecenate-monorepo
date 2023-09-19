pragma solidity 0.8.19;

interface IMecenateFeedFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function feeds() external view returns (address[] memory);

    function contractCounter() external view returns (uint256);

    function isFeed(address _feed) external view returns (bool);
}
