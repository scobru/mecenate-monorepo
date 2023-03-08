pragma solidity 0.8.19;

import "../modules/EventMetadata.sol";

contract TestEventMetadata is EventMetadata {
  function setMetadata(bytes memory metadata) public {
    EventMetadata._setMetadata(metadata);
  }
}
