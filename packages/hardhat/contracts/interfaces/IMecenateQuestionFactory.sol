pragma solidity 0.8.19;
import "./IMecenateFactory.sol";

interface IMecenateQuestionFactory is IMecenateFactory {
    function museToken() external view returns (address);

    function wethToken() external view returns (address);

    function daiToken() external view returns (address);

    function router() external view returns (address);
}
