pragma solidity 0.8.19;

import "./BurnMUSE.sol";
import "../interfaces/IPancakeRouter.sol";
import "../interfaces/IMUSE.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract BurnDAI is BurnMUSE {
    using SafeMath for uint256;

    function _burnFrom(address from, uint256 value) internal override {
        IERC20(getDaiToken()).transferFrom(from, address(this), value);

        _burn(value);
    }

    function _burn(uint256 value) internal override {
        // approve uniswap for token transfer
        IERC20(getDaiToken()).approve(router, value);

        // swap dai for MUSE
        uint256 tokens_sold = value;
        uint256 tokens_bought = _swapTokensforToken(
            getDaiToken(),
            BurnMUSE.getTokenAddress(),
            tokens_sold
        );

        // burn MUSE
        BurnMUSE._burn(tokens_bought);
    }

    function getTokenAddress()
        internal
        view
        virtual
        override
        returns (address token)
    {
        token = IMecenateFactory(factoryContract).daiToken();
    }

    function getExchangeAddress()
        internal
        view
        override
        returns (address exchange)
    {
        exchange = router;
    }

    function _swapTokensforToken(
        address token1,
        address token2,
        uint256 amount
    ) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;

        uint256[] memory amounts = IPancakeRouter(router).getAmountsOut(
            amount,
            path
        );

        uint256 amountOut = amounts[amounts.length.sub(1)];

        // check allowance
        uint256 allowance = IERC20(token1).allowance(address(this), router);
        if (allowance < amount) {
            IERC20(token1).approve(router, uint256(2 ** 256 - 1));
        }

        IPancakeRouter(router)
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
