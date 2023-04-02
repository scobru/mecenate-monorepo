pragma solidity 0.8.19;
import "../interfaces/IMecenateTreasury.sol";
import "../interfaces/IMecenateIdentity.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateBox is Ownable {
    address public treasuryContract;

    address public identityContract;

    constructor(address _identityContract, address _treasuryContract) {
        treasuryContract = _treasuryContract;
        identityContract = _identityContract;
    }

    struct Deposit {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(uint256 => Deposit) public encryptedDeposits;

    uint256 public depositCount;

    function encrypt(
        address _address,
        uint256 _amount
    ) private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        block.timestamp,
                        _address,
                        _amount
                    )
                )
            );
    }

    function deposit(uint256 _lockDuration) public payable returns (uint256) {
        require(msg.value > 0 && _lockDuration > 0, "invalid parameters");
        require(
            IMecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );
        uint256 encryptValue = encrypt(msg.sender, msg.value);
        encryptedDeposits[encryptValue] = Deposit(
            msg.value,
            block.timestamp + _lockDuration
        );
        depositCount++;
        return encryptValue;
    }

    function withdraw(uint256 _encryptedValue) public {
        uint256 amount = encryptedDeposits[_encryptedValue].amount;
        require(
            block.timestamp >= encryptedDeposits[_encryptedValue].unlockTime,
            "Deposit is still locked"
        );
        require(amount > 0, "Deposit does not exist");
        uint256 fee = IMecenateTreasury(treasuryContract).globalFee();
        uint256 feeAmount = (amount * fee) / 10000;

        payable(treasuryContract).transfer(feeAmount);
        payable(msg.sender).transfer(amount - feeAmount);

        delete encryptedDeposits[_encryptedValue];
    }
}
