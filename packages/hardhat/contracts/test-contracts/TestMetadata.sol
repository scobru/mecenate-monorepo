pragma solidity 0.8.19;

import "../modules/Metadata.sol";

contract TestMetadata is Metadata {
  function setStaticMetadata(bytes memory staticMetadata) public {
    Metadata._setStaticMetadata(staticMetadata);
  }

  function setVariableMetadata(bytes memory variableMetadata) public {
    Metadata._setVariableMetadata(variableMetadata);
  }
}
