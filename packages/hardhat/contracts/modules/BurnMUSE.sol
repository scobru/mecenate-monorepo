pragma solidity 0.8.19;
import "../interfaces/IMUSE.sol";
import "../interfaces/IMecenateFeedFactory.sol";
import "./Events.sol";

abstract contract BurnMUSE is Events {
    function _burn(uint256 value) internal virtual {
        require(
            IMUSE(IMecenateFeedFactory(settings.factoryContract).museToken())
                .burn(value),
            "muse burn failed"
        );
    }

    function _burnFrom(address from, uint256 value) internal virtual {
        IMUSE(IMecenateFeedFactory(settings.factoryContract).museToken())
            .transferFrom(from, address(this), value);
        _burn(value);
    }

    function getTokenAddress() internal view virtual returns (address token) {
        return IMecenateFeedFactory(settings.factoryContract).museToken();
    }

    function getExchangeAddress()
        internal
        view
        virtual
        returns (address exchange)
    {
        exchange = IMecenateFeedFactory(settings.factoryContract).router();
    }
}
