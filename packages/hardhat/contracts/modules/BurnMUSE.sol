pragma solidity 0.8.19;

// import IERC20
import "../interfaces/IMUSE.sol";

contract BurnMUSE {
    address private constant _MUSEToken =
        address(0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671);
    address private constant _MUSEExchange =
        address(0x2Bf5A5bA29E60682fC56B2Fcf9cE07Bef4F6196f);

    function _burn(uint256 value) internal virtual {
        require(IMUSE(_MUSEToken).burn(value), "nmr burn failed");
    }

    function _burnFrom(address from, uint256 value) internal virtual {
        IMUSE(_MUSEToken).transferFrom(from, address(this), value);
        _burn(value);
    }

    function getTokenAddress() internal pure virtual returns (address token) {
        token = _MUSEToken;
    }

    function getExchangeAddress()
        internal
        pure
        virtual
        returns (address exchange)
    {
        exchange = _MUSEExchange;
    }
}
