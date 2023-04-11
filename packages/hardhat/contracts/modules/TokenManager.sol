pragma solidity 0.8.19;

import "./BurnDAI.sol";
import "../library/Structures.sol";

abstract contract TokenManager is BurnDAI {
    function getTokenAddress(
        Structures.Tokens tokenID
    ) public view returns (address tokenAddress) {
        if (tokenID == Structures.Tokens.DAI) return BurnDAI.getTokenAddress();
        if (tokenID == Structures.Tokens.MUSE)
            return BurnMUSE.getTokenAddress();
        return address(0);
    }

    function getExchangeAddress(
        Structures.Tokens tokenID
    ) public view returns (address exchangeAddress) {
        if (tokenID == Structures.Tokens.DAI)
            return BurnDAI.getExchangeAddress();
        if (tokenID == Structures.Tokens.MUSE)
            return BurnMUSE.getExchangeAddress();
        return address(0);
    }

    modifier onlyValidTokenID(Structures.Tokens tokenID) {
        require(isValidTokenID(tokenID), "invalid tokenID");
        _;
    }

    function isValidTokenID(
        Structures.Tokens tokenID
    ) internal pure returns (bool validity) {
        return
            tokenID == Structures.Tokens.MUSE ||
            tokenID == Structures.Tokens.DAI;
    }

    function _transfer(
        Structures.Tokens tokenID,
        address to,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        require(
            IERC20(getTokenAddress(tokenID)).transfer(to, value),
            "token transfer failed"
        );
    }

    function _transferFrom(
        Structures.Tokens tokenID,
        address from,
        address to,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        //check allowance
        if (tokenID == Structures.Tokens.MUSE) {
            require(
                IMUSE(getTokenAddress(tokenID)).allowance(from, to) >= value,
                "insufficient allowance"
            );
        } else if (tokenID == Structures.Tokens.DAI) {
            require(
                IERC20(getTokenAddress(tokenID)).allowance(from, to) >= value,
                "insufficient allowance"
            );
        }

        require(
            IERC20(getTokenAddress(tokenID)).transferFrom(from, to, value),
            "token transfer failed"
        );
    }

    function _burn(
        Structures.Tokens tokenID,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        if (tokenID == Structures.Tokens.DAI) {
            BurnDAI._burn(value);
        } else if (tokenID == Structures.Tokens.MUSE) {
            BurnMUSE._burn(value);
        }
    }

    function _burnFrom(
        Structures.Tokens tokenID,
        address from,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        if (tokenID == Structures.Tokens.DAI) {
            BurnDAI._burnFrom(from, value);
        } else if (tokenID == Structures.Tokens.MUSE) {
            BurnMUSE._burnFrom(from, value);
        }
    }

    function _approve(
        Structures.Tokens tokenID,
        address spender,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        if (tokenID == Structures.Tokens.DAI) {
            require(
                IERC20(BurnDAI.getTokenAddress()).approve(spender, value),
                "token approval failed"
            );
        } else if (tokenID == Structures.Tokens.MUSE) {
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
        Structures.Tokens tokenID
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(getTokenAddress(tokenID)).totalSupply();
    }

    function balanceOf(
        Structures.Tokens tokenID,
        address who
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(getTokenAddress(tokenID)).balanceOf(who);
    }

    function allowance(
        Structures.Tokens tokenID,
        address owner,
        address spender
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(getTokenAddress(tokenID)).allowance(owner, spender);
    }
}
