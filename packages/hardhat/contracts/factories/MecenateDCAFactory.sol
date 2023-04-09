// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import {MecenateDCA} from "../features/MecenateDCA.sol";
import "../modules/Factory.sol";

contract MecenateDCAFactory is Factory {
    constructor(
        address _identityContract,
        address _treasuryContract
    ) Factory(_identityContract, _treasuryContract) {}

    function _createContract(
        address creator
    ) internal virtual override returns (address) {
        MecenateDCA dca = new MecenateDCA(
            creator,
            address(0),
            address(0),
            address(0),
            address(0)
        );

        return address(dca);
    }

    function buildDCA(
        address _tokenFrom,
        address _tokenTo,
        address _priceFeedAddress,
        address _uniswapRouterAddress,
        address _upkeepAddress
    ) public payable returns (address) {
        address newContract = createContract();
        MecenateDCA dca = MecenateDCA(newContract);
        dca.initialize(
            msg.sender,
            _tokenFrom,
            _tokenTo,
            _priceFeedAddress,
            _uniswapRouterAddress,
            _upkeepAddress
        );
        return newContract;
    }
}
