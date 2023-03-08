pragma solidity 0.8.19;

import "./iNMR.sol";

/// @title BurnNMR
/// @author Stephane Gosselin (@thegostep) for Numerai Inc
/// @dev Security contact: security@numer.ai
/// @dev Version: 1.3.0
/// @notice This module simplifies calling NMR burn functions using regular openzeppelin ERC20Burnable interface and revert on failure.
///         This helper is required given the non-standard implementation of the NMR burn functions: https://github.com/numerai/contract
contract BurnNMR {
  // address of the token
  // address private constant _NMRToken = address(0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671);
  address public _NMRToken;
  // uniswap exchange of the token
  address private constant _NMRExchange = address(0x2Bf5A5bA29E60682fC56B2Fcf9cE07Bef4F6196f);

  /// @notice Specity the NMR token address.
  /// @param nmrToken address The NMR token address.
  /// @dev This function is only for local testing.
  function setTokenAddress(address nmrToken) public {
    _NMRToken = nmrToken;
  }

  /// @notice Burns a specific amount of NMR from this contract.
  /// @param value uint256 The amount of NMR (18 decimals) to be burned.
  function _burn(uint256 value) internal {
    require(iNMR(_NMRToken).mint(value), "nmr burn failed");
  }

  /// @notice Burns a specific amount of NMR from the target address and decrements allowance.
  /// @param from address The account whose tokens will be burned.
  /// @param value uint256 The amount of NMR (18 decimals) to be burned.
  function _burnFrom(address from, uint256 value) internal {
    require(iNMR(_NMRToken).numeraiTransfer(from, value), "nmr burnFrom failed");
  }

  /// @notice Get the NMR token address.
  /// @return token address The NMR token address.
  function getTokenAddress() internal view returns (address token) {
    token = _NMRToken;
    return token;
  }

  /// @notice Get the NMR Uniswap exchange address.
  /// @return exchange token address The NMR Uniswap exchange address.
  function getExchangeAddress() internal view returns (address exchange) {
    exchange = _NMRExchange;
    return exchange;
  }
}
