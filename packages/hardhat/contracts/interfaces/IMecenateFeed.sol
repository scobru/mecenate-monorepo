pragma solidity 0.8.19;

import "../library/Structures.sol";

interface IMecenateFeed {
    function getTotalStaked() external view returns (uint256);

    function postCount() external view returns (uint256);

    function acceptPost(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce,
        Structures.Tokens,
        uint256 _amount
    ) external payable;

    function getSellerStake() external view returns (uint256);

    function getBuyerStake() external view returns (uint256);

    function getPaymentRequested() external view returns (uint256);

    function getStakeRequested() external view returns (uint256);

    function getStatus() external view returns (Structures.PostStatus status);

    function getTokenId() external view returns (Structures.Tokens tokenId);

    function owner() external view returns (bytes32);
}
