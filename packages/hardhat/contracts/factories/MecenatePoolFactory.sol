// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../features/MecenatePool.sol";
import "../modules/Factory.sol";

contract MecenatePoolFactory is Factory {
    constructor(
        address _identityContract,
        address _treasuryContract
    ) Factory(_identityContract, _treasuryContract) {}

    function _createContract(
        address creator
    ) internal virtual override returns (address) {
        MecenatePool pool = new MecenatePool(
            address(0),
            address(0),
            address(0),
            address(0)
        );
        emit ContractCreated(address(pool), creator);
        return address(pool);
    }

    function createPool(
        address _tokenA,
        address _oracleA,
        address _tokenB,
        address _oracleB
    ) public payable returns (address) {
        address newContract = createContract();
        MecenatePool pool = MecenatePool(newContract);
        pool.initialize(_tokenA, _oracleA, _tokenB, _oracleB);
        return newContract;
    }
}
