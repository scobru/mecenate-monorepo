pragma solidity 0.8.19;

import "../library/Structures.sol";

interface IMecenateFeed {
    function getTotalStaked() external view returns (uint256);

    function postCount() external view returns (uint256);

    function acceptPost(
        Structures.Tokens,
        uint256 _amount,
        address _from
    ) external payable;

    function getSellerStake() external view returns (uint256);

    function getBuyerStake() external view returns (uint256);

    function getPaymentRequested() external view returns (uint256);

    function getStakeRequested() external view returns (uint256);

    function getStatus() external view returns (Structures.PostStatus status);

    function getTokenId() external view returns (Structures.Tokens tokenId);

    function owner() external view returns (address);

    function version() external view returns (string memory);
}
