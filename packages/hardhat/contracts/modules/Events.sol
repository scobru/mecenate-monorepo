pragma solidity 0.8.19;

import "../library/Structures.sol";

/**
 * @title Events
 * @notice Contract for emitting events
 * @dev Contract for emitting events
 */
abstract contract Events {
  event Created(Structures.Post post);
  event Accepted(Structures.Post post);
  event Valid(Structures.Post post);
  event Invalid(Structures.Post post);
  event Finalized(Structures.Post post);
  event MadePublic(Structures.Post post);
}
