pragma solidity 0.8.19;

import "./Deposit.sol";

/// @title Staking
/// @author scobru
/// @dev Security contact: security@numer.ai
/// @dev Version: 1.0.0
/// @notice This module wraps the Deposit functions and the ERC20 functions to provide combined actions.
contract Staking is Deposit {
  using SafeMath for uint256;

  event StakeBurned(address staker, uint256 amount);

  /// @notice Transfer and deposit ERC20 tokens to this contract.
  /// @param staker Address of the staker who owns the stake.
  /// @param amountToAdd uint256 amount of tokens (18 decimals) to be added to the stake.
  /// @return newStake uint256 amount of tokens (18 decimals) remaining in the stake.
  function _addStake(address staker, uint256 amountToAdd) internal returns (uint256 newStake) {
    // update deposit
    newStake = Deposit._increaseDeposit(staker, amountToAdd);
    // explicit return
    return newStake;
  }

  /// @notice Withdraw some deposited stake and transfer to recipient.
  /// @param staker Address of the staker who owns the stake.
  /// @param amountToTake uint256 amount of tokens (18 decimals) to be remove from the stake.
  /// @return newStake uint256 amount of tokens (18 decimals) remaining in the stake.
  function _takeStake(address staker, uint256 amountToTake) internal returns (uint256 newStake) {
    // update deposit
    newStake = Deposit._decreaseDeposit(staker, amountToTake);
    // explicit return
    return newStake;
  }

  /// @notice Withdraw all deposited stake and transfer to recipient.
  /// @param staker Address of the staker who owns the stake.
  /// @return amountTaken uint256 amount of tokens (18 decimals) taken from the stake.
  function _takeFullStake(address staker) internal returns (uint256 amountTaken) {
    // get deposit
    uint256 currentDeposit = Deposit.getDeposit(staker);

    // take full stake
    _takeStake(staker, currentDeposit);

    // return
    return currentDeposit;
  }

  /// @notice Burn some deposited stake.
  /// @param staker Address of the staker who owns the stake.
  /// @param amountToBurn uint256 amount of tokens (18 decimals) to be burn from the stake.
  /// @return newStake uint256 amount of tokens (18 decimals) remaining in the stake.
  function _burnStake(address staker, uint256 amountToBurn) internal returns (uint256 newStake) {
    // update deposit
    uint256 newDeposit = Deposit._decreaseDeposit(staker, amountToBurn);

    // emit event
    emit StakeBurned(staker, amountToBurn);

    // return
    return newDeposit;
  }

  /// @notice Burn all deposited stake.
  /// @param staker Address of the staker who owns the stake.
  /// @return amountBurned uint256 amount of tokens (18 decimals) taken from the stake.
  function _burnFullStake(address staker) internal returns (uint256 amountBurned) {
    // get deposit
    uint256 currentDeposit = Deposit.getDeposit(staker);

    // burn full stake
    _burnStake(staker, currentDeposit);

    // return
    return currentDeposit;
  }
}
