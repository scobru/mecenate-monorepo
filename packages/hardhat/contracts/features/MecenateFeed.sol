// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../modules/Events.sol";
import "../modules/Creation.sol";
import "../modules/Acceptance.sol";
import "../modules/Submission.sol";
import "../modules/Finalization.sol";
import "../modules/Renounce.sol";

contract MecenateFeed is
    Events,
    Creation,
    Acceptance,
    Renounce,
    Submission,
    Finalization
{
    using Structures for Structures.Post;

    constructor(
        bytes32 _owner,
        address _usersModuleContract,
        address _verifierContract,
        address _walletContract
    ) Data(_usersModuleContract, _verifierContract, _walletContract) {
        owner = _owner;
    }

    function getBuyerPayment() external view returns (uint256) {
        return post.postdata.escrow.payment;
    }

    function getSellerDeposit() external view returns (uint256) {
        return post.postdata.escrow.stake;
    }

    function getSellerStake() external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(postSettingPrivate.seller);
        // explicit return
        return amount;
    }

    function getBuyerStake() external view returns (uint256 amount) {
        // get deposit
        amount = Deposit._getDeposit(postSettingPrivate.buyer);
        // explicit return
        return amount;
    }

    function getPaymentRequested() external view returns (uint256) {
        return post.postdata.escrow.payment;
    }

    function getStakeRequested() external view returns (uint256) {
        return post.postdata.escrow.stake;
    }

    function getPostStatus() external view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }

    function getPostCount() external view returns (uint256) {
        return postCount;
    }
}
