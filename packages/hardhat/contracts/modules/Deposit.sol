pragma solidity 0.8.19;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./TokenManager.sol";

contract Deposit {
    using SafeMath for uint256;

    mapping(uint256 => mapping(address => uint256)) private _deposit;

    event DepositIncreased(
        Structures.Tokens tokenID,
        address user,
        uint256 amount,
        uint256 newDeposit
    );
    event DepositDecreased(
        Structures.Tokens tokenID,
        address user,
        uint256 amount,
        uint256 newDeposit
    );

    function _increaseDeposit(
        Structures.Tokens tokenID,
        address user,
        uint256 amountToAdd
    ) internal returns (uint256 newDeposit) {
        // calculate new deposit amount
        newDeposit = _deposit[uint256(tokenID)][user].add(amountToAdd);

        // set new stake to storage
        _deposit[uint256(tokenID)][user] = newDeposit;

        // emit event
        emit DepositIncreased(tokenID, user, amountToAdd, newDeposit);

        // return
        return newDeposit;
    }

    function _decreaseDeposit(
        Structures.Tokens tokenID,
        address user,
        uint256 amountToRemove
    ) internal returns (uint256 newDeposit) {
        // get current deposit
        uint256 currentDeposit = _deposit[uint256(tokenID)][user];

        // check if sufficient deposit
        require(
            currentDeposit >= amountToRemove,
            "insufficient deposit to remove"
        );

        // calculate new deposit amount
        newDeposit = currentDeposit.sub(amountToRemove);

        // set new stake to storage
        _deposit[uint256(tokenID)][user] = newDeposit;

        // emit event
        emit DepositDecreased(tokenID, user, amountToRemove, newDeposit);

        // return
        return newDeposit;
    }

    function _clearDeposit(
        Structures.Tokens tokenID,
        address user
    ) internal returns (uint256 amountRemoved) {
        // get current deposit
        uint256 currentDeposit = _deposit[uint256(tokenID)][user];

        // remove deposit
        _decreaseDeposit(tokenID, user, currentDeposit);

        // return
        return currentDeposit;
    }

    function _getDeposit(
        Structures.Tokens tokenID,
        address user
    ) internal view returns (uint256 deposit) {
        return _deposit[uint256(tokenID)][user];
    }
}
