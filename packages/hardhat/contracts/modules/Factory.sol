// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import {IMecenateTreasury} from "../interfaces/IMecenateTreasury.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Factory is Ownable {
    struct ContractInfo {
        address contractAddress;
        address creator;
        bool isActive;
    }

    uint256 public contractCounter;

    mapping(address => ContractInfo) public createdContracts;

    address public identityContract;

    address public treasuryContract;

    address[] public contracts;

    event ContractCreated(
        address indexed contractAddress,
        address indexed creator
    );

    constructor(address _identityContract, address _treasuryContract) {
        identityContract = _identityContract;
        treasuryContract = _treasuryContract;
    }

    function createContract() public payable returns (address) {
        require(msg.value == getCreationFee(), "fee is not correct");

        payable(treasuryContract).transfer(msg.value);

        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );

        contractCounter++;

        address newContract = _createContract(msg.sender);

        contracts.push(newContract);

        createdContracts[newContract] = ContractInfo({
            contractAddress: newContract,
            creator: msg.sender,
            isActive: true
        });

        emit ContractCreated(newContract, msg.sender);

        return newContract;
    }

    function _createContract(
        address creator
    ) internal virtual returns (address);

    function getContracts() public view returns (address[] memory) {
        return contracts;
    }

    function getContractsOwnedBy(
        address owner
    ) public view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < contracts.length; i++) {
            if (createdContracts[contracts[i]].creator == owner) {
                count++;
            }
        }
        address[] memory ownedContracts = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < contracts.length; i++) {
            if (createdContracts[contracts[i]].creator == owner) {
                ownedContracts[j] = contracts[i];
                j++;
            }
        }
        return ownedContracts;
    }

    function deactivateContract(address contractAddress) public onlyOwner {
        createdContracts[contractAddress].isActive = false;
    }

    function activateContract(address contractAddress) public onlyOwner {
        createdContracts[contractAddress].isActive = true;
    }

    function changeTreasury(address _treasury) public onlyOwner {
        treasuryContract = _treasury;
    }

    function isContractCreated(
        address contractAddress
    ) public view returns (bool) {
        return createdContracts[contractAddress].isActive;
    }

    function getCreationFee() public view returns (uint256) {
        return IMecenateTreasury(treasuryContract).fixedFee();
    }

    receive() external payable {}
}
