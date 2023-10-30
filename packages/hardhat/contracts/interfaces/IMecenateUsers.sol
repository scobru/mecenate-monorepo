// SPDX-License-Identifier: MIT
import "../library/Structures.sol";

interface IMecenateUsers {
    function registerUser(bytes memory metadata) external;

    function getUsers() external view returns (address[] memory);

    function getUserCount() external view returns (uint256);

    function getUserAt(uint256 index) external view returns (address);

    function checkifUserExist(address userAddress) external view returns (bool);

    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    function getUserMetadata(
        address userAddress
    ) external view returns (Structures.User memory);

    function getUserPublicKey(
        address userAddress
    ) external view returns (bytes memory);
}
