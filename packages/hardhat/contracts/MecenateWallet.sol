// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IMecenateVerifier.sol";
import "./interfaces/IMecenateUsers.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MecenateWallet is ReentrancyGuard {
    struct Deposit {
        uint256 amount;
        address user;
    }

    // Mappa per tenere traccia dei depositi per ogni indirizzo
    mapping(bytes32 => Deposit) private deposits;

    address public verifierContract;
    address public usersContract;

    constructor(address _verifierContract, address _usersContract) {
        verifierContract = _verifierContract;
        usersContract = _usersContract;
    }

    // Funzione per effettuare un deposito
    function deposit(
        bytes calldata sismoConnectResponse
    ) public payable nonReentrant {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        // Aggiorna la mappa dei depositi
        deposits[keccak256(vaultIdBytes)].amount += msg.value;

        deposits[keccak256(vaultIdBytes)].user = userAddressConverted;
    }

    function pay(
        address _to,
        uint256 _amount,
        bytes32 _commitment
    ) external nonReentrant returns (bool) {
        require(
            deposits[_commitment].amount >= _amount,
            "Not enough balance please refill your wallet"
        );
        deposits[_commitment].amount -= _amount;
        payable(_to).transfer(_amount);
        return true;
    }

    function withdraw(
        bytes calldata sismoConnectResponse,
        uint256 _amount,
        address operator
    ) public {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        require(
            deposits[keccak256(vaultIdBytes)].user == userAddressConverted,
            "You are not the owner of this deposit"
        );

        if (_amount > 0) {
            require(
                deposits[keccak256(vaultIdBytes)].amount >= _amount,
                "Not enough balance"
            );
            deposits[keccak256(vaultIdBytes)].amount -= _amount;
            payable(userAddressConverted).transfer(_amount);
        } else {
            require(
                deposits[keccak256(vaultIdBytes)].amount > 0,
                "Not enough balance"
            );
            uint256 amount = deposits[keccak256(vaultIdBytes)].amount;
            deposits[keccak256(vaultIdBytes)].amount = 0;

            if (operator != address(0)) {
                payable(operator).transfer(amount);
                return;
            } else {
                payable(userAddressConverted).transfer(amount);
            }
        }
    }

    // Funzione per ottenere il saldo depositato per un indirizzo specifico
    function getDeposit(
        bytes calldata sismoConnectResponse
    ) public view returns (uint256) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            deposits[keccak256(vaultIdBytes)].user == userAddressConverted,
            "You; are not the owner of this deposit"
        );

        return deposits[keccak256(vaultIdBytes)].amount;
    }

    function sismoVerify(
        bytes memory sismoConnectResponse
    ) internal view returns (uint256, bytes memory, uint256, address) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse
            );
        return (vaultId, vaultIdBytes, userAddress, userAddressConverted);
    }
}
