// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateIdentity.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFactory.sol";

contract Data is Ownable {
    uint256 public constant punishmentRatio = 100000000000000000;

    Structures.Post public post;

    Structures.Tokens public tokens;

    uint256 public postCount;

    address public usersModuleContract;

    address public identityContract;

    address public factoryContract;

    address public router;

    Structures.Tokens public tokenERC20Contract;

    bytes public constant ZEROHASH = "0x00";

    constructor(
        address _usersModuleContract,
        address _identityContract,
        address _factoryContract
    ) {
        usersModuleContract = _usersModuleContract;
        identityContract = _identityContract;
        post.postdata.settings.status = Structures.PostStatus.Waiting;
        factoryContract = _factoryContract;
        router = IMecenateFactory(factoryContract).router();
    }

    function getMuseToken() public view returns (address _museToken) {
        return IMecenateFactory(factoryContract).museToken();
    }

    function getDaiToken() public view returns (address _daiToken) {
        return IMecenateFactory(factoryContract).daiToken();
    }
}
