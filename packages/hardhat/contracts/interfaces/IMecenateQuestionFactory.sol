pragma solidity 0.8.19;

interface IMecenateQuestionFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function questions() external view returns (address[] memory);

    function contractCounter() external view returns (uint256);
}
