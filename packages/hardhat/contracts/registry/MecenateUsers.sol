pragma solidity 0.8.19;

// import enumerable address set from openzeppelin
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import "../helpers/SismoConnectLib.sol";

contract MecenateUsers is SismoConnect {
    bytes16 public appId = 0x6c434d2de6efa3e7169bc58843b74d74;

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _users;
    mapping(address => Structures.User) private _metadata;

    event UserRegistered(bytes vaultID);

    address public identityContract;

    constructor(address _identityContract) SismoConnect(buildConfig(appId)) {
        identityContract = _identityContract;
    }

    function registerUser(bytes memory sismoConnectResponse) public {
        AuthRequest[] memory auths = new AuthRequest[](2);
        auths[0] = buildAuth(AuthType.VAULT);
        auths[1] = buildAuth(AuthType.EVM_ACCOUNT);

        SismoConnectVerifiedResult memory result = verify({
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature({message: "I love Sismo!"})
        });

        // --> vaultId = hash(userVaultSecret, appId)
        uint256 vaultId = SismoConnectHelper.getUserId(result, AuthType.VAULT);
        bytes memory vaultIdBytes = abi.encodePacked(vaultId);

        uint256 userAddress = SismoConnectHelper.getUserId(
            result,
            AuthType.EVM_ACCOUNT
        );
        address userAddressConverted = address(uint160(userAddress));

        // check if user exists
        require(!_users.contains(userAddressConverted), "user already exists");

        // add user
        _users.add(userAddressConverted);

        // set user metadata
        _metadata[userAddressConverted] = Structures.User({
            vaultId: vaultIdBytes,
            wallet: userAddressConverted
        });

        // emit event
        emit UserRegistered(abi.encodePacked(bytes32(vaultId)));
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
