// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import {MecenateDCA} from "../features/MecenateDCA.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";

contract MecenateDCAFactory is Ownable {
  uint256 numDCAS;
  address[] public dcas;
  mapping(address => bool) public createdContracts;
  address public identityContract;

  event NewDCA(
    address indexed addr,
    address tokenFrom,
    address tokenTo,
    address priceFeedAddress,
    address uniswapRouterAddress,
    address upkeepAddress
  );

  constructor(address _identityContract) {
    identityContract = _identityContract;
    _transferOwnership(msg.sender);
  }

  function buildDCA(
    address _tokenFrom,
    address _tokenTo,
    address _priceFeedAddress,
    address _uniswapRouterAddress,
    address _upkeepAddress
  ) public returns (address) {
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");

    MecenateDCA dca = new MecenateDCA(_tokenFrom, _tokenTo, _priceFeedAddress, _uniswapRouterAddress);

    dcas.push(address(dca));
    numDCAS++;
    createdContracts[address(dca)] = true;

    emit NewDCA(address(dca), _tokenFrom, _tokenTo, _priceFeedAddress, _uniswapRouterAddress, _upkeepAddress);
  }

  function getDcas() public view returns (address[] memory) {
    return dcas;
  }

  function getDcasOwned(address owner) public view returns (address[] memory) {
    address[] memory ownedDcas = new address[](dcas.length);
    for (uint256 i = 0; i < ownedDcas.length; i++) {
      if (payable(MecenateDCA(payable(dcas[i])).owner()) == owner) {
        ownedDcas[i] = dcas[i];
      }
    }

    return ownedDcas;
  }

  function isContractCreated(address contractAddress) public view returns (bool) {
    return createdContracts[contractAddress];
  }

  receive() external payable {}
}
