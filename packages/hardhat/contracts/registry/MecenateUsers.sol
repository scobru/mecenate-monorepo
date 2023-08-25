pragma solidity 0.8.19;

// import enumerable address set from openzeppelin
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../library/SismoStructs.sol";

contract MecenateUsers is Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    EnumerableSet.UintSet private _users;
    mapping(address => Structures.User) private _metadata;

    event UserRegistered(bytes pubKey);

    address public verifierContract;

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
    }

    function registerUser(bytes memory sismoConnectResponse) public {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse
            );

        require(userAddressConverted != address(0), "user address cannot be 0");
        // check if user exists
        require(!_users.contains(userAddress), "user already exists");

        // add user
        _users.add(userAddress);

        // set user metadata
        _metadata[userAddressConverted] = Structures.User({
            wallet: userAddressConverted
        });

        // emit event
        emit UserRegistered(abi.encodePacked(bytes32(vaultId)));
    }

    function getUsers() public view returns (uint[] memory users) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256 count) {
        count = _users.length();
    }

    function checkifUserExist(uint user) public view returns (bool) {
        return _users.contains(user);
    }

    // Note: startIndex is inclusive, endIndex exclusive
    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (uint[] memory users) {
        require(startIndex < endIndex, "startIndex must be less than endIndex");
        require(endIndex <= _users.length(), "end index out of range");

        // initialize fixed size memory array
        uint[] memory range = new uint[](endIndex - startIndex);

        // Populate array with addresses in range
        for (uint256 i = startIndex; i < endIndex; i++) {
            range[i - startIndex] = _users.at(i);
        }

        // return array of addresses
        users = range;
    }

    function getUserData(
        address user
    ) public view returns (Structures.User memory) {
        return _metadata[user];
    }
}
