// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "../library/Structures.sol";

interface IMecenateFeed {
    function getPost() external view returns (Structures.Post memory);

    function getTotalStaked() external view returns (uint256);

    function postCount() external view returns (uint256);

    function acceptPost(
        Structures.Tokens,
        uint256 _amount,
        address _funder,
        address _buyer,
        bool _useStake
    ) external payable;

    function getSellerStake() external view returns (uint256);

    function getBuyerStake() external view returns (uint256);

    function getPaymentRequested() external view returns (uint256);

    function getStakeRequested() external view returns (uint256);

    function getStatus() external view returns (Structures.PostStatus status);

    function getTokenId() external view returns (Structures.Tokens tokenId);

    function getPostId() external view returns (bytes32);

    function getAllPostIds() external view returns (bytes32[] memory);

    function getPostTimestamp(
        bytes32 postId
    ) external view returns (Structures.PostTimestamp memory);

    function owner() external view returns (address);

    function version() external view returns (string memory);

    function getEncryptedPost() external view returns (bytes memory);
}
