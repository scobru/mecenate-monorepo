pragma solidity 0.8.19;

import "./BurnMUSE.sol";
import "../interfaces/IPancakeRouter.sol";
import "../interfaces/IMUSE.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract BurnDAI is BurnMUSE {
    using SafeMath for uint256;
    // address of the token
    address private constant _DAIToken =
        address(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    // uniswap exchange of the token
    address private constant _DAIExchange =
        address(0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667);

    function _burnFrom(address from, uint256 value) internal override {
        IERC20(_DAIToken).transferFrom(from, address(this), value);

        _burn(value);
    }

    function _burn(uint256 value) internal override {
        // approve uniswap for token transfer
        IERC20(_DAIToken).approve(_DAIExchange, value);

        // swap dai for MUSE
        uint256 tokens_sold = value;
        uint256 tokens_bought = _swapTokensforToken(
            _DAIToken,
            BurnMUSE.getTokenAddress(),
            tokens_sold
        );

        // burn MUSE
        BurnMUSE._burn(tokens_bought);
    }

    function getTokenAddress()
        internal
        pure
        virtual
        override
        returns (address token)
    {
        token = _DAIToken;
    }

    function getExchangeAddress()
        internal
        pure
        override
        returns (address exchange)
    {
        exchange = _DAIExchange;
    }

    function _swapTokensforToken(
        address token1,
        address token2,
        uint256 amount
    ) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;

        uint256[] memory amounts = IPancakeRouter(_DAIExchange).getAmountsOut(
            amount,
            path
        );

        uint256 amountOut = amounts[amounts.length.sub(1)];

        // check allowance
        uint256 allowance = IERC20(token1).allowance(
            address(this),
            _DAIExchange
        );
        if (allowance < amount) {
            IERC20(token1).approve(_DAIExchange, uint256(2 ** 256 - 1));
        }

        IPancakeRouter(_DAIExchange)
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountOut.sub(amountOut.mul(10).div(10000)),
                0,
                path,
                address(this),
                block.timestamp
            );

        return amounts[amounts.length.sub(1)];
    }
}
