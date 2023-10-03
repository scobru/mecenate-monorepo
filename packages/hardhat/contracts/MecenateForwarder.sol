// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMecenateVault {
    function depositToken(
        address token,
        uint256 amount,
        bytes32 encryptedVaultId
    ) external;

    function depositETH(bytes32 encryptedVaultId) external payable;
}

interface IMecenateETHForwarderFactory {
    function getVault() external view returns (address);
}

contract MecenateForwarder {
    bytes32 private encryptedVaultId;
    address public factory;

    constructor(bytes32 _encryptedVaultId) {
        encryptedVaultId = _encryptedVaultId;
        factory = msg.sender;
    }

    function depositToken(address token, uint256 amount) external {
        address vault = IMecenateETHForwarderFactory(factory).getVault();

        // Approva il token
        require(IERC20(token).approve(vault, amount), "Approve failed");

        IMecenateVault(vault).depositToken(token, amount, encryptedVaultId);
    }

    receive() external payable {
        address vault = IMecenateETHForwarderFactory(factory).getVault();

        // Esegui il deposito in ETH
        (bool success, ) = payable(vault).call{value: msg.value}(
            abi.encodeWithSignature("depositETH(bytes32)", encryptedVaultId)
        );
        require(success, "Deposit failed");
    }
}
