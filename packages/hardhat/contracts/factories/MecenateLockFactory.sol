// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../features/MecenateLock.sol";
import "../modules/Factory.sol";

contract MecenateLockFactory is Factory {
    constructor(
        address _identityContract,
        address _treasuryContract
    ) Factory(_identityContract, _treasuryContract) {}

    function _createContract(
        address creator
    ) internal virtual override returns (address) {
        MecenateLock lock = new MecenateLock();

        return address(lock);
    }

    function createLock(
        IERC20 token_,
        address beneficiary_,
        address creator_,
        uint256 createdTime_,
        uint256 releaseTime_
    ) public payable returns (address) {
        address newContract = createContract();
        MecenateLock lock = MecenateLock(newContract);
        lock.init(token_, beneficiary_, creator_, createdTime_, releaseTime_);
        return newContract;
    }
}
