pragma solidity 0.8.19;
struct ContractInfo {
    address contractAddress;
    address creator;
    bool isActive;
}

interface IMecenateFactory {
    function owner() external view returns (address payable);

    function treasuryContract() external view returns (address payable);

    function identityContract() external view returns (address);

    function contractCounter() external view returns (uint256);

    function contracts(uint256 index) external view returns (address);

    function getContracts() external view returns (address[] memory);

    function getContractsOwnedBy(
        address owner
    ) external view returns (address[] memory);

    function createdContracts(
        address _address
    ) external view returns (ContractInfo memory);

    function getCreationFee() external view returns (uint256);
}
