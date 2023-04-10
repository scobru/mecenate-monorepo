pragma solidity 0.8.19;
import "../library/Structures.sol";

interface IMecenateFeed {
    function getStake(address user) external view returns (uint256);

    function getTotalStaked() external view returns (uint256);

    function getSeller() external view returns (address);

    function getBuyer() external view returns (address);

    function getBuyerPayment() external view returns (uint256);

    function getSellerPayment() external view returns (uint256);

    function postCount() external view returns (uint256);

    function owner() external view returns (address);

    function acceptPost(
        bytes memory publicKey,
        address _buyer,
        uint256 payment
    ) external;

    function tokenERC20Contract()
        external
        view
        returns (Structures.Tokens _token);

    function getTokenAddress(
        Structures.Tokens _token
    ) external view returns (address);

    function getExchageAddress() external view returns (address);
}
