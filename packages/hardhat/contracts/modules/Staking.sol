pragma solidity 0.8.19;

import "./Deposit.sol";
import "./Data.sol";

/// @title Staking
/// @author scobru
/// @dev Security contact: security@numer.ai
/// @dev Version: 1.0.0
/// @notice This module wraps the Deposit functions and the ERC20 functions to provide combined actions.
contract Staking is Data, Deposit {
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
    uint256 currentDeposit = Deposit._getDeposit(staker);

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
    uint256 currentDeposit = Deposit._getDeposit(staker);

    // burn full stake
    _burnStake(staker, currentDeposit);

    // return
    return currentDeposit;
  }

  /// @notice Get the amount of tokens (18 decimals) in the stake of a user.
  /// @param staker Address of the staker who owns the stake.
  /// @return amount uint256 amount of tokens (18 decimals) in the stake.
  function getStake(address staker) public view returns (uint256 amount) {
    // get deposit
    amount = Deposit._getDeposit(staker);
    // explicit return
    return amount;
  }

  function getTotalStaked() public view returns (uint256) {
    uint256 amountSeller = Deposit._getDeposit(post.postdata.settings.seller);
    uint256 amountBuyer = Deposit._getDeposit(post.postdata.settings.buyer);

    return (amountSeller + amountBuyer);
  }

  function addStake() external payable returns (uint256) {
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Waiting or Finalized"
    );

    uint256 stakerBalance;

    if (msg.sender == post.postdata.settings.buyer) {
      stakerBalance = _addStake(msg.sender, msg.value);
      post.postdata.escrow.payment = stakerBalance;
    } else if (msg.sender == post.postdata.settings.seller) {
      stakerBalance = _addStake(msg.sender, msg.value);
      post.postdata.escrow.stake = stakerBalance;
    }

    return stakerBalance;
  }

  function takeStake(uint256 amountToTake) external payable returns (uint256) {
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Waiting or Finalized"
    );
    uint256 currentDeposit = Deposit._getDeposit(msg.sender);
    uint256 stakerBalance;
    require(currentDeposit >= amountToTake, "Not enough deposit");
    if (msg.sender == post.postdata.settings.buyer) {
      stakerBalance = _takeStake(msg.sender, amountToTake);
      post.postdata.escrow.payment = stakerBalance;
    } else if (msg.sender == post.postdata.settings.seller) {
      stakerBalance = _takeStake(msg.sender, amountToTake);
      post.postdata.escrow.stake = stakerBalance;
    }
    payable(msg.sender).transfer(amountToTake);

    return stakerBalance;
  }

  function takeFullStake() external payable returns (uint256) {
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Waiting or Finalized"
    );
    uint256 currentDeposit = Deposit._getDeposit(msg.sender);
    uint256 stakerBalance = _takeFullStake(msg.sender);
    payable(msg.sender).transfer(stakerBalance);
    return stakerBalance;
  }
}
