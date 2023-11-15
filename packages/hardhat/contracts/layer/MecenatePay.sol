// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenatePay is Ownable {
    mapping(bytes => bytes) public encryptedKeys;

    address public usersContract;
    address public treasury;

    event KeySubmitted(address indexed user, bytes pubKey);

    constructor(address _usersContract, address _treasury) {
        usersContract = _usersContract;
        treasury = _treasury;
    }

    function submitHash(bytes memory encryptedData) public payable {
        (bytes memory encryptedKey, bytes memory pubKey) = abi.decode(
            encryptedData,
            (bytes, bytes)
        );

        uint256 fixedFee = IMecenateTreasury(treasury).fixedFee();

        require(msg.value == fixedFee, "Wrong Fee Value");

        (bool success, ) = treasury.call{value: msg.value}("");

        require(success, "Transfer failed.");

        encryptedKeys[pubKey] = encryptedKey;

        emit KeySubmitted(msg.sender, pubKey);
    }

    function getHash(bytes memory pubKey) public view returns (bytes memory) {
        return encryptedKeys[pubKey];
    }

    function updateUsersContract(address newUsersContract) public onlyOwner {
        usersContract = newUsersContract;
    }
}
