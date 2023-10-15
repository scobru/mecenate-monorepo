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

    EnumerableSet.Bytes32Set private _users;

    Structures.User private _metadata;

    event UserRegistered(bytes32 vaultId);

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

    function registerUser(
        bytes memory sismoConnectResponse,
        address _to,
        address _from,
        string memory _username
    ) public {
        (bytes memory vaultId, , ) = IMecenateVerifier(verifierContract)
            .sismoVerify(sismoConnectResponse, _to, _from);

        bytes32 encryptedVaultId = keccak256(vaultId);

        userNames[encryptedVaultId] = _username;

        // check if user exists
        require(!_users.contains(encryptedVaultId), "USER_ALREADY_EXISTS");

        // add user
        _users.add(encryptedVaultId);

        // emit event
        emit UserRegistered(encryptedVaultId);
    }

    function changeUserName(
        bytes memory sismoConnectResponse,
        address _to,
        address _from,
        string memory _username
    ) external {
        (bytes memory vaultId, , ) = IMecenateVerifier(verifierContract)
            .sismoVerify(sismoConnectResponse, _to, _from);

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(_users.contains(encryptedVaultId), "USER_ALREADY_EXISTS");

        userNames[encryptedVaultId] = _username;
    }

    function getUserName(bytes32 vaultId) public view returns (string memory) {
        return userNames[vaultId];
    }

    function getUsers() public view returns (bytes32[] memory users) {
        return _users.values();
    }

    function getUserCount() public view returns (uint256 count) {
        count = _users.length();
    }

    function getUserAt(uint256 index) public view returns (bytes32 user) {
        require(index < _users.length(), "OUT_OF_RANGE");
        user = _users.at(index);
    }

    function getUserVaultIdAt(
        uint256 index
    ) public view returns (bytes32 user) {
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
    ) public view returns (bytes32[] memory users) {
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
