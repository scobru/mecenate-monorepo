// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IMecenateVerifier.sol";
import "./interfaces/IMecenateUsers.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateVault is Ownable, ReentrancyGuard {
    // Mappa per tenere traccia dei depositi per ogni indirizzo
    mapping(bytes32 => uint256) private deposits;

    address public verifierContract;
    address public usersContract;

    constructor(address _verifierContract, address _usersContract) {
        verifierContract = _verifierContract;
        usersContract = _usersContract;
    }

    // Funzione per effettuare un deposito
    function deposit(bytes32 _commitment) public payable nonReentrant {
        deposits[_commitment] += msg.value;
    }

    function pay(
        address _to,
        uint256 _amount,
        bytes32 _commitment
    ) external nonReentrant returns (bool) {
        require(
            deposits[_commitment] >= _amount,
            "Not enough balance please refill your wallet"
        );

        deposits[_commitment] -= _amount;

        payable(_to).transfer(_amount);
        return true;
    }

    function withdraw(
        address operator,
        uint256 _amount,
        bytes32 _commitment
    ) public {
        require(
            IMecenateUsers(usersContract).checkifUserExist(_commitment),
            "user does not exist"
        );

        if (_amount > 0) {
            require(deposits[_commitment] >= _amount, "Not enough balance");
            deposits[_commitment] -= _amount;

            if (operator != address(0)) {
                payable(msg.sender).transfer(_amount);
            } else {
                payable(operator).transfer(_amount);
            }
        }
    }

    // Funzione per ottenere il saldo depositato per un indirizzo specifico
    function getDeposit(bytes32 _commitment) public view returns (uint256) {
        return deposits[_commitment];
    }
}
