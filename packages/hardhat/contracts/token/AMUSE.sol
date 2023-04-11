// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AMUSE is ERC20, Ownable {
    IERC20 public lockedToken;
    uint256 public constant LOCK_DURATION = 3 weeks;

    struct LockInfo {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => LockInfo) public locks;

    constructor(
        address _lockedToken
    ) ERC20("Authorized Mecenate Universal Support Economy", "AMUSE") {
        lockedToken = IERC20(_lockedToken);
    }

    function lock(uint256 _amount) external {
        require(_amount > 0, "Lock amount should be greater than 0");
        require(
            lockedToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer of locked tokens failed"
        );

        LockInfo storage lockInfo = locks[msg.sender];
        lockInfo.amount = _amount;
        lockInfo.unlockTime = block.timestamp + LOCK_DURATION;

        _mint(msg.sender, _amount);
    }

    function unlock() external {
        LockInfo storage lockInfo = locks[msg.sender];
        require(lockInfo.amount > 0, "No locked tokens found");
        require(
            block.timestamp >= lockInfo.unlockTime,
            "Unlock duration not reached"
        );

        lockedToken.transfer(msg.sender, lockInfo.amount);

        lockInfo.amount = 0;
        lockInfo.unlockTime = 0;
    }
}
