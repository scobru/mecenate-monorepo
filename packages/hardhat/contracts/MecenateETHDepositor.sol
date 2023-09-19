// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MecenateETHDepositor {
    bytes32 private encryptedVaultId;
    address public vaultContract;

    constructor(bytes32 _encryptedVaultId, address _vaultContract) {
        encryptedVaultId = _encryptedVaultId;
        vaultContract = _vaultContract;
    }

    receive() external payable {
        (bool success, ) = vaultContract.call{value: msg.value}(
            abi.encodeWithSignature("depositETH(bytes32)", encryptedVaultId)
        );
        require(success, "Deposit failed");
    }
}
