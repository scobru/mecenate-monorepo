import "../MecenateETHDepositor.sol";

contract MecenateETHDepositorFactory {
    mapping(bytes32 => address) public depositorsMapping;

    event DepositorCreated(
        address indexed depositor,
        bytes32 encryptedVaultId,
        address vaultContract
    );

    function createDepositor(
        bytes32 _encryptedVaultId,
        address _vaultContract
    ) public returns (address) {
        MecenateETHDepositor depositor = new MecenateETHDepositor(
            _encryptedVaultId,
            _vaultContract
        );
        depositorsMapping[_encryptedVaultId] = address(depositor);
        emit DepositorCreated(
            address(depositor),
            _encryptedVaultId,
            _vaultContract
        );
        return address(depositor);
    }

    function getDepositors(bytes32 _user) public view returns (address) {
        return depositorsMapping[_user];
    }
}
