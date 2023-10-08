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
import "./interfaces/IMUSE.sol";

contract MecenateTreasury is Ownable, Swapper {
    using SafeERC20 for IERC20;

    uint256 public globalFee = 100;

    uint256 public fixedFee = 0.01 ether;

    uint256 public lastDistributed;

    uint256 public distributableBalance;

    uint256 public ownerFee;

    mapping(bytes32 => uint256) public userReward;
    mapping(bytes32 => mapping(address => uint256)) public userRewardERC20;

    mapping(address => uint256) public distributableERC20Balance;

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

    /* function withdrawTokens(
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
    } */

    function addERC20Funds(address token, uint256 amount) external onlyOwner {
        distributableERC20Balance[token] += amount;
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

    function distributeERC20(address token, address _usersContract) external {
        require(
            distributableERC20Balance[token] > 0,
            "No distributable balance"
        );

        uint256 fee = (distributableERC20Balance[token] * globalFee) / 10000;
        ownerFee += fee; // Assuming ownerFee can hold ERC20 as well

        uint256 total = distributableERC20Balance[token] - fee;
        uint256 userCount = IMecenateUsers(_usersContract).getUserCount();

        require(userCount > 0, "No users to distribute to");

        uint256 perIdentity = total / userCount;

        for (uint256 i = 0; i < userCount; i++) {
            bytes32 user = IMecenateUsers(_usersContract).getUserVaultIdAt(i);
            // Implement logic to distribute perIdentity ERC20 tokens to each user
            // For example: IERC20(token).safeTransfer(userAddress, perIdentity);
            userRewardERC20[user][token] += perIdentity;
        }

        // Reset the distributable balance for the token
        distributableERC20Balance[token] = 0;
    }

    function setSwapRouter(ISwapRouter _swapRouter) external onlyOwner {
        swapRouter = _swapRouter;
    }

    function takeReward(
        address _receiver,
        address _verifierContract,
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external returns (uint256) {
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(_verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        (address to, bytes32 nonce) = abi.decode(
            signedMessage,
            (address, bytes32)
        );

        require(_nonce == nonce, "Not Same Nonce");

        bytes32 _user = keccak256(vaultId);

        uint256 amountToSend = userReward[_user];

        userReward[_user] = 0;

        // send eth weith data
        (bool success, ) = payable(to).call{value: amountToSend}(
            sismoConnectResponse
        );

        return amountToSend;
    }

    function takeRewardERC20(
        address _token,
        address _receiver,
        address _verifierContract,
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) external returns (uint256) {
        // Similar verification logic as your current takeReward for ETH
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(_verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        (address to, bytes32 nonce) = abi.decode(
            signedMessage,
            (address, bytes32)
        );

        require(_nonce == nonce, "Not Same Nonce");

        bytes32 _user = keccak256(vaultId);

        uint256 amountToSend = userRewardERC20[_user][_token]; // assuming userReward is now a double mapping
        require(amountToSend > 0, "No reward available");

        userRewardERC20[_user][_token] = 0; // reset the user's reward to 0

        IERC20(_token).safeTransfer(to, amountToSend);

        return amountToSend;
    }

    function getReward(
        address _verifierContract,
        bytes32 encryptedVaultId
    ) external view returns (uint256) {
        return userReward[encryptedVaultId];
    }

    function getRewardERC20(
        address _token,
        address _verifierContract,
        bytes32 encryptedVaultId
    ) external view returns (uint256) {
        return userRewardERC20[encryptedVaultId][_token]; // assuming userReward is now a double mapping
    }

    // swap token0 to token1 and burn token1
    function swapAndBurn(
        address _token0,
        address _token1,
        address _token2,
        uint24 _fee,
        uint24 _fee2
    ) external onlyOwner {
        uint256 _amount = IERC20(_token0).balanceOf(address(this));
        // Approva il token
        require(
            IERC20(_token0).approve(address(swapRouter), _amount),
            "Approve failed"
        );

        // swap token0 to token1
        uint256 tokens_bought = _swapTokensForTokens(
            _token0,
            _token1,
            _fee,
            _amount
        );

        require(tokens_bought > 0, "No tokens bought");

        // swap token1 to token2

        require(
            IERC20(_token1).approve(address(swapRouter), tokens_bought),
            "Approve failed"
        );

        uint256 tokens_sold_to_muse = _swapTokensForTokens(
            _token1,
            _token2,
            _fee2,
            tokens_bought
        );

        IMUSE(_token2).burn(tokens_sold_to_muse);
    }

    function getDistributionBalance() external view returns (uint256) {
        return distributableBalance;
    }

    function getDistributionERC20Balance(
        address token
    ) external view returns (uint256) {
        return distributableERC20Balance[token];
    }

    receive() external payable {
        // Aggiungi fondi al contratto e aggiorna il saldo distribuibile
        distributableBalance += msg.value;
    }
}
