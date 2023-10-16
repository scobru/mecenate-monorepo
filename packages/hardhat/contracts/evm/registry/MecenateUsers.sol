/**
 * @title MecenateUsers
 * @dev This contract manages the registration of users in the Mecenate platform.
 * It uses the IMecenateVerifier interface to verify user information and adds the user to a set of registered users.
 * The contract also provides functions to retrieve user information and to change the treasury and verifier contracts.
 */
pragma solidity 0.8.19;

// import enumerable address set from openzeppelin
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../library/SismoStructs.sol";

contract MecenateUsers is Ownable {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _users;

    Structures.User private _metadata;

    event UserRegistered(address vaultId);

    address public verifierContract;

    address public treasuryContract;

    mapping(bytes32 => string) public userNames;

    constructor(address _verifierContract, address _treasuryContract) {
        verifierContract = _verifierContract;

        treasuryContract = _treasuryContract;
    }

    function changeTreasury(address _treasury) external onlyOwner {
        treasuryContract = _treasury;
    }

    function changeVerifier(address _verifier) external onlyOwner {
        verifierContract = _verifier;
    }

    function registerUser(string memory _username) public {
        userNames[msg.sender] = _username;

        // check if user exists
        require(!_users.contains(msg.sender), "USER_ALREADY_EXISTS");

        // add user
        _users.add(msg.sender);

        // emit event
        emit UserRegistered(msg.sender);
    }

    function changeUserName(string memory _username) external {
        require(_users.contains(msg.sender), "USER_ALREADY_EXISTS");

        userNames[msg.sender] = _username;
    }

    function getUserName(address _user) public view returns (string memory) {
        return userNames[_user];
    }

    function getUsers() public view returns (address[] memory users) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256 count) {
        count = _users.length();
    }

    function getUserAt(uint256 index) public view returns (address user) {
        require(index < _users.length(), "OUT_OF_RANGE");
        user = _users.at(index);
    }

    function getUserVaultIdAt(
        uint256 index
    ) public view returns (address user) {
        require(msg.sender == treasuryContract, "ONLY_TREASURY");
        require(index < _users.length(), "OUT_OF_RANGE");
        user = _users.at(index);
    }

    function checkifUserExist(bytes32 vaultId) external view returns (bool) {
        return _users.contains(vaultId);
    }

    // Note: startIndex is inclusive, endIndex exclusive
    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory users) {
        require(startIndex < endIndex, "START_INDEX_GREATER_THAN_END_INDEX");
        require(endIndex <= _users.length(), "OUT_OF_RANGE");

        // initialize fixed size memory array
        bytes32[] memory range = new bytes32[](endIndex - startIndex);

        // Populate array with addresses in range
        for (uint256 i = startIndex; i < endIndex; i++) {
            range[i - startIndex] = _users.at(i);
        }

        // return array of addresses
        users = range;
    }
}
