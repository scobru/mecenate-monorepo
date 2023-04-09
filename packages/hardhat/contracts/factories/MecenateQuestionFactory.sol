// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import {IMecenateTreasury} from "../interfaces/IMecenateTreasury.sol";
import {Factory} from "../modules/Factory.sol";
import {MecenateQuestion} from "../features/MecenateQuestion.sol";

contract MecenateQuestionFactory is Factory {
    constructor(
        address _identityContract,
        address _treasuryContract
    ) Factory(_identityContract, _treasuryContract) {}

    function _createContract(
        address creator
    ) internal override returns (address) {
        MecenateQuestion mecenateQuestion = new MecenateQuestion(
            address(this),
            payable(creator)
        );

        return address(mecenateQuestion);
    }
}
