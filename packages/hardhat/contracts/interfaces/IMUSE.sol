pragma solidity 0.8.19;

// import IERC20 from openzeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract IMUSE is IERC20 {
    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external virtual returns (bool);

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) external virtual returns (bool);

    function mint(uint256 amount) external virtual returns (bool);

    function burn(uint256 amount) external virtual returns (bool);
}
