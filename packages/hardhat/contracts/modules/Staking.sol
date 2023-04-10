pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./TokenManager.sol";
import "./Deposit.sol";
import "./Data.sol";

import "../library/Structures.sol";

abstract contract Staking is Data, Deposit, TokenManager {
    using SafeMath for uint256;

    event StakeBurned(
        Structures.Tokens tokenID,
        address staker,
        uint256 amount
    );

    function _addStake(
        Structures.Tokens tokenID,
        address staker,
        address funder,
        uint256 amountToAdd
    ) internal returns (uint256 newStake) {
        // update deposit
        newStake = Deposit._increaseDeposit(tokenID, staker, amountToAdd);

        // transfer the stake amount
        TokenManager._transferFrom(tokenID, funder, address(this), amountToAdd);

        // explicit return
        return newStake;
    }

    function _takeStake(
        Structures.Tokens tokenID,
        address staker,
        address recipient,
        uint256 amountToTake
    ) internal returns (uint256 newStake) {
        // update deposit
        newStake = Deposit._decreaseDeposit(tokenID, staker, amountToTake);

        // transfer the stake amount
        TokenManager._transfer(tokenID, recipient, amountToTake);

        // explicit return
        return newStake;
    }

    function _takeFullStake(
        Structures.Tokens tokenID,
        address staker,
        address recipient
    ) internal returns (uint256 amountTaken) {
        // get deposit
        uint256 currentDeposit = Deposit._getDeposit(tokenID, staker);

        // take full stake
        _takeStake(tokenID, staker, recipient, currentDeposit);

        // return
        return currentDeposit;
    }

    function _burnStake(
        Structures.Tokens tokenID,
        address staker,
        uint256 amountToBurn
    ) internal returns (uint256 newStake) {
        // update deposit
        uint256 newDeposit = Deposit._decreaseDeposit(
            tokenID,
            staker,
            amountToBurn
        );

        if (router == address(0)) {
            // burn the stake amount
            TokenManager._transfer(
                tokenID,
                IMecenateFactory(factoryContract).treasuryContract(),
                amountToBurn
            );
        } else {
            // burn the stake amount
            TokenManager._burn(tokenID, amountToBurn);
        }
        // burn the stake amount

        // emit event
        emit StakeBurned(tokenID, staker, amountToBurn);

        // return
        return newDeposit;
    }

    function _burnFullStake(
        Structures.Tokens tokenID,
        address staker
    ) internal returns (uint256 amountBurned) {
        // get deposit
        uint256 currentDeposit = Deposit._getDeposit(tokenID, staker);

        // burn full stake
        _burnStake(tokenID, staker, currentDeposit);

        // return
        return currentDeposit;
    }

    function getStake(address staker) public view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(tokenERC20Contract, staker);
        // explicit return
        return amount;
    }

    function getTotalStaked() public view returns (uint256) {
        uint256 amountSeller = Deposit._getDeposit(
            tokenERC20Contract,
            post.postdata.settings.seller
        );

        uint256 amountBuyer = Deposit._getDeposit(
            tokenERC20Contract,
            post.postdata.settings.buyer
        );

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
                post.postdata.settings.status ==
                Structures.PostStatus.Proposed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Renounced,
            "Wrong Status"
        );

        uint256 stakerBalance;

        if (msg.sender == post.postdata.settings.buyer) {
            stakerBalance = _addStake(
                tokenERC20Contract,
                msg.sender,
                msg.sender,
                msg.value
            );
            post.postdata.escrow.payment = stakerBalance;
        } else if (msg.sender == post.postdata.settings.seller) {
            stakerBalance = _addStake(
                tokenERC20Contract,
                msg.sender,
                msg.sender,
                msg.value
            );
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
                post.postdata.settings.status ==
                Structures.PostStatus.Proposed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Renounced,
            "Wrong Status"
        );

        uint256 currentDeposit = Deposit._getDeposit(
            tokenERC20Contract,
            msg.sender
        );
        uint256 stakerBalance;

        require(currentDeposit >= amountToTake, "Not enough deposit");

        if (msg.sender == post.postdata.settings.buyer) {
            stakerBalance = _takeStake(
                tokenERC20Contract,
                msg.sender,
                msg.sender,
                amountToTake
            );
            post.postdata.escrow.payment = stakerBalance;
        } else if (msg.sender == post.postdata.settings.seller) {
            stakerBalance = _takeStake(
                tokenERC20Contract,
                msg.sender,
                msg.sender,
                amountToTake
            );
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
                Structures.PostStatus.Finalized ||
                post.postdata.settings.status ==
                Structures.PostStatus.Revealed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Punished ||
                post.postdata.settings.status ==
                Structures.PostStatus.Proposed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Renounced,
            "Wrong Status"
        );
        uint256 currentDeposit = Deposit._getDeposit(
            tokenERC20Contract,
            msg.sender
        );
        uint256 stakerBalance = _takeFullStake(
            tokenERC20Contract,
            msg.sender,
            msg.sender
        );
        payable(msg.sender).transfer(stakerBalance);
        return stakerBalance;
    }
}
