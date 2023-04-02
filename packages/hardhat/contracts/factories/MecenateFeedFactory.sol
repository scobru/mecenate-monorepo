// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateFeed} from "../features/MecenateFeed.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateUsers.sol";
import "../modules/FeedViewer.sol";
import "../interfaces/IMecenateTreasury.sol";

contract MecenateFeedFactory is Ownable, FeedViewer {
    address public identityContract;

    address public treasuryContract;

    address public usersMouduleContract;

    uint256 numFeeds;

    address[] public feeds;

    uint256 public contractCounter;

    mapping(address => bool) public createdContracts;

    mapping(address => bool) public authorized;

    event FeedCreated(address indexed addr);

    constructor(
        address _usersMouduleContract,
        address _identityContract,
        address _treasuryContract
    ) {
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

    function buildFeed() public payable returns (address) {
        require(msg.value == getCreationFee(), "fee is not correct");

        payable(treasuryContract).transfer(msg.value);

        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(msg.sender),
            "user does not exist"
        );

        contractCounter++;

        MecenateFeed feed = new MecenateFeed(
            msg.sender,
            usersMouduleContract,
            identityContract
        );

        feeds.push(address(feed));

        numFeeds++;

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

    receive() external payable {}
}
