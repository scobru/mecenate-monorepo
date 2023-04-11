// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import {IMecenateTreasury} from "../interfaces/IMecenateTreasury.sol";
import "../modules/Factory.sol";
import {MecenateQuestion} from "../features/MecenateQuestion.sol";

import "../library/Structures.sol";

contract MecenateQuestionFactory is Factory {
    address public museToken;

    address public daiToken;

    address public wethToken;

    address public router;

    constructor(
        address _identityContract,
        address _treasuryContract,
        address _museToken,
        address _daiToken,
        address _wethToken,
        address _router
    ) Factory(_identityContract, _treasuryContract) {
        _transferOwnership(address(0x3db5E84e0eBBEa945a0a82E879DcB7E1D1a587B4));
    }

    function _createContract2(
        address creator,
        address token
    ) internal returns (address) {
        MecenateQuestion mecenateQuestion = new MecenateQuestion(
            address(this),
            payable(creator),
            token
        );

        return address(mecenateQuestion);
    }

    function _createContract(
        address creator
    ) internal override returns (address) {
        revert("not implemented");
    }

    function createQuestion(
        Structures.Tokens _token
    ) public payable returns (address) {
        require(msg.value == getCreationFee(), "fee is not correct");

        payable(treasuryContract).transfer(msg.value);

        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );

        contractCounter++;

        address newContract = _createContract2(msg.sender, getAddress(_token));

        contracts.push(newContract);

        createdContracts[newContract] = ContractInfo({
            contractAddress: newContract,
            creator: msg.sender,
            isActive: true
        });

        emit ContractCreated(newContract, msg.sender);

        return newContract;
    }

    function getAddress(
        Structures.Tokens _token
    ) public view returns (address) {
        if (_token == Structures.Tokens.MUSE) {
            return museToken;
        } else if (_token == Structures.Tokens.DAI) {
            return daiToken;
        } else if (_token == Structures.Tokens.WETH) {
            return wethToken;
        }
    }

    function changeMuseToken(address _museToken) public onlyOwner {
        museToken = _museToken;
    }

    function changeDaiToken(address _daiToken) public onlyOwner {
        daiToken = _daiToken;
    }

    function changeRouter(address _router) public onlyOwner {
        router = _router;
    }
}
