pragma solidity 0.8.19;
import "../library/Structures.sol";

interface IMecenateUsers {
    function checkifUserExist(uint user) external view returns (bool);

    function getUserData(
        address user
    ) external view returns (Structures.User memory);

    function getUserCount() external view returns (uint256);
}
