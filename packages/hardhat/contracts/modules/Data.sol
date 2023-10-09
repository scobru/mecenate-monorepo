// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../interfaces/IMecenateFeed.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFeedFactory.sol";
import "../interfaces/IMecenateVerifier.sol";

// import openzeppelin ECDSA
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Data
 * @dev This contract stores data related to Mecenate posts and provides functions to interact with it.
 */
contract Data {
    bytes internal constant ZEROHASH = "0x00";

    bytes32 public owner;

    Structures.Post public post;
    Structures.PostSettingPrivate internal postSettingPrivate;
    Structures.FeedSettings internal settings;

    mapping(uint8 => uint256) internal postDurationToDays;
    mapping(uint8 => bool) internal validStatuses;

    constructor(
        address _usersModuleContract,
        address _verifierContract,
        address _factoryContract,
        string memory _version
    ) {
        settings.punishmentRatio = 100000000000000000; // Constant value
        settings.postCount = 0; // Initialize postCount to 0
        settings.usersModuleContract = _usersModuleContract;
        settings.verifierContract = _verifierContract;
        settings.factoryContract = msg.sender;
        settings.router = IMecenateFeedFactory(_factoryContract).router();
        settings.encodedSymKey = ZEROHASH;
        settings.lastMessageForBuyer = ZEROHASH;
        settings.lastMessageForSeller = ZEROHASH;
        post.postdata.settings.status = Structures.PostStatus.Waiting;

        postDurationToDays[uint8(Structures.PostDuration.OneDay)] = 1 days;
        postDurationToDays[uint8(Structures.PostDuration.ThreeDays)] = 3 days;
        postDurationToDays[uint8(Structures.PostDuration.OneWeek)] = 7 days;
        postDurationToDays[uint8(Structures.PostDuration.TwoWeeks)] = 14 days;
        postDurationToDays[uint8(Structures.PostDuration.OneMonth)] = 30 days;
        validStatuses[uint8(Structures.PostStatus.Waiting)] = true;

        settings.version = _version;
    }

    function version() external view returns (string memory) {
        return settings.version;
    }

    function _changeStatus(Structures.PostStatus _newStatus) internal {
        validStatuses[uint8(post.postdata.settings.status)] = false;
        validStatuses[uint8(_newStatus)] = true;
        post.postdata.settings.status = _newStatus;
    }

    function _verifyNonce(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) internal view returns (bytes memory, uint256, uint256, bytes memory) {
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(settings.verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        (, bytes32 nonce) = abi.decode(signedMessage, (address, bytes32));

        require(_nonce == nonce, "WRONG_NONCE");

        return (vaultId, twitterId, telegramId, signedMessage);
    }

    function sismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) internal view returns (bytes memory, uint256, uint256, bytes memory) {
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(settings.verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        return (vaultId, twitterId, telegramId, signedMessage);
    }

    function getStatus() external view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }

    function getTokenId() external view returns (Structures.Tokens) {
        return post.postdata.settings.tokenId;
    }

    function getTokenIdAddress() public view returns (address) {
        if (post.postdata.settings.tokenId == Structures.Tokens.MUSE) {
            return IMecenateFeedFactory(settings.factoryContract).museToken();
        } else if (post.postdata.settings.tokenId == Structures.Tokens.DAI) {
            return IMecenateFeedFactory(settings.factoryContract).daiToken();
        } else {
            return address(0);
        }
    }

    function _checkToken(Structures.Tokens _token) internal view {
        require(_token == post.postdata.settings.tokenId, "WRONG_TOKEN");
    }

    function getPaymentRequested() external view returns (uint256) {
        return post.postdata.escrow.payment;
    }

    function getStakeRequested() external view returns (uint256) {
        return post.postdata.escrow.stake;
    }

    function postCount() external view returns (uint256) {
        return settings.postCount;
    }

    receive() external payable {}
}
