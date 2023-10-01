// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../modules/FeedViewer.sol";

contract MecenateFeedFactory is Ownable, FeedViewer {
    using EnumerableSet for EnumerableSet.AddressSet;

    string public version;

    bytes internal feedByteCode;

    uint256 public contractCounter;
    EnumerableSet.AddressSet internal feeds;
    Structures.FactorySettings internal settings;
    mapping(uint8 => uint24) internal routerFee;
    mapping(bytes32 => EnumerableSet.AddressSet) internal feedStore;
    mapping(address => bool) internal createdContracts;

    event FeedCreated(address indexed addr);

    bool public burnEnabled = false;

    constructor(
        address _usersModuleContract,
        address _treasuryContract,
        address _verifierContract,
        address _vaultContract
    ) {
        settings.usersModuleContract = _usersModuleContract;
        settings.treasuryContract = _treasuryContract;
        settings.verifierContract = _verifierContract;
        settings.vaultContract = _vaultContract;
    }

    function changeVersion(string memory _version) external onlyOwner {
        version = _version;
    }

    function treasuryContract() external view returns (address) {
        return settings.treasuryContract;
    }

    function identityContract() external view returns (address) {
        return settings.verifierContract;
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

    function setBurnEnabled(bool _burnEnabled) external onlyOwner {
        burnEnabled = _burnEnabled;
    }

    function isFeed(address _feed) external view returns (bool) {
        return createdContracts[_feed];
    }

    function changeMultipleSettings(
        address _treasury,
        address _vault,
        address _usersModule,
        address _wethToken,
        address _museToken,
        address _daiToken,
        address _router
    ) external onlyOwner {
        settings.treasuryContract = _treasury;
        settings.vaultContract = _vault;
        settings.usersModuleContract = _usersModule;
        settings.wethToken = _wethToken;
        settings.museToken = _museToken;
        settings.daiToken = _daiToken;
        settings.router = _router;
    }

    function setFeedByteCode(bytes memory _byteCode) external onlyOwner {
        feedByteCode = _byteCode;
    }

    function buildFeed(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external payable returns (address) {
        require(msg.sender == settings.vaultContract, "ONLY_VAULT");
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(settings.verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        (address to, bytes32 nonce) = abi.decode(
            signedMessage,
            (address, bytes32)
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        bytes memory constructorArguments = abi.encode(
            encryptedVaultId,
            settings.usersModuleContract,
            settings.verifierContract,
            settings.vaultContract,
            address(this),
            version
        );

        require(_nonce == nonce, "WRONG_NONCE");
        require(_to == to, "WRONG_TO");

        require(
            IMecenateUsers(settings.usersModuleContract).checkifUserExist(
                encryptedVaultId
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
        feedStore[encryptedVaultId].add(address(feed));
        createdContracts[address(feed)] = true;

        emit FeedCreated(address(feed));

        return address(feed);
    }

    function getFeeds() external view returns (address[] memory) {
        return feeds.values();
    }

    function getFeedsOwned(
        bytes32 vaultId
    ) external view returns (address[] memory) {
        return feedStore[vaultId].values();
    }

    function getFeedsInfoOwned(
        bytes32 vaultId
    ) external view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(feedStore[vaultId].values());
    }

    function getFeedInfo(
        address _feed
    ) external view returns (Structures.Feed memory) {
        return _getFeedInfo(_feed);
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

    receive() external payable {}
}
