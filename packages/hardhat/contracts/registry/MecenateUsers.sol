pragma solidity 0.8.19;

// import enumerable address set from openzeppelin
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";

contract MecenateUsers {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    EnumerableSet.Bytes32Set private _users;
    event UserRegistered(bytes vaultID);

    address public identityContract;

    constructor(address _identityContract) {
        identityContract = _identityContract;
    }

    function registerUser(bytes memory vaultId) public {
        // check if user exists
        require(!_users.contains(keccak256(vaultId)), "user already exists");

        // add user
        _users.add(keccak256(vaultId));

        // emit event
        emit UserRegistered(vaultId);
    }

    function getUsers() public view returns (bytes32[] memory users) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256 count) {
        count = _users.length();
    }

    function checkifUserExist(
        bytes32 encryptedVauldId
    ) public view returns (bool) {
        return _users.contains(encryptedVauldId);
    }

    // Note: startIndex is inclusive, endIndex exclusive
    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (bytes32[] memory users) {
        require(startIndex < endIndex, "startIndex must be less than endIndex");
        require(endIndex <= _users.length(), "end index out of range");

        // initialize fixed size memory array
        bytes32[] memory range = new address[](endIndex - startIndex);

        // Populate array with addresses in range
        for (uint256 i = startIndex; i < endIndex; i++) {
            range[i - startIndex] = _users.at(i);
        }

        // return array of addresses
        users = range;
    }
}
