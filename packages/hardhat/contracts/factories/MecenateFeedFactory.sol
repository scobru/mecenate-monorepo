// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../modules/FeedViewer.sol";
import "../interfaces/IProxyCall.sol";
import "../interfaces/IFeedInitializer.sol";

contract MecenateFeedFactory is Initializable, OwnableUpgradeable, FeedViewer {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    using ClonesUpgradeable for address;
    using StringsUpgradeable for uint256;

    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;

    IProxyCall public proxyCallContract;

    address public implementation;
    address public defaultOperator;

    EnumerableSetUpgradeable.AddressSet internal feeds;
    Structures.FactorySettings internal settings;

    bytes internal feedByteCode;

    mapping(uint256 => uint24) internal routerFee;
    mapping(address => EnumerableSetUpgradeable.AddressSet) internal feedStore;

    bool public burnEnabled = false;

    uint256 public contractCounter;

    uint256 public major;
    uint256 public minor;
    uint256 public patch;

    event FeedCreated(address indexed addr);

    event ImplementationUpdated(
        address indexed implementation,
        uint256 indexed version
    );

    event ProxyCallContractUpdated(address indexed _proxyCallContract);

    function initialize(
        address _proxyCallContract,
        address _usersModuleContract,
        address _treasuryContract,
        address _easContract,
        bytes32 _easSchema,
        address _wethToken,
        address _museToken,
        address _daiToken,
        address _router
    ) public initializer {
        __Ownable_init();
        __Ownable_init_unchained();

        transferOwnership(msg.sender);
        _updateProxyCallContract(_proxyCallContract);

        settings.usersModuleContract = _usersModuleContract;
        settings.treasuryContract = _treasuryContract;
        settings.easContract = _easContract;
        settings.easSchema = _easSchema;
        settings.wethToken = _wethToken;
        settings.museToken = _museToken;
        settings.daiToken = _daiToken;
        settings.router = _router;
        proxyCallContract = IProxyCall(_proxyCallContract);
        defaultOperator = msg.sender;
        major = 2;
        minor = 0;
        patch = 0;
    }

    function adminUpdateImplementation(
        address _implementation,
        uint256 major,
        uint256 minor,
        uint256 patch
    ) external onlyOwner {
        _updateImplementation(_implementation, major, minor, patch);
    }

    function adminUpdateProxyCallContract(
        address _proxyCallContract
    ) external onlyOwner {
        _updateProxyCallContract(_proxyCallContract);
    }

    function treasuryContract() external view returns (address) {
        return settings.treasuryContract;
    }

    function easSchema() external view returns (bytes32) {
        return settings.easSchema;
    }

    function easContract() external view returns (address) {
        return settings.easContract;
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

    function getRouterFee(uint256 tokenId) external view returns (uint24) {
        return routerFee[tokenId];
    }

    function setRouterFee(uint256 tokenId, uint24 fee) external onlyOwner {
        routerFee[tokenId] = fee;
    }

    function setBurnEnabled(bool newBurnEnabled) external onlyOwner {
        burnEnabled = newBurnEnabled;
    }

    function isFeed(address newFeed) external view returns (bool) {
        return feeds.contains(newFeed);
    }

    function changeMultipleSettings(
        address treasury,
        address usersModule,
        address newEasContract,
        bytes32 newEasSchema,
        address wethTokenAddr,
        address museTokenAddr,
        address daiTokenAddr,
        address routerAddr
    ) external onlyOwner {
        settings.treasuryContract = treasury;
        settings.usersModuleContract = usersModule;
        settings.easContract = newEasContract;
        settings.easSchema = newEasSchema;
        settings.wethToken = wethTokenAddr;
        settings.museToken = museTokenAddr;
        settings.daiToken = daiTokenAddr;
        settings.router = routerAddr;
    }

    function buildFeed() external payable returns (address ctx) {
        uint256 nonce = uint256(
            keccak256(abi.encodePacked(msg.sender, block.timestamp))
        );

        ctx = implementation.cloneDeterministic(
            _getSalt(msg.sender, nonce + 1)
        );

        IFeedInitializer(ctx).initialize(
            msg.sender,
            address(this),
            settings.usersModuleContract,
            major,
            minor,
            patch
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

        address feed = ctx;

        feeds.add(address(feed));

        feedStore[msg.sender].add(address(feed));

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
        return feeds.contains(contractAddress);
    }

    function getCreationFee() internal view returns (uint256) {
        return IMecenateTreasury(settings.treasuryContract).fixedFee();
    }

    function _updateProxyCallContract(address _proxyCallContract) private {
        require(
            _proxyCallContract.isContract(),
            "FNDCollectionFactory: Proxy call address is not a contract"
        );
        proxyCallContract = IProxyCall(_proxyCallContract);

        emit ProxyCallContractUpdated(_proxyCallContract);
    }

    function _updateImplementation(
        address _implementation,
        uint256 majorNew,
        uint256 minorNew,
        uint256 patchNew
    ) private {
        require(
            _implementation.isContract(),
            "nali: implementation is not a contract"
        );

        implementation = _implementation;

        unchecked {
            // Version cannot overflow 256 bits.
            major = majorNew;
            minor = minorNew;
            patch = patchNew;
        }

        IFeedInitializer(implementation).initialize(
            msg.sender,
            address(this),
            settings.usersModuleContract,
            major,
            minor,
            patch
        );

        uint256 version = majorNew * 10000 + minorNew * 100 + patchNew;

        emit ImplementationUpdated(_implementation, version);
    }

    function _getSalt(
        address creator,
        uint256 nonce
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(creator, nonce));
    }
}
