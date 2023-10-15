/**
 * @title Swapper
 * @dev This contract provides functions for swapping tokens on PancakeSwap and adding liquidity to a token pair.
 */
// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

abstract contract Swapper is Ownable {
    bool public splitLiquidity;

    ISwapRouter public swapRouter;
    INonfungiblePositionManager public positionManager;
    address public native;

    function _giveAllowances() internal {
        IERC20(address(native)).approve(address(swapRouter), 0);
        IERC20(address(native)).approve(
            address(swapRouter),
            uint256(2 ** 256 - 1)
        );
    }

    function customApprove(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).approve(address(swapRouter), _amount);
        IERC20(address(_token)).approve(
            address(swapRouter),
            uint256(2 ** 256 - 1)
        );
    }

    function configLiquidityProvider(
        address _native,
        ISwapRouter _swapRouter
    ) external onlyOwner {
        native = _native;
        swapRouter = _swapRouter;
        splitLiquidity = true;
        _giveAllowances();
    }

    function setSplitLiqudity(
        bool _splitLiquidity
    ) external onlyOwner returns (bool) {
        splitLiquidity = _splitLiquidity;
        return true;
    }

    function swapTokensForTokens(
        address token1,
        address token2,
        uint256 amount,
        uint24 fee
    ) external onlyOwner returns (uint256) {
        return _swapTokensForTokens(token1, token2, fee, amount);
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint256 amountA,
        uint256 amountB,
        int24 tickLower,
        int24 tickUpper
    ) public onlyOwner {
        _addLiquidity(
            tokenA,
            tokenB,
            fee,
            amountA,
            amountB,
            tickLower,
            tickUpper
        );
    }

    function _swapTokenToETH(
        address token,
        uint256 amountIn,
        uint24 fee
    ) private returns (uint256) {
        // Approve tokens for the swap
        IERC20(token).approve(address(swapRouter), amountIn);

        // Params for the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams(
                token, // tokenIn
                native, // tokenOut
                fee, // fee
                address(this), // recipient
                block.timestamp + 10, // deadline
                amountIn, // amountIn
                0, // amountOutMinimum
                0 // sqrtPriceLimitX96
            );

        // Perform the swap and return the amount received
        uint256 amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint256 amountA,
        uint256 amountB,
        int24 tickLower,
        int24 tickUpper
    ) internal {
        // Approve amounts to positionManager
        IERC20(tokenA).approve(address(positionManager), amountA);
        IERC20(tokenB).approve(address(positionManager), amountB);

        // Parameters for adding liquidity
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager
            .MintParams(
                tokenA,
                tokenB,
                fee,
                tickLower,
                tickUpper,
                amountA,
                amountB,
                0, // amount0Min
                0, // amount1Min
                address(this),
                block.timestamp // Deadline
            );

        // Add liquidity
        (uint256 tokenId, , , ) = positionManager.mint(params);
    }

    function _swapTokensForTokens(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn
    ) internal returns (uint256) {
        // Approve amount to swapRouter
        IERC20(tokenIn).approve(address(swapRouter), amountIn);

        uint256 estimatedAmountOut = amountIn;
        uint256 amountOutMinimum = (estimatedAmountOut * 95) / 100; // accetta fino al 1% di slippage

        // Parameters for the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams(
                tokenIn,
                tokenOut,
                fee,
                address(this),
                block.timestamp + 10, // Deadline
                amountIn, // amountIn
                amountOutMinimum, // amountOutMinimum
                0 // sqrtPriceLimitX96
            );

        // Perform the swap
        uint256 amountOut = swapRouter.exactInputSingle(params);

        return amountOut;
    }
}
