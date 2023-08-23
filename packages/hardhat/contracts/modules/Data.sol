// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateIdentity.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFactory.sol";
import "../helpers/SismoConnectLib.sol";

contract Data is Ownable, SismoConnect {
    uint256 public constant punishmentRatio = 100000000000000000;

    bytes16 public appId = 0x6c434d2de6efa3e7169bc58843b74d74;

    Structures.Post public post;

    uint256 public postCount;

    address public usersModuleContract;

    address public identityContract;

    address public factoryContract;

    bytes public constant ZEROHASH = "0x00";

    constructor(
        address _usersModuleContract,
        address _identityContract
    ) SismoConnect(buildConfig(appId)) {
        usersModuleContract = _usersModuleContract;
        identityContract = _identityContract;
        post.postdata.settings.status = Structures.PostStatus.Waiting;
        factoryContract = msg.sender;
    }
}
