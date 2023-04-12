// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./modules/Swapper.sol";
import "../interfaces/IMecenateIdentity.sol";

contract MecenateTreasury is Ownable, Swapper {
    using SafeERC20 for IERC20;

    uint256 public globalFee = 100;

    uint256 public fixedFee = 0.01 * 1e18;

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

    function distribute(uint256 amount) {
        uint256 balance = address(this).balance;
        uint256 fee = balance.mul(globalFee).div(10000);
        uint256 total = balance.sub(fee);
        uint256 perIdentity = total.div(
            IMecenateIdentity(identityContract).getTotalIdentities()
        );
        for (
            uint256 i = 0;
            i < IMecenateIdentity(identityContract).getTotalIdentities();
            i++
        ) {
            address payable owner = payable(
                IMecenateIdentity(identityContract).getOwnerById(i)
            );
            owner.transfer(perIdentity);
        }
    }

    receive() external payable {}
}
