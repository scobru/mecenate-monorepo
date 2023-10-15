/**
 * @title Staking
 * @dev This contract handles staking functionality for the Mecenate platform.
 * It allows users to add, take, and burn stakes, and provides functions to get the total staked amount and individual stake amounts.
 * It also includes a modifier to check the status of a post before allowing stake-related transactions.
 */
pragma solidity 0.8.19;

import "./Deposit.sol";
import "./Events.sol";

abstract contract Staking is Events, Deposit, TokenManager {
    using SafeMath for uint256;

    event StakeBurned(bytes32 staker, uint256 amount);
    event StakeTaken(bytes32 staker, uint256 amount, Structures.Tokens tokenId);
    event StakeAdded(bytes32 staker, uint256 amount, Structures.Tokens tokenId);

    function _addStake(
        Structures.Tokens tokenId,
        address staker,
        address funder,
        uint256 amountToAdd
    ) internal returns (uint256 newStake) {
        Structures.PostStatus currentStatus = post.postdata.settings.status;
        require(
            currentStatus != Structures.PostStatus.Accepted &&
                currentStatus != Structures.PostStatus.Submitted,
            "INVALID_STATUS"
        );

        require(amountToAdd > 0, "STAKE_REQUIRED");

        if (tokenId != Structures.Tokens.NaN) {
            _transferFrom(tokenId, funder, address(this), amountToAdd);
        }

        newStake = Deposit._increaseDeposit(tokenId, staker, amountToAdd);

        emit StakeAdded(staker, amountToAdd, tokenId);

        return newStake;
    }

    function _takeStake(
        Structures.Tokens tokenId,
        address receiver,
    ) internal returns (uint256 newStake) {
        // Memorizza lo status del post in una variabile per evitare accessi ridondanti allo storage
        Structures.PostStatus currentStatus = post.postdata.settings.status;

        // Verifica che lo status del post sia valido per procedere
        require(
            currentStatus != Structures.PostStatus.Accepted &&
                currentStatus != Structures.PostStatus.Submitted,
            "INVALID_STATUS"
        );

        // Effettua il trasferimento del token o dell'Ether
        if (tokenId == Structures.Tokens.NaN) {
            //(bool result, ) = payable(_to).call{value: amountToTake}("");
            //require(result, "CALL_FAILED");
            payable(receiver).transfer(amountToTake);
        } else {
            _transfer(tokenId, receiver, amountToTake);
        }

        // Aggiorna il deposito e emette un evento
        newStake = Deposit._decreaseDeposit(tokenId, staker, amountToTake);
        emit StakeTaken(staker, amountToTake, tokenId);

        return newStake;
    }

    function _takeFullStake(
        Structures.Tokens tokenId,
        address staker,
        address receiver,
    ) internal returns (uint256 amountTaken) {
        uint256 currentDeposit = Deposit._getDeposit(tokenId, staker);

        uint256 newStake = _takeStake(tokenId, staker, receiver, currentDeposit);

        return newStake;
    }

    function _burnStake(
        Structures.Tokens tokenId,
        bytes32 staker,
        uint256 amountToBurn
    ) internal returns (uint256 newStake) {
        uint256 newDeposit = Deposit._decreaseDeposit(
            tokenId,
            staker,
            amountToBurn
        );

        bool burnEnabled = IMecenateFeedFactory(settings.factoryContract)
            .burnEnabled();

        address treasuryContract = IMecenateFeedFactory(
            settings.factoryContract
        ).treasuryContract();

        if (burnEnabled == false) {
            if (tokenId == Structures.Tokens.NaN) {
                (bool result, ) = payable(treasuryContract).call{
                    value: amountToBurn
                }("");
                require(result, "CALL_FAILED");
            } else {
                _transfer(tokenId, treasuryContract, amountToBurn);
            }
        } else {
            if (tokenId == Structures.Tokens.DAI) {
                _burnDai(amountToBurn);
            } else if (tokenId == Structures.Tokens.MUSE) {
                _burn(amountToBurn);
            } else if (tokenId == Structures.Tokens.NaN) {
                _burnWeth(amountToBurn);
            }
        }

        emit StakeBurned(staker, amountToBurn);

        return newDeposit;
    }

    function _burnFullStake(
        Structures.Tokens tokenId,
        bytes32 staker
    ) internal returns (uint256 amountBurned) {
        uint256 currentDeposit = Deposit._getDeposit(tokenId, staker);

        _burnStake(tokenId, staker, currentDeposit);

        return currentDeposit;
    }

    function getStake(
        Structures.Tokens tokenId,
        bytes32 staker
    ) external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(tokenId, staker);
        // explicit return
        return amount;
    }

    function getTotalStaked() external view returns (uint256) {
        uint256 amountSeller = Deposit._getDeposit(
            post.postdata.settings.tokenId,
            keccak256(postSettingPrivate.vaultIdSeller)
        );

        uint256 amountBuyer = Deposit._getDeposit(
            post.postdata.settings.tokenId,
            keccak256(postSettingPrivate.vaultIdBuyer)
        );

        return (amountSeller + amountBuyer);
    }

    function addStake(
        Structures.Tokens tokenId,
        uint256 amountToAdd,
        bytes32 encryptedVaultId
    ) external payable returns (uint256) {
        require(tokenId == post.postdata.settings.tokenId, "WRONG_TOKEN");

        // Check if the encryptedVaultId matches with either the buyer or the seller
        require(
            encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer) ||
                encryptedVaultId == keccak256(postSettingPrivate.vaultIdSeller),
            "VAULTID_MISMATCH"
        );

        // Determine the amount to add based on the role (buyer or seller)
        uint256 actualAmountToAdd = (encryptedVaultId ==
            keccak256(postSettingPrivate.vaultIdSeller))
            ? msg.value
            : amountToAdd;

        // Update the stake
        uint256 newStake = _addStake(
            tokenId,
            encryptedVaultId,
            msg.sender,
            actualAmountToAdd
        );

        // Update the corresponding escrow value based on the role
        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer)) {
            post.postdata.escrow.payment = newStake;
        } else {
            post.postdata.escrow.stake = newStake;
        }

        return newStake;
    }

    function takeStake(
        Structures.Tokens tokenId,
        address receiver
    ) external returns (uint256) {
        require(tokenId == post.postdata.settings.tokenId, "WRONG_TOKEN");

        uint256 currentDeposit = Deposit._getDeposit(tokenId, msg.sender);

        require(currentDeposit >= amountToTake, "NOT_ENOUGH_STAKE");

        uint256 newBalance = _takeStake(
            tokenId,
            msg.sender,
            receiver,
            amountToTake
        );

        if (encryptedVaultId == keccak256(postSettingPrivate.vaultIdBuyer)) {
            post.postdata.escrow.payment = newBalance;
        } else {
            post.postdata.escrow.stake = newBalance;
        }

        return newBalance;
    }

    function takeFullStake(
        Structures.Tokens tokenId,
        bytes memory sismoConnectResponse,
        address receiver
    ) external returns (uint256) {
        require(tokenId == post.postdata.settings.tokenId, "WRONG_TOKEN");

       
        uint256 newBalance = _takeFullStake(tokenId, msg.sender, receiver);

        if (msg.sender == postSettingPrivate.buyerAddress) {
            post.postdata.escrow.payment = newBalance;
        } else (msg.sender == postSettingPrivate.sellerAddress)) {
            post.postdata.escrow.stake = newBalance;
        }

        return newBalance;
    }

    function getSellerStake() external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(
            post.postdata.settings.tokenId,
            postSettingPrivate.sellerAddress
        );
        // explicit return
        return amount;
    }

    function getBuyerStake() external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(
            post.postdata.settings.tokenId,
            postSettingPrivate.buyerAddress
        );
        // explicit return
        return amount;
    }
}
