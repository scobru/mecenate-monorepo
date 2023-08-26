pragma solidity 0.8.19;

interface IMecenateFeed {
    function getStake(address user) external view returns (uint256);

    function getTotalStaked() external view returns (uint256);

    function getSeller() external view returns (address);

    function getBuyer() external view returns (address);

    function getBuyerPayment() external view returns (uint256);

    function getSellerStake() external view returns (uint256);

    function getBuyerStake() external view returns (uint256);

    function getSellerDeposit() external view returns (uint256);

    function postCount() external view returns (uint256);

    function owner() external view returns (address);

    function acceptPost(bytes memory sismoConnectResponse) external payable;

    function getPaymentRequested() external view returns (uint256);

    function getStakeRequested() external view returns (uint256);
}
