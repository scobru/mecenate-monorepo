pragma solidity 0.8.19;
import "../library/Structures.sol";

interface IMecenateBay {
    function allRequests()
        external
        view
        returns (Structures.BayRequest[] memory);

    function contractCounter() external view returns (uint256);
}
