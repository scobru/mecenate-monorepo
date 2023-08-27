pragma solidity 0.8.19;

import "./Deposit.sol";
import "./Events.sol";

abstract contract Staking is Events, Deposit {
    using SafeMath for uint256;

    event StakeBurned(address staker, uint256 amount);

    // create modifier
    modifier checkStatus() {
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
        _;
    }

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

    function getStake(address staker) external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(staker);
        // explicit return
        return amount;
    }

    function getTotalStaked() external view returns (uint256) {
        uint256 amountSeller = Deposit._getDeposit(postSettingPrivate.seller);

        uint256 amountBuyer = Deposit._getDeposit(postSettingPrivate.buyer);

        return (amountSeller + amountBuyer);
    }

    function addStake(
        bytes memory sismoConnectResponse
    ) external payable checkStatus returns (uint256) {
        (, , , address userAddressConverted) = sismoVerify(
            sismoConnectResponse
        );

        uint256 stakerBalance;

        if (userAddressConverted == postSettingPrivate.buyer) {
            stakerBalance = _addStake(userAddressConverted, msg.value);
            post.postdata.escrow.payment = stakerBalance;
        } else if (userAddressConverted == postSettingPrivate.seller) {
            stakerBalance = _addStake(userAddressConverted, msg.value);
            post.postdata.escrow.stake = stakerBalance;
        } else {
            revert("Not buyer or seller");
        }

        return stakerBalance;
    }

    function takeStake(
        uint256 amountToTake,
        bytes memory sismoConnectResponse
    ) external payable checkStatus returns (uint256) {
        (, , , address userAddressConverted) = sismoVerify(
            sismoConnectResponse
        );

        uint256 currentDeposit = Deposit._getDeposit(userAddressConverted);

        uint256 stakerBalance;

        require(currentDeposit >= amountToTake, "Not enough deposit");

        if (postSettingPrivate.buyer != postSettingPrivate.seller) {
            if (userAddressConverted == postSettingPrivate.buyer) {
                stakerBalance = _takeStake(userAddressConverted, amountToTake);
                post.postdata.escrow.payment = stakerBalance;
            } else if (userAddressConverted == postSettingPrivate.seller) {
                stakerBalance = _takeStake(userAddressConverted, amountToTake);
                post.postdata.escrow.stake = stakerBalance;
            } else {
                revert("Not buyer or seller");
            }
        } else {
            stakerBalance = _takeStake(userAddressConverted, amountToTake);
            post.postdata.escrow.payment = stakerBalance;
            post.postdata.escrow.stake = stakerBalance;
        }

        IMecenateWallet(walletContract).deposit{value: amountToTake}(
            sismoConnectResponse
        );

        return stakerBalance;
    }

    function takeFullStake(
        bytes memory sismoConnectResponse
    ) external payable checkStatus returns (uint256) {
        (, , , address userAddressConverted) = sismoVerify(
            sismoConnectResponse
        );
        uint256 stakerBalance = _takeFullStake(userAddressConverted);

        IMecenateWallet(walletContract).deposit{value: stakerBalance}(
            sismoConnectResponse
        );

        return stakerBalance;
    }
}
