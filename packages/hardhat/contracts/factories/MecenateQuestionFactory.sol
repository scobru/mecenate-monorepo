// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import {MecenateQuestion} from "../features/MecenateQuestion.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";

contract MecenateQuestionFactory is Ownable {
  uint256 numQuestion;
  address[] public questions;
  mapping(address => bool) public createdContracts;
  address public identityContract;

  event MecenateQuestionCreated(address indexed mecenateQuestionAddress, address indexed creator);

  address public treasury;

  constructor(address _identityContract, address _treasury) {
    identityContract = _identityContract;
    treasury = _treasury;
  }

  function createQuestion() public returns (address) {
    require(MecenateIdentity(identityContract).balanceOf(msg.sender) > 0, "user does not have identity");
    MecenateQuestion mecenateQuestion = new MecenateQuestion(payable(treasury), payable(msg.sender));
    questions.push(address(mecenateQuestion));
    numQuestion++;
    createdContracts[address(mecenateQuestion)] = true;
    emit MecenateQuestionCreated(address(mecenateQuestion), msg.sender);
    return address(mecenateQuestion);
  }

  function getQuestions() public view returns (address[] memory) {
    return questions;
  }

  function getQuestionOwned(address owner) public view returns (address[] memory) {
    address[] memory ownedQuestion = new address[](questions.length);
    for (uint256 i = 0; i < ownedQuestion.length; i++) {
      if (payable(MecenateQuestion(payable(questions[i])).owner()) == owner) {
        ownedQuestion[i] = questions[i];
      }
    }

    return ownedQuestion;
  }

  function isContractCreated(address contractAddress) public view returns (bool) {
    return createdContracts[contractAddress];
  }

  receive() external payable {}
}
