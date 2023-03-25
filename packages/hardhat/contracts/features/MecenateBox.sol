contract MecenateBox {
  struct Deposit {
    uint256 amount;
    uint256 unlockTime;
  }

  mapping(uint256 => Deposit) public encryptedDeposits;

  function encrypt() private view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, msg.value, "5")));
  }

  function deposit(uint256 _lockDuration) public payable returns (uint256) {
    require(msg.value > 0.01 ether);
    uint256 encryptValue = encrypt();
    encryptedDeposits[encryptValue] = Deposit(msg.value, block.timestamp + _lockDuration);
    return encryptValue;
  }

  function withdraw(uint256 _encryptedValue) public {
    uint256 amount = encryptedDeposits[_encryptedValue].amount;
    require(block.timestamp >= encryptedDeposits[_encryptedValue].unlockTime, "Deposit is still locked");
    payable(msg.sender).transfer(amount);
    delete encryptedDeposits[_encryptedValue];
  }
}
