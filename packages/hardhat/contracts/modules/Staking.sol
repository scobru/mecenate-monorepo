pragma solidity 0.8.19;

import "./Deposit.sol";
import "./Data.sol";

abstract contract Staking is Data, Deposit {
    using SafeMath for uint256;

    event StakeBurned(address staker, uint256 amount);

    function _addStake(
        address staker,
        uint256 amountToAdd
    ) internal returns (uint256 newStake) {
        // update deposit
        newStake = Deposit._increaseDeposit(staker, amountToAdd);
        // explicit return
        return newStake;
    }

    function _takeStake(
        address staker,
        uint256 amountToTake
    ) internal returns (uint256 newStake) {
        // update deposit
        newStake = Deposit._decreaseDeposit(staker, amountToTake);
        // explicit return
        return newStake;
    }

    function _takeFullStake(
        address staker
    ) internal returns (uint256 amountTaken) {
        // get deposit
        uint256 currentDeposit = Deposit._getDeposit(staker);

        // take full stake
        _takeStake(staker, currentDeposit);

        // return
        return currentDeposit;
    }

    function _burnStake(
        address staker,
        uint256 amountToBurn
    ) internal returns (uint256 newStake) {
        // update deposit
        uint256 newDeposit = Deposit._decreaseDeposit(staker, amountToBurn);

        // emit event
        emit StakeBurned(staker, amountToBurn);

        // return
        return newDeposit;
    }

    function _burnFullStake(
        address staker
    ) internal returns (uint256 amountBurned) {
        // get deposit
        uint256 currentDeposit = Deposit._getDeposit(staker);

        // burn full stake
        _burnStake(staker, currentDeposit);

        // return
        return currentDeposit;
    }

    function getStake(address staker) public view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(staker);
        // explicit return
        return amount;
    }

    function getTotalStaked() public view returns (uint256) {
        uint256 amountSeller = Deposit._getDeposit(
            post.postdata.settings.seller
        );

        uint256 amountBuyer = Deposit._getDeposit(post.postdata.settings.buyer);

        return (amountSeller + amountBuyer);
    }

    function addStake() external payable returns (uint256) {
        require(
            post.postdata.settings.status == Structures.PostStatus.Waiting ||
                post.postdata.settings.status ==
                Structures.PostStatus.Finalized ||
                post.postdata.settings.status ==
                Structures.PostStatus.Revealed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Punished ||
                post.postdata.settings.status == Structures.PostStatus.Proposed,
            "Not Waiting or Finalized or Proposed"
        );

        uint256 stakerBalance;

        if (msg.sender == post.postdata.settings.buyer) {
            stakerBalance = _addStake(msg.sender, msg.value);
            post.postdata.escrow.payment = stakerBalance;
        } else if (msg.sender == post.postdata.settings.seller) {
            stakerBalance = _addStake(msg.sender, msg.value);
            post.postdata.escrow.stake = stakerBalance;
        } else {
            revert("Not buyer or seller");
        }

        return stakerBalance;
    }

    function takeStake(
        uint256 amountToTake
    ) external payable returns (uint256) {
        require(
            post.postdata.settings.status == Structures.PostStatus.Waiting ||
                post.postdata.settings.status ==
                Structures.PostStatus.Finalized ||
                post.postdata.settings.status ==
                Structures.PostStatus.Revealed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Punished ||
                post.postdata.settings.status == Structures.PostStatus.Proposed,
            "Not Waiting or Finalized or Proposed"
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
        } else {
            revert("Not buyer or seller");
        }

        payable(msg.sender).transfer(amountToTake);

        return stakerBalance;
    }

    function takeFullStake() external payable returns (uint256) {
        require(
            post.postdata.settings.status == Structures.PostStatus.Waiting ||
                post.postdata.settings.status ==
                Structures.PostStatus.Finalized,
            "Not Waiting or Finalized"
        );
        uint256 currentDeposit = Deposit._getDeposit(msg.sender);
        uint256 stakerBalance = _takeFullStake(msg.sender);
        payable(msg.sender).transfer(stakerBalance);
        return stakerBalance;
    }
}
