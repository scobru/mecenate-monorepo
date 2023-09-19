/**
 * @title Staking
 * @dev This contract handles staking functionality for the Mecenate platform.
 * It allows users to add, take, and burn stakes, and provides functions to get the total staked amount and individual stake amounts.
 * It also includes a modifier to check the status of a post before allowing stake-related transactions.
 */
pragma solidity 0.8.19;

import "./Deposit.sol";
import "./Events.sol";

abstract contract Staking is Events, Deposit {
    using SafeMath for uint256;

    event StakeBurned(bytes32 staker, uint256 amount);

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
        bytes32 staker,
        uint256 amountToAdd
    ) internal returns (uint256 newStake) {
        // update deposit
        newStake = Deposit._increaseDeposit(staker, amountToAdd);
        // explicit return
        return newStake;
    }

    function _takeStake(
        bytes32 staker,
        uint256 amountToTake
    ) internal returns (uint256 newStake) {
        // update deposit
        newStake = Deposit._decreaseDeposit(staker, amountToTake);
        // explicit return
        return newStake;
    }

    function _takeFullStake(
        bytes32 staker
    ) internal returns (uint256 amountTaken) {
        // get deposit
        uint256 currentDeposit = Deposit._getDeposit(staker);

        // take full stake
        currentDeposit = _takeStake(staker, currentDeposit);

        // return
        return currentDeposit;
    }

    function _burnStake(
        bytes32 staker,
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
        bytes32 staker
    ) internal returns (uint256 amountBurned) {
        // get deposit
        uint256 currentDeposit = Deposit._getDeposit(staker);

        // burn full stake
        _burnStake(staker, currentDeposit);

        // return
        return currentDeposit;
    }

    function getStake(bytes32 staker) external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(staker);
        // explicit return
        return amount;
    }

    function getTotalStaked() external view returns (uint256) {
        uint256 amountSeller = Deposit._getDeposit(
            keccak256(postSettingPrivate.vaultIdSeller)
        );

        uint256 amountBuyer = Deposit._getDeposit(
            keccak256(postSettingPrivate.vaultIdBuyer)
        );

        return (amountSeller + amountBuyer);
    }

    function addStake(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external payable checkStatus returns (uint256) {
        // verify user
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);
        uint256 stakerBalance;

        require(
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller),
            "VaultId does not match"
        );

        // check if user

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer)) {
            stakerBalance = _addStake(encryptedVaultId, msg.value);
            post.postdata.escrow.payment = stakerBalance;
        } else if (
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)
        ) {
            stakerBalance = _addStake(encryptedVaultId, msg.value);
            post.postdata.escrow.stake = stakerBalance;
        }

        return stakerBalance;
    }

    function takeStake(
        uint256 amountToTake,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external checkStatus returns (uint256) {
        // verify user
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        uint256 currentDeposit = Deposit._getDeposit(encryptedVaultId);

        uint256 stakerBalance;

        require(currentDeposit >= amountToTake, "Not enough deposit");

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer)) {
            stakerBalance = _takeStake(encryptedVaultId, amountToTake);

            post.postdata.escrow.payment = stakerBalance;

            //send to vault instead

            (bool result, ) = vaultContract.call{value: amountToTake}(
                abi.encode(encryptedVaultId)
            );
            require(result, "Vault call failed");
        } else if (
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)
        ) {
            stakerBalance = _takeStake(encryptedVaultId, amountToTake);

            post.postdata.escrow.stake = stakerBalance;

            (bool result, ) = vaultContract.call{value: amountToTake}(
                abi.encode(encryptedVaultId)
            );
            require(result, "Vault call failed");
        }

        return stakerBalance;
    }

    function takeFullStake(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) external checkStatus returns (uint256) {
        // verify user
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer)) {
            require(
                twitterId == postSettingPrivate.buyerTwitterId,
                "Not the buyer"
            );
        } else if (
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)
        ) {
            require(
                twitterId == postSettingPrivate.sellerTwitterId,
                "Not the seller"
            );
        }

        uint256 stakerBalance;

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer)) {
            stakerBalance = _takeFullStake(encryptedVaultId);
            post.postdata.escrow.payment = stakerBalance;

            (bool result, ) = vaultContract.call{value: stakerBalance}(
                abi.encode(encryptedVaultId)
            );
            require(result, "Vault call failed");
        } else if (
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller)
        ) {
            stakerBalance = _takeFullStake(encryptedVaultId);
            post.postdata.escrow.stake = stakerBalance;
            (bool result, ) = vaultContract.call{value: stakerBalance}(
                abi.encode(encryptedVaultId)
            );
            require(result, "Vault call failed");
        }

        return stakerBalance;
    }
}
