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
        address owner,
        address _usersModuleContract,
        address _verifierContract
    ) Data(_usersModuleContract, _verifierContract) {
        _transferOwnership(owner);
    }

    function getSeller() external view returns (address) {
        return post.postdata.settings.seller;
    }

    function getBuyer() external view returns (address) {
        return post.postdata.settings.buyer;
    }

    function getBuyerPayment() external view returns (uint256) {
        return post.postdata.escrow.payment;
    }

    function getSellerStake() external view returns (uint256) {
        return post.postdata.escrow.stake;
    }

    function getPostStatus() external view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }

    function getPostCount() external view returns (uint256) {
        return postCount;
    }

    function changeUsersModuleContract(
        address _usersModuleContract
    ) external onlyOwner {
        usersModuleContract = _usersModuleContract;
    }
}
