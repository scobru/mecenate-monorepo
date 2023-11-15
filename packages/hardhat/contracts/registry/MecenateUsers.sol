pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import "../interfaces/IMecenateVerifier.sol";

contract MecenateUsers is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _users;

    mapping(address => Structures.User) private _metadata;

    address public verifierContract;

    event UserRegistered(address indexed userAddress);
    event PublicKeyChanged(address indexed userAddress, bytes newPublicKey);
    event EVMAddressChanged(address indexed oldAddress, address newAddress);

    constructor(address verifierContractAddress) {
        verifierContract = verifierContractAddress;
    }

    function registerUser(
        bytes memory sismoConnectResponse,
        bytes memory pubKey
    ) external returns (Structures.User memory) {
        bytes memory vaultId = IMecenateVerifier(verifierContract).sismoVerify(
            sismoConnectResponse
        );

        Structures.User memory newUser = Structures.User({
            evmAddress: msg.sender,
            sismoVaultId: vaultId,
            publicKey: pubKey
        });

        _metadata[msg.sender] = newUser;

        require(!_users.contains(msg.sender), "USER_ALREADY_EXISTS");

        _users.add(msg.sender);

        emit UserRegistered(msg.sender);

        return newUser;
    }

    function getUsers() public view returns (address[] memory) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256) {
        return _users.length();
    }

    function getUserAt(uint256 index) public view returns (address) {
        require(index < _users.length(), "OUT_OF_RANGE");
        return _users.at(index);
    }

    function checkifUserExist(
        address userAddress
    ) external view returns (bool) {
        return _users.contains(userAddress);
    }

    function getPaginatedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        require(startIndex < endIndex, "START_INDEX_GREATER_THAN_END_INDEX");
        require(endIndex <= _users.length(), "OUT_OF_RANGE");

        address[] memory range = new address[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            range[i - startIndex] = _users.at(i);
        }

        return range;
    }

    function getUserMetadata(
        address userAddress
    ) external view returns (Structures.User memory) {
        return _metadata[userAddress];
    }

    function getUserPublicKey(
        address userAddress
    ) external view returns (bytes memory) {
        return _metadata[userAddress].publicKey;
    }
}
