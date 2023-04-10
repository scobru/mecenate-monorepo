pragma solidity 0.8.19;

// import IERC20
import "../interfaces/IMUSE.sol";
import "../interfaces/IMecenateFactory.sol";
import "./Data.sol";

abstract contract BurnMUSE is Data {
    function _burn(uint256 value) internal virtual {
        require(IMUSE(museToken).burn(value), "nmr burn failed");
    }

    function _burnFrom(address from, uint256 value) internal virtual {
        IMUSE(museToken).transferFrom(from, address(this), value);
        _burn(value);
    }

    function getTokenAddress() internal view virtual returns (address token) {
        token = museToken;
    }

    function getExchangeAddress()
        internal
        view
        virtual
        returns (address exchange)
    {
        exchange = router;
    }
}
