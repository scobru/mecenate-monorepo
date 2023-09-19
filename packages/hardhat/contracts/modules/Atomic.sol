/**
 * @title Renounce
 * @dev This abstract contract extends the Staking contract and provides functionality for a seller to renounce a post.
 * The seller can only renounce a post if they are the original creator of the post and the post is in the Accepted or Submitted status.
 * Renouncing a post refunds the buyer's payment and transfers the seller's stake to the seller's address.
 * The post struct is reset and the post status is updated to Renounced.
 * This contract also provides an internal function for refunding a post, which is called by the renouncePost function.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Events.sol";

abstract contract Atomic is Events {
    struct AtomicData {
        address token;
        uint256 amount;
    }
}
