pragma solidity 0.8.19;

interface IFactory {
  function subscribeFeePercent() external view returns (uint256);

  function creationFee() external view returns (uint256);

  function owner() external view returns (address payable);
}
