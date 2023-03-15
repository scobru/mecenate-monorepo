// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

interface IUsers {
  function getUserData(address user) external view returns (Structures.User memory);
}

interface IIdentity {
  function identityByAddress(address user) external view returns (uint256);
}

/**
 * @title Creation
 * @author scobru
 * @notice Contract for creating posts
 */
abstract contract Creation is Data, Events, Staking {
  constructor(address _usersModuleContract, address _identityContract) {
    usersModuleContract = _usersModuleContract;
    identityContract = _identityContract;
    post.postdata.settings.status = Structures.PostStatus.Waiting;
  }

  /**
   * @dev Creates a new post
   * @param encryptedHash -uploaded ipfs hash
   * @param postType - type of post
   * @param postDuration - duration of post
   * @return post - created post
   */
  function createPost(
    bytes memory encryptedHash,
    Structures.PostType postType,
    Structures.PostDuration postDuration
  ) external payable returns (Structures.Post memory) {
    require(msg.value > 0, "Stake must be greater than 0");
    require(usersModuleContract != address(0), "Users module contract not set");
    require(identityContract != address(0), "Identity contract not set");
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Wating or Finalized"
    );

    uint256 stake = _addStake(msg.sender, msg.value);
    uint256 duration;

    if (Structures.PostDuration(postDuration) == Structures.PostDuration.OneDay) {
      duration = 1 days;
    } else if (Structures.PostDuration(postDuration) == Structures.PostDuration.ThreeDays) {
      duration = 3 days;
    } else if (Structures.PostDuration(postDuration) == Structures.PostDuration.OneWeek) {
      duration = 7 days;
    } else if (Structures.PostDuration(postDuration) == Structures.PostDuration.TwoWeeks) {
      duration = 14 days;
    } else if (Structures.PostDuration(postDuration) == Structures.PostDuration.OneMonth) {
      duration = 30 days;
    }

    Structures.User memory creator = Structures.User({
      mecenateID: IIdentity(identityContract).identityByAddress(msg.sender),
      wallet: msg.sender,
      publicKey: bytes(IUsers(usersModuleContract).getUserData(msg.sender).publicKey)
    });

    Structures.PostData memory postdata = Structures.PostData({
      settings: Structures.PostSettings({
        postType: Structures.PostType(postType),
        status: Structures.PostStatus.Proposed,
        buyer: address(0),
        buyerPubKey: "0x00",
        seller: msg.sender,
        creationTimeStamp: block.timestamp,
        endTimeStamp: 0,
        duration: duration
      }),
      escrow: Structures.PostEscrow({stake: stake, payment: 0, punishment: 0, buyerPunishment: 0}),
      data: Structures.PostEncryptedData({encryptedData: encryptedHash, encryptedKey: "0x00", decryptedData: "0x00"})
    });

    Structures.Post memory _post = Structures.Post({creator: creator, postdata: postdata});

    post = _post;

    emit Created(post);

    return Structures.Post({creator: creator, postdata: postdata});
  }

  function addStake() external payable returns (uint256) {
    require(
      post.postdata.settings.status == Structures.PostStatus.Waiting ||
        post.postdata.settings.status == Structures.PostStatus.Finalized,
      "Not Waiting or Finalized"
    );

    uint256 stakerBalance;

    if (msg.sender == post.postdata.settings.buyer) {
      stakerBalance = _addStake(msg.sender, msg.value);
      post.postdata.escrow.payment = stakerBalance;
    } else if (msg.sender == post.postdata.settings.seller) {
      stakerBalance = _addStake(msg.sender, msg.value);
      post.postdata.escrow.stake = stakerBalance;
    }

    return stakerBalance;
  }

  function changeUsersModuleContract(address _usersModuleContract) external onlyOwner {
    usersModuleContract = _usersModuleContract;
  }

  function changeIdentityContract(address _identityContract) external onlyOwner {
    identityContract = _identityContract;
  }
}
