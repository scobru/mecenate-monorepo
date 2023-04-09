pragma solidity 0.8.19;

import "./BurnDAI.sol";

contract TokenManager is BurnDAI {
    enum Tokens {
        NaN,
        MUSE,
        DAI
    }

    function getTokenAddress(
        Tokens tokenID
    ) public pure returns (address tokenAddress) {
        if (tokenID == Tokens.DAI) return BurnDAI.getTokenAddress();
        if (tokenID == Tokens.MUSE) return BurnMUSE.getTokenAddress();
        return address(0);
    }

    function getExchangeAddress(
        Tokens tokenID
    ) public pure returns (address exchangeAddress) {
        if (tokenID == Tokens.DAI) return BurnDAI.getExchangeAddress();
        if (tokenID == Tokens.MUSE) return BurnMUSE.getExchangeAddress();
        return address(0);
    }

    modifier onlyValidTokenID(Tokens tokenID) {
        require(isValidTokenID(tokenID), "invalid tokenID");
        _;
    }

    function isValidTokenID(
        Tokens tokenID
    ) internal pure returns (bool validity) {
        return tokenID == Tokens.MUSE || tokenID == Tokens.DAI;
    }

    function _transfer(
        Tokens tokenID,
        address to,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        require(
            IERC20(getTokenAddress(tokenID)).transfer(to, value),
            "token transfer failed"
        );
    }

    function _transferFrom(
        Tokens tokenID,
        address from,
        address to,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        require(
            IERC20(getTokenAddress(tokenID)).transferFrom(from, to, value),
            "token transfer failed"
        );
    }

    function _burn(
        Tokens tokenID,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        if (tokenID == Tokens.DAI) {
            BurnDAI._burn(value);
        } else if (tokenID == Tokens.MUSE) {
            BurnMUSE._burn(value);
        }
    }

    function _burnFrom(
        Tokens tokenID,
        address from,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        if (tokenID == Tokens.DAI) {
            BurnDAI._burnFrom(from, value);
        } else if (tokenID == Tokens.MUSE) {
            BurnMUSE._burnFrom(from, value);
        }
    }

    function _approve(
        Tokens tokenID,
        address spender,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        if (tokenID == Tokens.DAI) {
            require(
                IERC20(BurnDAI.getTokenAddress()).approve(spender, value),
                "token approval failed"
            );
        } else if (tokenID == Tokens.MUSE) {
            address MUSE = BurnMUSE.getTokenAddress();
            uint256 currentAllowance = IMUSE(MUSE).allowance(
                msg.sender,
                spender
            );

            uint256 newAllowance = currentAllowance + value;
            require(
                IMUSE(MUSE).increaseAllowance(spender, newAllowance),
                "token approval failed"
            );
        }
    }

    function totalSupply(
        Tokens tokenID
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(getTokenAddress(tokenID)).totalSupply();
    }

    function balanceOf(
        Tokens tokenID,
        address who
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(getTokenAddress(tokenID)).balanceOf(who);
    }

    function allowance(
        Tokens tokenID,
        address owner,
        address spender
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(getTokenAddress(tokenID)).allowance(owner, spender);
    }
}
