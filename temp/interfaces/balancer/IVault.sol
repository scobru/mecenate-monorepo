// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.0 <0.9.0;

interface IAsset {}

interface IVault {
    enum SwapKind {
        GIVEN_IN,
        GIVEN_OUT
    }

    function swap(
        SingleSwap memory singleSwap,
        FundManagement memory funds,
        uint256 limit,
        uint256 deadline
    ) external payable returns (uint256);

    struct SingleSwap {
        bytes32 poolId;
        SwapKind kind;
        IAsset assetIn;
        IAsset assetOut;
        uint256 amount;
        bytes userData;
    }

    struct FundManagement {
        address sender;
        bool fromInternalBalance;
        address payable recipient;
        bool toInternalBalance;
    }
}
