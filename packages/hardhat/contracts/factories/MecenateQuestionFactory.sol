// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import {MecenateQuestion} from "../features/MecenateQuestion.sol";
import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import {IMecenateTreasury} from "../interfaces/IMecenateTreasury.sol";

contract MecenateQuestionFactory is Ownable {
    address[] public questions;

    address public identityContract;

    address public treasuryContract;

    mapping(address => bool) public createdContracts;

    uint256 public contractCounter;

    event MecenateQuestionCreated(
        address indexed mecenateQuestionAddress,
        address indexed creator
    );

    constructor(address _identityContract, address _treasuryContract) {
        identityContract = _identityContract;
        treasuryContract = _treasuryContract;
    }

    function createQuestion() public payable returns (address) {
        require(msg.value == getCreationFee(), "fee is not correct");
        payable(treasuryContract).transfer(msg.value);

        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );

        contractCounter++;

        MecenateQuestion mecenateQuestion = new MecenateQuestion(
            address(this),
            payable(msg.sender)
        );
        questions.push(address(mecenateQuestion));
        createdContracts[address(mecenateQuestion)] = true;
        emit MecenateQuestionCreated(address(mecenateQuestion), msg.sender);
        return address(mecenateQuestion);
    }

    function getQuestions() public view returns (address[] memory) {
        return questions;
    }

    function getQuestionOwned(
        address owner
    ) public view returns (address[] memory) {
        address[] memory ownedQuestion = new address[](questions.length);
        for (uint256 i = 0; i < ownedQuestion.length; i++) {
            if (
                payable(MecenateQuestion(payable(questions[i])).owner()) ==
                owner
            ) {
                ownedQuestion[i] = questions[i];
            }
        }

        return ownedQuestion;
    }

    function isContractCreated(
        address contractAddress
    ) public view returns (bool) {
        return createdContracts[contractAddress];
    }

    function getCreationFee() public view returns (uint256) {
        return IMecenateTreasury(treasuryContract).fixedFee();
    }

    receive() external payable {}
}
