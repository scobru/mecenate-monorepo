// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../modules/FeedViewer.sol";

contract MecenateFeedFactory is Ownable, FeedViewer {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal feeds;

    Structures.FactorySettings internal settings;

    bytes internal feedByteCode;

    mapping(uint8 => uint24) internal routerFee;

    mapping(address => EnumerableSet.AddressSet) internal feedStore;

    mapping(address => bool) internal createdContracts;

    string public version = "v2.0.0"; // Iitialized

    bool public burnEnabled = false;

    uint256 public contractCounter;

    event FeedCreated(address indexed addr);

    constructor(address newUsersModuleContract, address newTreasuryContract) {
        settings.usersModuleContract = newUsersModuleContract;
        settings.treasuryContract = newTreasuryContract;
    }

    function _changeVersion(string memory newVersion) internal {
        version = newVersion;
    }

    function treasuryContract() external view returns (address) {
        return settings.treasuryContract;
    }

    function daiToken() external view returns (address) {
        return settings.daiToken;
    }

    function wethToken() external view returns (address) {
        return settings.wethToken;
    }

    function museToken() external view returns (address) {
        return settings.museToken;
    }

    function router() external view returns (address) {
        return settings.router;
    }

    function getRouterFee(uint8 tokenId) external view returns (uint24) {
        return routerFee[tokenId];
    }

    function setRouterFee(uint8 tokenId, uint24 fee) external onlyOwner {
        routerFee[tokenId] = fee;
    }

    function setBurnEnabled(bool newBurnEnabled) external onlyOwner {
        burnEnabled = newBurnEnabled;
    }

    function isFeed(address newFeed) external view returns (bool) {
        return createdContracts[newFeed];
    }

    function changeMultipleSettings(
        address treasury,
        address usersModule,
        address wethTokenAddr,
        address museTokenAddr,
        address daiTokenAddr,
        address routerAddr
    ) external onlyOwner {
        settings.treasuryContract = treasury;
        settings.usersModuleContract = usersModule;
        settings.wethToken = wethTokenAddr;
        settings.museToken = museTokenAddr;
        settings.daiToken = daiTokenAddr;
        settings.router = routerAddr;
    }

    function setFeedByteCode(
        bytes memory newByteCode,
        string memory newVersion
    ) external onlyOwner {
        feedByteCode = newByteCode;
        _changeVersion(newVersion);
    }

    function buildFeed() external payable returns (address) {
        bytes memory constructorArguments = abi.encode(
            msg.sender,
            settings.usersModuleContract,
            address(this),
            version
        );

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                msg.sender
            ),
            "user does not exist"
        );

        require(msg.value >= getCreationFee(), "NOT_ENOUGH_FEE");

        (bool _result, ) = payable(settings.treasuryContract).call{
            value: msg.value
        }("");

        require(_result, "CALL_FAILED");

        contractCounter++;

        address addr;

        bytes memory tempByteCode = feedByteCode; // Carico la variabile di storage in una variabile locale

        // Concatena il bytecode e gli argomenti del costruttore
        bytes memory bytecodeWithConstructor = abi.encodePacked(
            tempByteCode,
            constructorArguments
        );

        // Deploy del contratto con gli argomenti del costruttore
        assembly {
            addr := create(
                0,
                add(bytecodeWithConstructor, 0x20),
                mload(bytecodeWithConstructor)
            )
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        address feed = addr;

        feeds.add(address(feed));

        feedStore[msg.sender].add(address(feed));

        createdContracts[address(feed)] = true;

        emit FeedCreated(address(feed));

        return address(feed);
    }

    function getFeeds() external view returns (address[] memory) {
        return feeds.values();
    }

    function getFeedsOwned(
        address user
    ) external view returns (address[] memory) {
        return feedStore[user].values();
    }

    function getFeedsInfoOwned(
        address user
    ) external view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(feedStore[user].values());
    }

    function getFeedInfo(
        address user
    ) external view returns (Structures.Feed memory) {
        return _getFeedInfo(user);
    }

    function getFeedsInfo() external view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(feeds.values());
    }

    function isContractCreated(
        address contractAddress
    ) external view returns (bool) {
        return createdContracts[contractAddress];
    }

    function getCreationFee() internal view returns (uint256) {
        return IMecenateTreasury(settings.treasuryContract).fixedFee();
    }
}
