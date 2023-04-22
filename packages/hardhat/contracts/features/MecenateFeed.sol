// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "../modules/Events.sol";
import "../modules/Creation.sol";
import "../modules/Acceptance.sol";
import "../modules/Submission.sol";
import "../modules/Finalization.sol";
import "../modules/Renounce.sol";

import "../modules/Data.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateFeed is
    Ownable,
    Data,
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
        address _identityContract
    ) Data(_usersModuleContract, _identityContract) {
        _transferOwnership(owner);
    }

    function getSeller() public view returns (address) {
        return post.postdata.settings.seller;
    }

    function getBuyer() public view returns (address) {
        return post.postdata.settings.buyer;
    }

    function getBuyerPayment() public view returns (uint256) {
        return post.postdata.escrow.payment;
    }

    function getSellerStake() public view returns (uint256) {
        return post.postdata.escrow.stake;
    }

    function getPostStatus() public view returns (Structures.PostStatus) {
        return post.postdata.settings.status;
    }

    function getPostCount() public view returns (uint256) {
        return postCount;
    }

    function changeUsersModuleContract(
        address _usersModuleContract
    ) external onlyOwner {
        usersModuleContract = _usersModuleContract;
    }

    function changeIdentityContract(
        address _identityContract
    ) external onlyOwner {
        identityContract = _identityContract;
    }
}
