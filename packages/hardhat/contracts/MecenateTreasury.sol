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

contract MecenateTreasury is Ownable, Swapper {
    using SafeERC20 for IERC20;

    uint256 public globalFee = 100;

    uint256 public fixedFee = 0.01 ether;

    uint256 public lastDistributed;

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

    function distribute(uint256 _amount, address _usersContract) external {
        require(
            block.timestamp - lastDistributed >= 1 days,
            "Can only distribute once a day"
        );

        uint256 balance = address(this).balance;

        uint256 fee = (balance * globalFee) / 10000;

        address payable owner = payable(owner());

        owner.transfer(fee);

        uint256 total = balance - fee;

        uint256 perIdentity = total /
            IMecenateUsers(_usersContract).getUserCount();

        for (
            uint256 i = 0;
            i < IMecenateUsers(_usersContract).getUserCount();
            i++
        ) {
            address payable _owner = payable(
                IMecenateUsers(_usersContract).getUserAddressAt(i)
            );

            _owner.transfer(perIdentity);
        }

        lastDistributed = block.timestamp;
    }

    receive() external payable {}
}
