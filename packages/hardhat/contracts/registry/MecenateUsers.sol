pragma solidity 0.8.19;

// import enumerable address set from openzeppelin
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";

contract MecenateUsers {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _users;
    mapping(address => Structures.User) private _metadata;
    event UserRegistered(address indexed user, Structures.User data);

    address public identityContract;

    constructor(address _identityContract) {
        identityContract = _identityContract;
    }

    function registerUser(Structures.User memory data) public {
        require(!_users.contains(msg.sender), "user already exists");
        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );
        // add user
        _users.add(msg.sender);

        // set metadata
        _metadata[msg.sender] = data;

        // emit event
        emit UserRegistered(msg.sender, data);
    }

    function getUserData(
        address user
    ) public view returns (Structures.User memory data) {
        data = _metadata[user];
    }

    function getUsers() public view returns (address[] memory users) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256 count) {
        count = _users.length();
    }

    function checkifUserExist(address user) public view returns (bool) {
        return _users.contains(user);
    }

    // Note: startIndex is inclusive, endIndex exclusive
    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory users) {
        require(startIndex < endIndex, "startIndex must be less than endIndex");
        require(endIndex <= _users.length(), "end index out of range");

        // initialize fixed size memory array
        address[] memory range = new address[](endIndex - startIndex);

        // Populate array with addresses in range
        for (uint256 i = startIndex; i < endIndex; i++) {
            range[i - startIndex] = _users.at(i);
        }

        // return array of addresses
        users = range;
    }
}
