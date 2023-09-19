pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Deposit
 * @dev This contract manages user deposits of ERC20 tokens.
 */
contract Deposit {
    using SafeMath for uint256;

    mapping(bytes32 => uint256) private _deposit;

    event DepositIncreased(bytes32 user, uint256 amount, uint256 newDeposit);
    event DepositDecreased(bytes32 user, uint256 amount, uint256 newDeposit);

    function _increaseDeposit(
        bytes32 user,
        uint256 amountToAdd
    ) internal returns (uint256 newDeposit) {
        newDeposit = _deposit[user].add(amountToAdd);

        _deposit[user] = newDeposit;

        emit DepositIncreased(user, amountToAdd, newDeposit);

        return newDeposit;
    }

    function _decreaseDeposit(
        bytes32 user,
        uint256 amountToRemove
    ) internal returns (uint256 newDeposit) {
        uint256 currentDeposit = _deposit[user];

        require(
            currentDeposit >= amountToRemove,
            "insufficient deposit to remove"
        );

        newDeposit = currentDeposit.sub(amountToRemove);

        _deposit[user] = newDeposit;

        emit DepositDecreased(user, amountToRemove, newDeposit);

        return newDeposit;
    }

    function _clearDeposit(
        bytes32 user
    ) internal returns (uint256 amountRemoved) {
        uint256 currentDeposit = _deposit[user];

        _decreaseDeposit(user, currentDeposit);

        return currentDeposit;
    }

    function _getDeposit(bytes32 user) internal view returns (uint256 deposit) {
        return _deposit[user];
    }
}
