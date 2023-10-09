// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SismoPKP {
    address public owner;

    struct WalletInfo {
        address walletAddress;
        string publicKey;
        string encryptedPrivateKey;
    }

    mapping(bytes32 => WalletInfo) public vaults;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function setWalletInfo(
        bytes32 encryptedVaultId,
        address walletAddress,
        string memory publicKey,
        string memory encryptedPrivateKey
    ) public {
        WalletInfo memory newWallet = WalletInfo(
            walletAddress,
            publicKey,
            encryptedPrivateKey
        );
        vaults[encryptedVaultId] = newWallet;
    }

    function getWalletInfo(
        bytes32 encryptedVaultId
    ) public view returns (address, string memory, string memory) {
        WalletInfo memory wallet = vaults[encryptedVaultId];
        return (
            wallet.walletAddress,
            wallet.publicKey,
            wallet.encryptedPrivateKey
        );
    }

    // Function to export all data (assumes you have a way to get all encryptedVaultIds)
    function exportAllData()
        public
        view
        onlyOwner
        returns (
            bytes32[] memory,
            address[] memory,
            string[] memory,
            string[] memory
        )
    {
        // Here you'll need a way to get all encryptedVaultIds.
        // This is just a placeholder.
        bytes32[] memory allVaultIds = getAllVaultIds();

        address[] memory allAddresses = new address[](allVaultIds.length);
        string[] memory allPublicKeys = new string[](allVaultIds.length);
        string[] memory allEncryptedPrivateKeys = new string[](
            allVaultIds.length
        );

        for (uint i = 0; i < allVaultIds.length; i++) {
            WalletInfo memory wallet = vaults[allVaultIds[i]];
            allAddresses[i] = wallet.walletAddress;
            allPublicKeys[i] = wallet.publicKey;
            allEncryptedPrivateKeys[i] = wallet.encryptedPrivateKey;
        }

        return (
            allVaultIds,
            allAddresses,
            allPublicKeys,
            allEncryptedPrivateKeys
        );
    }

    function importAllData(
        bytes32[] memory importedVaultIds,
        address[] memory importedAddresses,
        string[] memory importedPublicKeys,
        string[] memory importedEncryptedPrivateKeys
    ) public onlyOwner {
        require(
            importedVaultIds.length == importedAddresses.length &&
                importedVaultIds.length == importedPublicKeys.length &&
                importedVaultIds.length == importedEncryptedPrivateKeys.length,
            "All arrays must have the same length"
        );

        for (uint i = 0; i < importedVaultIds.length; i++) {
            WalletInfo memory newWallet = WalletInfo(
                importedAddresses[i],
                importedPublicKeys[i],
                importedEncryptedPrivateKeys[i]
            );
            vaults[importedVaultIds[i]] = newWallet;
        }
    }

    // Placeholder function
    function getAllVaultIds() internal pure returns (bytes32[] memory) {
        // Implementation here
        return new bytes32[](0);
    }
}
