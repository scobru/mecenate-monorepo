pragma solidity 0.8.19;

// import IERC20
import "../interfaces/IMUSE.sol";
import "../interfaces/IMecenateFactory.sol";
import "./Data.sol";

abstract contract BurnMUSE is Data {
    address public _MUSEToken = IMecenateFactory(factoryContract).museToken();

    address public _MUSEExchange = IMecenateFactory(factoryContract).router();

    function _burn(uint256 value) internal virtual {
        require(IMUSE(_MUSEToken).burn(value), "nmr burn failed");
    }

    function _burnFrom(address from, uint256 value) internal virtual {
        IMUSE(_MUSEToken).transferFrom(from, address(this), value);
        _burn(value);
    }

    function getTokenAddress() internal view virtual returns (address token) {
        token = _MUSEToken;
    }

    function getExchangeAddress()
        internal
        view
        virtual
        returns (address exchange)
    {
        exchange = _MUSEExchange;
    }
}
