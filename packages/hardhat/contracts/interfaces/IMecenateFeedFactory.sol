pragma solidity 0.8.19;

interface IMecenateFeedFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function feeds() external view returns (address[] memory);

    function contractCounter() external view returns (uint256);

    function isFeed(address _feed) external view returns (bool);

    function museToken() external view returns (address);

    function wethToken() external view returns (address);

    function daiToken() external view returns (address);

    function router() external view returns (address);

    function getRouterFee(uint8 tokenId) external view returns (uint24);

    function burnEnabled() external view returns (bool);

    function version() external view returns (string memory);
}
