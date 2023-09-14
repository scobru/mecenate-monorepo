/**
 * @title MecenateFeed
 * @dev This contract implements the MecenateFeed feature, which allows users to create and manage posts for crowdfunding campaigns.
 * The contract inherits from several modules that provide functionality for post creation, acceptance, submission, finalization, and renouncement.
 * The contract also provides several view functions to retrieve information about a post's buyer payment, seller deposit, seller stake, buyer stake, payment requested, post status, and post count.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../modules/Events.sol";
import "../modules/Creation.sol";
import "../modules/Acceptance.sol";
import "../modules/Submission.sol";
import "../modules/Finalization.sol";
import "../modules/Renounce.sol";

import "../modules/Message.sol";

contract MecenateFeed is
    Events,
    Message,
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
        address _verifierContract
    ) Data(_usersModuleContract, _verifierContract) {
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
