// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFactory.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../interfaces/IMecenateWallet.sol";

contract Data is Ownable {
    uint256 public constant punishmentRatio = 100000000000000000;

    Structures.Post public post;

    uint256 public postCount;

    address public usersModuleContract;

    address public factoryContract;

    address public verifierContract;

    address public walletContract;

    bytes public constant ZEROHASH = "0x00";

    Structures.postSettingPrivate internal postSettingPrivate;

    constructor(
        address _usersModuleContract,
        address _verifierContract,
        address _walletContract
    ) {
        usersModuleContract = _usersModuleContract;
        verifierContract = _verifierContract;
        walletContract = _walletContract;
        post.postdata.settings.status = Structures.PostStatus.Waiting;
        factoryContract = msg.sender;
    }

    function sismoVerify(
        bytes memory sismoConnectResponse
    ) internal view returns (uint256, bytes memory, uint256, address) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse
            );
        return (vaultId, vaultIdBytes, userAddress, userAddressConverted);
    }

    function getStatus() external view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }
}
