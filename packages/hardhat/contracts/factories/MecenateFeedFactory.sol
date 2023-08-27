// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateFeed} from "../features/MecenateFeed.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../modules/FeedViewer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateWallet.sol";

contract MecenateFeedFactory is Ownable, FeedViewer {
    uint256 public contractCounter;

    address[] public feeds;

    address public treasuryContract;

    address private usersModuleContract;

    address private verifierContract;

    address private walletContract;

    mapping(address => bool) public createdContracts;

    mapping(address => bool) public authorized;

    event FeedCreated(address indexed addr);

    constructor(
        address _usersModuleContract,
        address _treasuryContract,
        address _verifierContract,
        address _walletContract
    ) {
        usersModuleContract = _usersModuleContract;
        treasuryContract = _treasuryContract;
        verifierContract = _verifierContract;
        walletContract = _walletContract;
    }

    function setAuthorized(address _addr) external onlyOwner {
        authorized[_addr] = true;
    }

    function removeAuthorized(address _addr) external onlyOwner {
        authorized[_addr] = false;
    }

    function changeTreasury(address _treasury) external onlyOwner {
        treasuryContract = _treasury;
    }

    function buildFeed(
        bytes memory sismoConnectResponse
    ) external returns (address) {
        (, bytes memory vaultIdBytes, , ) = IMecenateVerifier(verifierContract)
            .sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        bool result = IMecenateWallet(walletContract).pay(
            payable(treasuryContract),
            getCreationFee(),
            keccak256(vaultIdBytes)
        );

        require(result, "payment failed");

        contractCounter++;

        MecenateFeed feed = new MecenateFeed(
            keccak256(vaultIdBytes),
            usersModuleContract,
            verifierContract,
            walletContract
        );

        feeds.push(address(feed));

        createdContracts[address(feed)] = true;

        emit FeedCreated(address(feed));

        return address(feed);
    }

    function getFeeds() external view returns (address[] memory) {
        return feeds;
    }

    function getFeedsOwned(
        bytes32 owner
    ) external view returns (address[] memory) {
        address[] memory ownedFeeds = new address[](feeds.length);
        for (uint256 i = 0; i < ownedFeeds.length; i++) {
            if ((MecenateFeed(payable(feeds[i])).owner()) == owner) {
                ownedFeeds[i] = feeds[i];
            }
        }

        return ownedFeeds;
    }

    function getFeedInfo(
        address _feed
    ) external view returns (Structures.Feed memory) {
        return _getFeedInfo(_feed);
    }

    function getFeedsInfo() external view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(feeds);
    }

    function isContractCreated(
        address contractAddress
    ) external view returns (bool) {
        return createdContracts[contractAddress];
    }

    function getCreationFee() internal view returns (uint256) {
        return IMecenateTreasury(treasuryContract).fixedFee();
    }

    receive() external payable {}
}
