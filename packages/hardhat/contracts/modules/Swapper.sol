/**
 * @title Swapper
 * @dev This contract provides functions for swapping tokens on PancakeSwap and adding liquidity to a token pair.
 */
// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IWETH.sol";
import "../interfaces/IPancakeRouter.sol";
import "../interfaces/IPancakePair.sol";

abstract contract Swapper is Ownable {
    using SafeMath for uint256;

    using SafeERC20 for IERC20;

    bool public splitLiquidity;

    address public native;

    address public unirouter;

    uint256 public slippage;

    function _giveAllowances() internal {
        IERC20(address(native)).approve(unirouter, 0);
        IERC20(address(native)).approve(unirouter, uint256(2 ** 256 - 1));
    }

    function customApprove(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).approve(unirouter, _amount);
        IERC20(address(_token)).approve(unirouter, uint256(2 ** 256 - 1));
    }

    function configLiquidityProvider(
        address _native,
        address _unirouter
    ) external onlyOwner {
        native = _native;
        unirouter = _unirouter;
        splitLiquidity = true;
        slippage = 10;
        _giveAllowances();
    }

    function setSlippage(uint256 _slippage) external onlyOwner returns (bool) {
        slippage = _slippage;
        return true;
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
        uint256 amount
    ) external onlyOwner returns (uint256) {
        return _swapTokensforToken(token1, token2, amount);
    }

    function addLiquidity(address token, uint256 _amount) public onlyOwner {
        _addLiquidity(token, _amount);
    }

    function _swapTokenToETH(
        address token,
        uint256 _amount
    ) private returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = native;

        uint256[] memory amounts = IPancakeRouter(unirouter).getAmountsOut(
            _amount,
            path
        );

        uint256 amountOut = amounts[amounts.length.sub(1)];

        uint256[] memory received = IPancakeRouter(unirouter)
            .swapExactTokensForETH(
                amountOut.sub(amountOut.mul(slippage).div(10000)),
                0,
                path,
                address(this),
                block.timestamp + 10
            );

        return received[received.length.sub(1)];
    }

    function _addLiquidity(address token, uint256 _amount) private {
        uint256 received = _amount;

        if (splitLiquidity == true) {
            uint256 amountHalf = received.div(2);
            uint256 otherHalf = amountHalf;

            address[] memory path = new address[](2);
            path[0] = address(native);
            path[1] = address(token);

            uint256 tokenBalanceB4 = IERC20(token).balanceOf(address(this));

            IPancakeRouter(unirouter)
                .swapExactETHForTokensSupportingFeeOnTransferTokens{
                value: amountHalf
            }(1, path, address(this), block.timestamp + 10);

            uint256 tokenBalance = IERC20(token).balanceOf(address(this));

            IERC20(token).approve(unirouter, tokenBalance.sub(tokenBalanceB4));

            IWETH(native).deposit{value: otherHalf}();

            IERC20(native).approve(unirouter, otherHalf);

            IPancakeRouter(unirouter).addLiquidity(
                token,
                native,
                tokenBalance.sub(tokenBalanceB4),
                otherHalf,
                1,
                1,
                address(this),
                block.timestamp + 30
            );
        } else if (splitLiquidity == false) {
            address[] memory path = new address[](2);
            path[0] = address(native);
            path[1] = address(token);

            uint256[] memory receivedtoken = IPancakeRouter(unirouter)
                .getAmountsOut(received, path);

            IERC20(token).approve(
                unirouter,
                receivedtoken[receivedtoken.length - 1]
            );

            IWETH(native).deposit{value: received}();
            IERC20(native).approve(unirouter, received);

            IPancakeRouter(unirouter).addLiquidity(
                token,
                native,
                receivedtoken[receivedtoken.length - 1].sub(
                    receivedtoken[receivedtoken.length - 1].div(10)
                ),
                received,
                1,
                1,
                address(this),
                block.timestamp + 30
            );
        }
    }

    function _swapTokensforToken(
        address token1,
        address token2,
        uint256 amount
    ) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;

        uint256[] memory amounts = IPancakeRouter(unirouter).getAmountsOut(
            amount,
            path
        );

        uint256 amountOut = amounts[amounts.length.sub(1)];

        // check allowance
        uint256 allowance = IERC20(token1).allowance(address(this), unirouter);
        if (allowance < amount) {
            IERC20(token1).approve(unirouter, uint256(2 ** 256 - 1));
        }

        IPancakeRouter(unirouter)
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountOut.sub(amountOut.mul(slippage).div(10000)),
                0,
                path,
                address(this),
                block.timestamp
            );

        return amounts[amounts.length.sub(1)];
    }
}
