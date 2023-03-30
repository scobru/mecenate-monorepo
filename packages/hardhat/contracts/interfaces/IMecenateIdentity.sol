pragma solidity 0.8.19;

interface IMecenateIdentity {
  function identityByAddress(address user) external view returns (uint256);
}
