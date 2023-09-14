// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateFactory.sol";
import "../interfaces/IMecenateVerifier.sol";

/**
 * @title Data
 * @dev This contract stores data related to Mecenate posts and provides functions to interact with it.
 */
contract Data {
    bytes32 public owner;

    Structures.Post public post;

    Structures.postSettingPrivate internal postSettingPrivate;

    uint256 public constant punishmentRatio = 100000000000000000;

    uint256 public postCount;

    address public usersModuleContract;

    address public factoryContract;

    address public verifierContract;

    address public telegramRelayer;

    bytes internal encodedSymKey;

    bytes public constant ZEROHASH = "0x00";

    bytes internal lastMessageForBuyer;

    bytes internal lastMessageForSeller;

    /**
     * @dev Constructor function for the Data contract.
     * @param _usersModuleContract The address of the Users module contract.
     * @param _verifierContract The address of the Verifier contract.
     */
    constructor(address _usersModuleContract, address _verifierContract) {
        usersModuleContract = _usersModuleContract;
        verifierContract = _verifierContract;
        post.postdata.settings.status = Structures.PostStatus.Waiting;
        factoryContract = msg.sender;
    }

    /**
     * @dev Function to verify a Sismo Connect response.
     * @param sismoConnectResponse The Sismo Connect response to verify.
     * @return vaultId The ID of the vault.
     * @return vaultIdBytes The ID of the vault in bytes.
     * @return userAddress The address of the user.
     * @return userAddressConverted The address of the user in address format.
     */
    function sismoVerify(
        bytes memory sismoConnectResponse
    )
        internal
        view
        returns (uint256, bytes memory, uint256, address, uint256, uint256)
    {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted,
            uint256 twitterId,
            uint256 telegramId
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse
            );
        return (
            vaultId,
            vaultIdBytes,
            userAddress,
            userAddressConverted,
            twitterId,
            telegramId
        );
    }

    /**
     * @dev Function to get the status of a post.
     * @return The status of the post.
     */
    function getStatus() external view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }

    receive() external payable {}
}
