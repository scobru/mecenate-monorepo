pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateBox is Ownable {
  struct Deposit {
    bytes32 receiver;
    uint256 amount;
    uint256 timestamp;
    bool withdrawn;
  }

  uint256 constant FRAGMENT_COUNT = 3;

  uint256 public minDepositAmount = 0.1 ether;
  uint256 public maxCap = 1 ether; // Maximum capacity of a pool
  uint256 public mixDelay = 5 minutes;
  uint256 public lastRedistributionTime;
  uint256 public redistributionInterval = 10 minutes;

  Pool[] private depositPools;

  function _addDepositPool() internal {
    Pool newPool = new Pool();
    depositPools.push(newPool);
  }

  function encryptAddress(address _data) private view returns (bytes32) {
    return keccak256(abi.encodePacked(_data));
  }

  function encrypt() private view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, msg.value, "5")));
  }

  function deposit(bytes32 _receiver) public payable returns (uint256) {
    require(msg.value >= minDepositAmount, "Deposit amount too low");
    uint256 encryptValue = encrypt();

    if (depositPools.length == 0 || depositPools[depositPools.length - 1].getBalance() + msg.value > maxCap) {
      _addDepositPool();
    }

    Pool lastPool = depositPools[depositPools.length - 1];
    lastPool.deposit{value: msg.value}(_receiver, encryptValue);

    return encryptValue;
  }

  function withdraw(
    bytes32 _sender,
    uint256 _amount,
    uint256 encryptValue
  ) public {
    bytes32 encryptedReceiver = encryptAddress(msg.sender);
    uint256 totalAmount = 0;

    for (uint256 poolIndex = 0; poolIndex < depositPools.length; poolIndex++) {
      totalAmount += depositPools[poolIndex].getAvailableAmount(encryptedReceiver, encryptValue);
    }

    require(totalAmount >= _amount, "Insufficient balance or not enough mixing time has passed");

    for (uint256 poolIndex = 0; poolIndex < depositPools.length && _amount > 0; poolIndex++) {
      uint256 amountToSend = depositPools[poolIndex].sendFunds(payable(msg.sender), _amount, encryptValue);
      _amount -= amountToSend;
    }
  }

  function redistributeFunds() public {
    require(
      block.timestamp >= lastRedistributionTime + redistributionInterval,
      "Redistribution interval has not passed"
    );

    uint256 totalFunds = 0;

    for (uint256 i = 0; i < depositPools.length; i++) {
      totalFunds += depositPools[i].getBalance();
    }

    uint256 fundsPerPool = totalFunds / depositPools.length;

    for (uint256 i = 0; i < depositPools.length; i++) {
      uint256 currentPoolFunds = depositPools[i].getBalance();

      while (currentPoolFunds > fundsPerPool) {
        uint256 newIndex = uint256(
          keccak256(abi.encodePacked(block.difficulty, block.timestamp, depositPools[i].getDepositCount()))
        ) % depositPools.length;
        depositPools[newIndex].deposit{value: fundsPerPool}(0x0, 0); // Aggiungi un deposito vuoto nel nuovo pool
        depositPools[i].sendFunds(payable(address(depositPools[newIndex])), fundsPerPool, 0); // Trasferisci i fondi
        currentPoolFunds -= fundsPerPool;
      }
    }

    lastRedistributionTime = block.timestamp;
  }

  function getBalance() public view onlyOwner returns (uint256) {
    return address(this).balance;
  }

  function addDepositPool() public onlyOwner {
    depositPools.push();
  }

  function _getRandomPoolIndex() private view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % depositPools.length;
  }

  function randomizeDeposits(uint256 iterations) public {
    for (uint256 i = 0; i < iterations; i++) {
      uint256 sourcePoolIndex = _getRandomPoolIndex();
      uint256 destinationPoolIndex = _getRandomPoolIndex();

      if (sourcePoolIndex != destinationPoolIndex && depositPools[sourcePoolIndex].getDepositCount() > 0) {
        uint256 depositIndex = uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) %
          depositPools[sourcePoolIndex].getDepositCount();
        Pool.Deposit memory depositToMove = depositPools[sourcePoolIndex].getDeposit(depositIndex);

        depositPools[sourcePoolIndex].removeDeposit(depositIndex);

        depositPools[destinationPoolIndex].addDeposit(
          depositToMove.receiver,
          depositToMove.amount,
          depositToMove.timestamp
        );
      }
    }
  }
}

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Pool is Ownable {
  struct Deposit {
    bytes32 receiver;
    uint256 amount;
    uint256 timestamp;
    bool withdrawn;
  }

  Deposit[] private deposits;

  function encryptAddress(address _data) private view returns (bytes32) {
    return keccak256(abi.encodePacked(_data));
  }

  function deposit(bytes32 _receiver, uint256 encryptValue) public payable onlyOwner {
    deposits.push(Deposit(_receiver, msg.value, block.timestamp, false));
  }

  function addDeposit(
    bytes32 _receiver,
    uint256 _amount,
    uint256 _timestamp
  ) public onlyOwner {
    deposits.push(Deposit(_receiver, _amount, _timestamp, false));
  }

  function removeDeposit(uint256 index) public onlyOwner {
    require(index < deposits.length, "Invalid deposit index");
    deposits[index] = deposits[deposits.length - 1];
    deposits.pop();
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function getAvailableAmount(bytes32 _sender, uint256 encryptValue) public view returns (uint256) {
    uint256 totalAmount = 0;

    for (uint256 i = 0; i < deposits.length; i++) {
      if (deposits[i].receiver == _sender && block.timestamp >= deposits[i].timestamp + 5 minutes) {
        totalAmount += deposits[i].amount;
      }
    }

    return totalAmount;
  }

  function getDeposit(uint256 index) public view returns (Deposit memory) {
    require(index < deposits.length, "Index out of bounds");
    return deposits[index];
  }

  function getDepositCount() public view returns (uint256) {
    return deposits.length;
  }

  function sendFunds(
    address payable _receiver,
    uint256 _amount,
    uint256 encryptValue
  ) public payable onlyOwner returns (uint256) {
    {
      uint256 sentAmount = 0;

      // Aggiungi un array per memorizzare gli indici degli elementi da rimuovere
      uint256[] memory indicesToRemove = new uint256[](deposits.length);
      uint256 removeCount = 0;

      for (uint256 i = 0; i < deposits.length && sentAmount < _amount; i++) {
        if (deposits[i].receiver == encryptAddress(_receiver) && block.timestamp >= deposits[i].timestamp + 5 minutes) {
          uint256 transferAmount = (_amount - sentAmount) < deposits[i].amount
            ? (_amount - sentAmount)
            : deposits[i].amount;
          sentAmount += transferAmount;
          deposits[i].amount -= transferAmount;

          // Se l'importo del deposito è 0, aggiungi l'indice all'array degli indici da rimuovere
          if (deposits[i].amount == 0) {
            indicesToRemove[removeCount] = i;
            removeCount++;
          }
        }
      }

      // Rimuovi gli elementi dall'array dei depositi
      for (uint256 i = 0; i < removeCount; i++) {
        uint256 indexToRemove = indicesToRemove[i];
        deposits[indexToRemove] = deposits[deposits.length - 1];
        deposits.pop();
      }

      // Esegui il trasferimento alla fine, dopo aver aggiornato lo stato del contratto
      (bool success, ) = _receiver.call{value: sentAmount}("");
      require(success, "Transfer failed");

      return sentAmount;
    }
  }
}
