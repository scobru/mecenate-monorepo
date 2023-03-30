pragma solidity 0.8.19;

interface IMecenate {
  function isValidSubscription(address _subscriber) external view returns (bool);

  function subscribe() external payable;
}
