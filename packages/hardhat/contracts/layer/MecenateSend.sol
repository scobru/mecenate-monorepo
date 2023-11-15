// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateTreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MecenateSend is Ownable {
    using SafeERC20 for IERC20;

    mapping(bytes => bytes) public encryptedKeys;

    address public usersContract;

    uint256 public fixedFee = 0.01 ether;

    constructor(address _usersContract) {
        usersContract = _usersContract;
    }

    function submitHash(bytes memory encryptedData) public payable {
        (
            bytes memory ipfsHash,
            bytes memory pubKey,
            address receiver,
            address token,
            uint256 amount
        ) = abi.decode(
                encryptedData,
                (bytes, bytes, address, address, uint256)
            );

        require(
            IMecenateUsers(usersContract).checkifUserExist(msg.sender),
            "Sender not registered"
        );

        encryptedKeys[pubKey] = ipfsHash;

        if (token == address(0)) {
            require(msg.value >= amount + fixedFee, "Wrong Fee Value");
            uint256 amountToSend = msg.value - fixedFee;
            // require(address(receiver).balance == 0, "Receiver has balance");
            payable(receiver).transfer(amountToSend);
        } else {
            IERC20 tokenContract = IERC20(token);
            require(
                tokenContract.allowance(msg.sender, address(this)) >= amount,
                "Not enough allowance"
            );
            // require(
            //     tokenContract.balanceOf(msg.sender) == 0,
            //     "Receiver has balance"
            // );

            tokenContract.safeTransferFrom(msg.sender, receiver, amount);
        }
    }

    function getHash(bytes memory pubKey) public view returns (bytes memory) {
        return encryptedKeys[pubKey];
    }

    function updateUsersContract(address newUsersContract) public onlyOwner {
        usersContract = newUsersContract;
    }

    function changeUsersContract(address _usersContract) external onlyOwner {
        usersContract = _usersContract;
    }

    function withdrawETH(address _receiver) external onlyOwner {
        uint256 balance = address(this).balance;
        payable(_receiver).transfer(balance);
    }
}
