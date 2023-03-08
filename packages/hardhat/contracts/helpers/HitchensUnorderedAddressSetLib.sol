pragma solidity 0.8.19;

library HitchensUnorderedAddressSetLib {
  struct Set {
    mapping(address => uint256) keyPointers;
    address[] keyList;
  }

  function insert(Set storage self, address key) internal {
    require(key != address(0), "UnorderedKeySet(100) - Key cannot be 0x0");
    require(!exists(self, key), "UnorderedAddressSet(101) - Address (key) already exists in the set.");
    self.keyList.push(key);
    self.keyPointers[key] = self.keyList.length - 1;
  }

  function remove(Set storage self, address key) internal {
    require(exists(self, key), "UnorderedKeySet(102) - Address (key) does not exist in the set.");
    uint256 rowToDelete = self.keyPointers[key];
    if (rowToDelete < self.keyList.length - 1) {
      address keyToMove = self.keyList[self.keyList.length - 1];
      self.keyList[rowToDelete] = keyToMove;
      self.keyPointers[keyToMove] = rowToDelete;
    }
    self.keyList.pop();
    delete self.keyPointers[key];
  }

  function count(Set storage self) internal view returns (uint256) {
    return (self.keyList.length);
  }

  function exists(Set storage self, address key) internal view returns (bool) {
    if (self.keyList.length == 0) return false;
    return self.keyList[self.keyPointers[key]] == key;
  }

  function keyAtIndex(Set storage self, uint256 index) internal view returns (address) {
    return self.keyList[index];
  }

  function nukeSet(Set storage self) internal {
    delete self.keyList;
  }
}
