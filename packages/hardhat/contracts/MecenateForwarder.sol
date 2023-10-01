// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMecenateETHForwarderFactory {
    function getVault() external view returns (address);
}

contract MecenateForwarder {
    bytes32 private encryptedVaultId;
    address public factory;

    function depositToken(address token, uint256 amount) external {
        address vault = IMecenateETHForwarderFactory(factory).getVault();

        // approve token
        (bool success, ) = token.delegatecall(
            abi.encodeWithSignature("approve(address,uint256)", vault, amount)
        );

        require(success, "Approve failed");

        (bool success2, ) = vault.delegatecall(
            abi.encodeWithSignature(
                "depositToken(address,uint256,bytes32)",
                token,
                amount,
                encryptedVaultId
            )
        );

        require(success2, "Deposit failed");
    }

    constructor(bytes32 _encryptedVaultId) {
        encryptedVaultId = _encryptedVaultId;
        factory = msg.sender;
    }

    receive() external payable {
        address vault = IMecenateETHForwarderFactory(factory).getVault();
        (bool success, ) = payable(vault).call{value: msg.value}(
            abi.encode(encryptedVaultId)
        );
        require(success, "Deposit failed");
    }
}
