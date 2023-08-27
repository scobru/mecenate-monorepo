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

    EnumerableSet.Bytes32Set private _users;
    EnumerableSet.AddressSet private _usersAddress;

    Structures.User private _metadata;

    event UserRegistered(bytes32 vaultId);

    address public verifierContract;

    address public treasuryContract;

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

        bytes32 vaultIdEncoded = keccak256(vaultIdBytes);

        // check if user exists
        require(!_users.contains(vaultIdEncoded), "user already exists");

        // add user
        _users.add(vaultIdEncoded);
        _usersAddress.add(userAddressConverted);

        // emit event
        emit UserRegistered(vaultIdEncoded);
    }

    function getUsers() public view returns (bytes32[] memory users) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256 count) {
        count = _users.length();
    }

    function getUserAt(uint256 index) public view returns (bytes32 user) {
        require(index < _users.length(), "index out of range");
        user = _users.at(index);
    }

    function getUserAddressAt(
        uint256 index
    ) public view returns (address user) {
        require(
            msg.sender == treasuryContract,
            "only treasury can call this function"
        );
        require(index < _users.length(), "index out of range");
        user = _usersAddress.at(index);
    }

    function checkifUserExist(bytes32 vaultId) external view returns (bool) {
        return _users.contains(vaultId);
    }

    // Note: startIndex is inclusive, endIndex exclusive
    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (bytes32[] memory users) {
        require(startIndex < endIndex, "startIndex must be less than endIndex");
        require(endIndex <= _users.length(), "end index out of range");

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
