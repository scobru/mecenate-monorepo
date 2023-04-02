pragma solidity 0.8.19;
import "../library/Structures.sol";

interface IMecenateBox {
    function depositCount() external view returns (uint256);
}
