/**
 * @title MecenateTreasury
 * @dev This contract handles the treasury of the Mecenate platform, which is responsible for distributing funds to users and collecting fees.
 */
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./modules/Swapper.sol";
import "./interfaces/IMecenateUsers.sol";

import "./interfaces/IMecenateVerifier.sol";

contract MecenateTreasury is Ownable, Swapper {
    using SafeERC20 for IERC20;

    uint256 public globalFee = 100;

    uint256 public fixedFee = 0.01 ether;

    uint256 public lastDistributed;

    uint256 public distributableBalance;

    uint256 public ownerFee;

    mapping(bytes32 => uint256) public userReward;

    function addFunds() external payable {
        // Aggiungi fondi al contratto e aggiorna il saldo distribuibile
        distributableBalance += msg.value;
    }

    function setGlobalFee(uint256 _globalFee) external onlyOwner {
        globalFee = _globalFee;
    }

    function setFixedFee(uint256 _fixedFee) external onlyOwner {
        fixedFee = _fixedFee;
    }

    function withdrawTokens(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).safeTransfer(_to, _amount);
    }

    function withdrawNative(
        address payable _to,
        uint256 _amount
    ) external onlyOwner {
        _to.transfer(_amount);
    }

    function distribute(address _usersContract) external {
        require(
            block.timestamp - lastDistributed >= 1 days,
            "Can only distribute once a day"
        );
        require(distributableBalance > 0, "No distributable balance");

        uint256 fee = (distributableBalance * globalFee) / 10000;
        ownerFee += fee;

        uint256 total = distributableBalance - fee;
        uint256 userCount = IMecenateUsers(_usersContract).getUserCount();

        require(userCount > 0, "No users to distribute to");

        uint256 perIdentity = total / userCount;

        for (uint256 i = 0; i < userCount; i++) {
            bytes32 user = IMecenateUsers(_usersContract).getUserVaultIdAt(i);
            userReward[user] += perIdentity;
        }

        // Aggiorna le variabili di stato
        lastDistributed = block.timestamp;
        distributableBalance = 0; // Azzera il saldo distribuibile
    }

    function takeReward(
        address _receiver,
        address _verifierContract,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external returns (uint256) {
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(_verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == keccak256(signedMessage),
            "FEEDS:_to address does not match signed message"
        );

        bytes32 _user = keccak256(vaultId);
        uint256 amountToSend = userReward[_user];
        userReward[_user] = 0;

        // send eth weith data
        (bool success, ) = _receiver.call{value: amountToSend}(
            sismoConnectResponse
        );

        return amountToSend;
    }

    function getReward(
        address _verifierContract,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external view returns (uint256) {
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(_verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == keccak256(signedMessage),
            "FEEDS:_to address does not match signed message"
        );

        bytes32 _user = keccak256(vaultId);
        return userReward[_user];
    }

    receive() external payable {
        // Aggiungi fondi al contratto e aggiorna il saldo distribuibile
        distributableBalance += msg.value;
    }
}
