// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateFeed} from "../features/MecenateFeed.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../modules/FeedViewer.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "../helpers/SismoConnectLib.sol";

contract MecenateFeedFactory is Ownable, FeedViewer, SismoConnect {
    bytes16 public appId = 0x6c434d2de6efa3e7169bc58843b74d74;

    uint256 public contractCounter;

    address[] public feeds;

    address public identityContract;

    address public treasuryContract;

    address public usersMouduleContract;

    mapping(address => bool) public createdContracts;

    mapping(address => bool) public authorized;

    event FeedCreated(address indexed addr);

    constructor(
        address _usersMouduleContract,
        address _identityContract,
        address _treasuryContract
    ) SismoConnect(buildConfig(appId)) {
        identityContract = _identityContract;
        usersMouduleContract = _usersMouduleContract;
        treasuryContract = _treasuryContract;
        _transferOwnership(msg.sender);
    }

    function setAuthorized(address _addr) public onlyOwner {
        authorized[_addr] = true;
    }

    function removeAuthorized(address _addr) public onlyOwner {
        authorized[_addr] = false;
    }

    function changeTreasury(address _treasury) public onlyOwner {
        treasuryContract = _treasury;
    }

    function buildFeed(
        bytes memory sismoConnectResponse
    ) public payable returns (address) {
        (uint256 vaultId, , , address userAddressConverted) = _sismoVerify(
            sismoConnectResponse
        );

        require(msg.value == getCreationFee(), "fee is not correct");

        payable(treasuryContract).transfer(msg.value);

        require(
            MecenateIdentity(identityContract).balanceOf(userAddressConverted) >
                0,
            "user does not have identity"
        );

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(vaultId),
            "user does not exist"
        );

        contractCounter++;

        MecenateFeed feed = new MecenateFeed(
            userAddressConverted,
            usersMouduleContract,
            identityContract
        );

        feeds.push(address(feed));

        createdContracts[address(feed)] = true;

        emit FeedCreated(address(feed));

        return address(feed);
    }

    function getFeeds() public view returns (address[] memory) {
        return feeds;
    }

    function getFeedsOwned(
        address owner
    ) public view returns (address[] memory) {
        address[] memory ownedFeeds = new address[](feeds.length);
        for (uint256 i = 0; i < ownedFeeds.length; i++) {
            if (payable(MecenateFeed(payable(feeds[i])).owner()) == owner) {
                ownedFeeds[i] = feeds[i];
            }
        }

        return ownedFeeds;
    }

    function getFeedInfo(
        address _feed
    ) public view returns (Structures.Feed memory) {
        return _getFeedInfo(_feed);
    }

    function getFeedsInfo() public view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(feeds);
    }

    function isContractCreated(
        address contractAddress
    ) public view returns (bool) {
        return createdContracts[contractAddress];
    }

    function getCreationFee() internal view returns (uint256) {
        return IMecenateTreasury(treasuryContract).fixedFee();
    }

    function _sismoVerify(
        bytes memory sismoConnectResponse
    ) internal view returns (uint256, bytes memory, uint256, address) {
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

        return (vaultId, vaultIdBytes, userAddress, userAddressConverted);
    }

    receive() external payable {}
}
