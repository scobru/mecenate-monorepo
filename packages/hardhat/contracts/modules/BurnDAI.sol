pragma solidity 0.8.19;

import "./BurnMUSE.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../interfaces/IWETH.sol";

abstract contract BurnDAI is BurnMUSE {
    using SafeMath for uint256;

    function _burnFrom(
        address from,
        uint256 value
    ) internal override returns (bool success) {
        IERC20(IMecenateFeedFactory(settings.factoryContract).daiToken())
            .transferFrom(from, address(this), value);

        _burn(value);

        return true;
    }

    function _burnDai(uint256 value) internal returns (bool success) {
        // approve uniswap for token transfer
        IERC20(IMecenateFeedFactory(settings.factoryContract).daiToken())
            .approve(settings.router, value);

        // swap IMecenateFeedFactory(settings.factoryContract).daiToken() for MUSE
        uint256 tokens_sold = value;

        uint256 tokens_bought = _swapTokensForToken(
            IMecenateFeedFactory(settings.factoryContract).daiToken(),
            IMecenateFeedFactory(settings.factoryContract).wethToken(),
            IMecenateFeedFactory(settings.factoryContract).getRouterFee(0),
            tokens_sold
        );

        uint256 tokens_sold_to_muse = _swapTokensForToken(
            IMecenateFeedFactory(settings.factoryContract).wethToken(),
            IMecenateFeedFactory(settings.factoryContract).museToken(),
            IMecenateFeedFactory(settings.factoryContract).getRouterFee(1),
            tokens_bought
        );

        IERC20(IMecenateFeedFactory(settings.factoryContract).museToken())
            .approve(
                IMecenateFeedFactory(settings.factoryContract).museToken(),
                tokens_sold_to_muse
            );

        // burn MUSE
        BurnMUSE._burn(tokens_sold_to_muse);

        return true;
    }

    function _burnWeth(uint256 value) internal returns (bool success) {
        // deposit IMecenateFeedFactory(settings.factoryContract).wethToken()
        IWETH(IMecenateFeedFactory(settings.factoryContract).wethToken())
            .deposit{value: value}();

        // approve uniswap for token transfer
        IERC20(IMecenateFeedFactory(settings.factoryContract).wethToken())
            .approve(settings.router, value);

        // swap IMecenateFeedFactory(settings.factoryContract).wethToken() for MUSE
        uint256 tokens_sold = value;

        uint256 tokens_bought = _swapTokensForToken(
            IMecenateFeedFactory(settings.factoryContract).wethToken(),
            IMecenateFeedFactory(settings.factoryContract).museToken(),
            IMecenateFeedFactory(settings.factoryContract).getRouterFee(1),
            tokens_sold
        );

        IERC20(IMecenateFeedFactory(settings.factoryContract).museToken())
            .approve(
                IMecenateFeedFactory(settings.factoryContract).museToken(),
                tokens_bought
            );

        // burn MUSE
        BurnMUSE._burn(tokens_bought);

        return true;
    }

    function getTokenAddress()
        internal
        view
        virtual
        override
        returns (address token)
    {
        return IMecenateFeedFactory(settings.factoryContract).daiToken();
    }

    function getExchangeAddress()
        internal
        view
        override
        returns (address exchange)
    {
        exchange = settings.router;
    }

    function _swapTokensForToken(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        // Check and approve allowance
        uint256 allowance = IERC20(tokenIn).allowance(
            address(this),
            settings.router
        );
        if (allowance < amountIn) {
            IERC20(tokenIn).approve(settings.router, type(uint256).max);
        }

        // Prepare parameters
        address recipient = address(this);
        uint256 deadline = block.timestamp + 60; // 15 seconds from the current block timestamp

        // Perform the swap
        // Refer to the Uniswap V3 documentation for details on the params.
        amountOut = ISwapRouter(settings.router).exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: recipient,
                deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum: 0, // you may want to set a minimum here
                sqrtPriceLimitX96: 0
            })
        );

        return amountOut;
    }
}
