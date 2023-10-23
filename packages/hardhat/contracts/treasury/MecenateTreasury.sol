/**
 * @title MecenateTreasury
 * @dev This contract handles the treasury of the Mecenate platform, which is responsible for distributing funds to users and collecting fees.
 */
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../modules/Swapper.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMUSE.sol";

contract MecenateTreasury is Ownable, Swapper {
    using SafeERC20 for IERC20;

    uint256 public globalFee = 100;

    uint256 public fixedFee = 0.01 ether;

    uint256 public lastDistributed;

    uint256 public distributableBalance;

    uint256 public ownerFee;

    mapping(address => uint256) public userReward;
    mapping(address => mapping(address => uint256)) public userRewardERC20;
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

    function distribute(address usersContract) external {
        require(
            block.timestamp - lastDistributed >= 1 days,
            "Can only distribute once a day"
        );
        require(distributableBalance > 0, "No distributable balance");

        uint256 fee = (distributableBalance * globalFee) / 10000;

        ownerFee += fee;

        uint256 total = distributableBalance - fee;
        uint256 userCount = IMecenateUsers(usersContract).getUserCount();

        require(userCount > 0, "No users to distribute to");

        uint256 perIdentity = total / userCount;

        for (uint256 i = 0; i < userCount; i++) {
            address user = IMecenateUsers(usersContract).getUserAt(i);
            userReward[user] += perIdentity;
        }

        // Aggiorna le variabili di stato
        lastDistributed = block.timestamp;
        distributableBalance = 0; // Azzera il saldo distribuibile
    }

    function distributeERC20(address token, address usersContract) external {
        require(
            distributableERC20Balance[token] > 0,
            "No distributable balance"
        );

        uint256 fee = (distributableERC20Balance[token] * globalFee) / 10000;
        ownerFee += fee; // Assuming ownerFee can hold ERC20 as well

        uint256 total = distributableERC20Balance[token] - fee;
        uint256 userCount = IMecenateUsers(usersContract).getUserCount();

        require(userCount > 0, "No users to distribute to");

        uint256 perIdentity = total / userCount;

        for (uint256 i = 0; i < userCount; i++) {
            address user = IMecenateUsers(usersContract).getUserAt(i);
            // Implement logic to distribute perIdentity ERC20 tokens to each user
            // For example: IERC20(token).safeTransfer(userAddress, perIdentity);
            userRewardERC20[user][token] += perIdentity;
        }

        // Reset the distributable balance for the token
        distributableERC20Balance[token] = 0;
    }

    function setSwapRouter(ISwapRouter swapRouterAddress) external onlyOwner {
        swapRouter = swapRouterAddress;
    }

    function takeReward(address receiver) external returns (uint256) {
        uint256 amountToSend = userReward[msg.sender];

        userReward[msg.sender] = 0;

        // send eth weith data
        (bool success, ) = payable(receiver).call{value: amountToSend}("");

        require(success, "Transfer failed.");

        return amountToSend;
    }

    function takeRewardERC20(
        address token,
        address receiver
    ) external returns (uint256) {
        // Similar verification logic as your current takeReward for ETH

        address _user = msg.sender;

        uint256 amountToSend = userRewardERC20[_user][token]; // assuming userReward is now a double mapping

        require(amountToSend > 0, "No reward available");

        userRewardERC20[_user][token] = 0; // reset the user's reward to 0

        IERC20(token).safeTransfer(receiver, amountToSend);

        return amountToSend;
    }

    function getReward(address user) external view returns (uint256) {
        return userReward[user];
    }

    function getRewardERC20(
        address token,
        address user
    ) external view returns (uint256) {
        return userRewardERC20[user][token]; // assuming userReward is now a double mapping
    }

    // swap token0 to token1 and burn token1
    function swapAndBurn(
        address token0,
        address token1,
        address token2,
        uint24 fee,
        uint24 fee2
    ) external onlyOwner {
        uint256 amount = IERC20(token0).balanceOf(address(this));
        // Approva il token
        require(
            IERC20(token0).approve(address(swapRouter), amount),
            "Approve failed"
        );

        // swap token0 to token1
        uint256 tokens_bought = _swapTokensForTokens(
            token0,
            token1,
            fee,
            amount
        );

        require(tokens_bought > 0, "No tokens bought");

        // swap token1 to token2

        require(
            IERC20(token1).approve(address(swapRouter), tokens_bought),
            "Approve failed"
        );

        uint256 tokens_sold_to_muse = _swapTokensForTokens(
            token1,
            token2,
            fee2,
            tokens_bought
        );

        IMUSE(token2).burn(tokens_sold_to_muse);
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
