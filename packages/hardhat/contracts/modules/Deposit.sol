pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Deposit
/// @author scobru
/// @dev Version: 1.0.0
/// @notice This module allows for tracking user deposits of ETH.
contract Deposit {
  using SafeMath for uint256;

  mapping(address => uint256) private _deposit;

  event DepositIncreased(address user, uint256 amount, uint256 newDeposit);
  event DepositDecreased(address user, uint256 amount, uint256 newDeposit);

  /// @notice Increase the deposit of a user.
  /// @param user address of the user.
  /// @param amountToAdd uint256 amount by which to increase the deposit.
  /// @return newDeposit uint256 amount of the updated deposit.
  function _increaseDeposit(address user, uint256 amountToAdd) internal returns (uint256 newDeposit) {
    // calculate new deposit amount
    newDeposit = _deposit[user].add(amountToAdd);

    // set new stake to storage
    _deposit[user] = newDeposit;

    // emit event
    emit DepositIncreased(user, amountToAdd, newDeposit);

    // return
    return newDeposit;
  }

  function _decreaseDeposit(address user, uint256 amountToRemove) internal returns (uint256 newDeposit) {
    // get current deposit
    uint256 currentDeposit = _deposit[user];

    // check if sufficient deposit
    require(currentDeposit >= amountToRemove, "insufficient deposit to remove");

    // calculate new deposit amount
    newDeposit = currentDeposit.sub(amountToRemove);

    // set new stake to storage
    _deposit[user] = newDeposit;

    // emit event
    emit DepositDecreased(user, amountToRemove, newDeposit);

    // return
    return newDeposit;
  }

  /// @notice Set the deposit of a user to zero.
  /// @param user address of the user.
  /// @return amountRemoved uint256 amount removed from deposit.
  function _clearDeposit(address user) internal returns (uint256 amountRemoved) {
    // get current deposit
    uint256 currentDeposit = _deposit[user];

    // remove deposit
    _decreaseDeposit(user, currentDeposit);

    // return
    return currentDeposit;
  }

  // view functions

  /// @notice Get the current deposit of a user.
  /// @param user address of the user.
  /// @return deposit uint256 current amount of the deposit.
  function _getDeposit(address user) internal view returns (uint256 deposit) {
    return _deposit[user];
  }
}
