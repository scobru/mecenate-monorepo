pragma solidity 0.8.19;
import "../library/Structures.sol";

interface IMecenateUsers {
    function checkifUserExist(bytes32 vaultId) external view returns (bool);

    function getUserData(
        address user
    ) external view returns (Structures.User memory);

    function getUserCount() external view returns (uint256);

    function getUserAt(uint256 index) external view returns (address);

    function getUserAddressAt(uint256 index) external view returns (address);
}
