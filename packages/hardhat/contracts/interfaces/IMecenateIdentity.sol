pragma solidity 0.8.19;

interface IMecenateIdentity {
    function identityByAddress(address user) external view returns (uint256);

    function balanceOf(address user) external view returns (uint256);

    function getTotalIdentities() external view returns (uint256);
}
