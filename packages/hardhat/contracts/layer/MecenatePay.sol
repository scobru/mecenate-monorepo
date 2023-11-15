// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MecenatePay is Ownable {
    using SafeERC20 for IERC20;

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

    function sendEth(
        address payable _receiver
    ) external payable returns (bool) {
        uint256 fixedFee = IMecenateTreasury(treasury).fixedFee();
        require(msg.value > fixedFee, "Wrong Fee Value");

        uint256 amount = msg.value - fixedFee;
        _receiver.transfer(amount);

        return true;
    }

    function sendERC20(
        address _receiver,
        address _token,
        uint256 amount
    ) external payable {
        IERC20 token = IERC20(_token);
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Not enough allowance"
        );

        uint256 fixedFee = IMecenateTreasury(treasury).fixedFee();
        require(msg.value > fixedFee, "Wrong Fee Value");

        payable(_receiver).transfer(msg.value);
        token.safeTransferFrom(msg.sender, _receiver, amount);
    }
}
