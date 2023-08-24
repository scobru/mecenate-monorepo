pragma solidity 0.8.19;

import "./Data.sol";

abstract contract Events is Data {
    event Created(Structures.Post post);
    event Accepted(Structures.Post post);
    event Valid(Structures.Post post);
    event Invalid(Structures.Post post);
    event Finalized(Structures.Post post);
    event MadePublic(Structures.Post post);
    event Refunded(Structures.Post post);
    event Renounced(Structures.Post post);
}
