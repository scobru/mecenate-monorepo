/**
 * @title MecenateFeedFactory
 * @dev A factory contract for creating MecenateFeed contracts.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateFeed} from "../features/MecenateFeed.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../modules/FeedViewer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateFeedFactory is Ownable, FeedViewer {
    uint256 public contractCounter;

    address[] public feeds;

    address public treasuryContract;

    address public usersModuleContract;

    address public verifierContract;

    address public vaultContract;

    mapping(bytes32 => address[]) internal feedStore;

    mapping(address => bool) public createdContracts;

    mapping(address => bool) public authorized;

    event FeedCreated(address indexed addr);

    constructor(
        address _usersModuleContract,
        address _treasuryContract,
        address _verifierContract,
        address _vaultContract
    ) {
        usersModuleContract = _usersModuleContract;
        treasuryContract = _treasuryContract;
        verifierContract = _verifierContract;
        vaultContract = _vaultContract;
    }

    function isFeed(address _feed) external view returns (bool) {
        return createdContracts[_feed];
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

    function changeVault(address _vault) external onlyOwner {
        vaultContract = _vault;
    }

    function buildFeed(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external payable returns (address) {
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(
                encryptedVaultId
            ),
            "user does not exist"
        );

        require(msg.value >= getCreationFee(), "Not enough payment");

        (bool _result, ) = payable(treasuryContract).call{value: msg.value}("");

        require(_result, "Treasury call failed");

        contractCounter++;

        MecenateFeed feed = new MecenateFeed(
            encryptedVaultId,
            usersModuleContract,
            verifierContract,
            vaultContract
        );

        feeds.push(address(feed));

        feedStore[encryptedVaultId].push(address(feed));

        createdContracts[address(feed)] = true;

        emit FeedCreated(address(feed));

        return address(feed);
    }

    function getFeeds() external view returns (address[] memory) {
        return feeds;
    }

    function getFeedsOwned(
        bytes32 vaultId
    ) external view returns (address[] memory) {
        return feedStore[vaultId];
    }

    function getFeedsInfoOwned(
        bytes32 vaultId
    ) external view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(feedStore[vaultId]);
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
