pragma solidity 0.8.19;

import "../modules/Operated.sol";

contract OperatorAccess is Operated {
  // // backdoor function to deactivate Operator for testing
  // function deactivateOperator() public {
  //     Operated._renounceOperator();
  // }
  // // backdoor function to activate Operator for testing
  // function activateOperator() public {
  //     Operated._activateOperator();
  // }
}
