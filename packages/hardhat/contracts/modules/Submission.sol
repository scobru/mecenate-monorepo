// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title Submission
 * @notice Contract for submitting posts
 * @dev Contract for submitting posts
 */

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";

abstract contract Submission is Data, Events {
  /**
   * @notice Submits the encrypted hash
   * @param  encryptedKey - encrypted hash of the post
   */
  function submitHash(bytes memory encryptedKey) public virtual {
    require(IUsers(usersModuleContract).checkifUserExist(msg.sender), "User does not exist");
    require(post.postdata.settings.status == Structures.PostStatus.Accepted, "Post is not Accepted");
    require(post.creator.wallet == msg.sender, "You are not the creator");
    post.postdata.data.encryptedKey = encryptedKey;
    post.postdata.settings.status = Structures.PostStatus.Submitted;
    post.postdata.settings.endTimeStamp = block.timestamp + post.postdata.settings.duration;

    emit Valid(post);
  }

  /**
   * @notice Reveals the encrypted hash
   * @param  decryptedData - encrypted hash of the post
   * @return bytes32 encryptedHash - encrypted hash of the post
   */
  function revealData(bytes memory decryptedData) public virtual returns (bytes memory) {
    require(post.postdata.settings.status == Structures.PostStatus.Finalized, "Post is not Finalized");
    require(post.postdata.settings.seller == msg.sender, "You are not the buyer");
    post.postdata.data.decryptedData = decryptedData;
    post.postdata.settings.status = Structures.PostStatus.Revealed;
    return post.postdata.data.decryptedData;
  }
}
