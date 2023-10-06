import "../MecenateForwarder.sol";

// import Ownable
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateForwarderFactory is Ownable {
    mapping(bytes32 => address) public forwardersMapping;

    address public mecenateVault;

    constructor(address _mecenateVault) {
        mecenateVault = _mecenateVault;
    }

    function getVault() public view returns (address) {
        return mecenateVault;
    }

    function changeVault(address _mecenateVault) public onlyOwner {
        require(
            msg.sender == _mecenateVault,
            "Only the factory can change the factory"
        );
        mecenateVault = _mecenateVault;
    }

    event ForwarderCreated(
        address indexed forwarder,
        bytes32 encryptedVaultId,
        address vaultContract
    );

    function createforwarder(
        bytes32 _encryptedVaultId
    ) public returns (address) {
        require(
            forwardersMapping[_encryptedVaultId] == address(0),
            "forwarder already created"
        );
        MecenateForwarder forwarder = new MecenateForwarder(
            _encryptedVaultId,
            address(this)
        );

        forwardersMapping[_encryptedVaultId] = address(forwarder);

        return address(forwarder);
    }

    function getforwarders(bytes32 _user) public view returns (address) {
        return forwardersMapping[_user];
    }
}
