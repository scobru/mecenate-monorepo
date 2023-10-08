pragma solidity 0.8.19;

import "./BurnDAI.sol";

abstract contract TokenManager is BurnDAI {
    function _getTokenAddress(
        Structures.Tokens tokenID
    ) internal view returns (address) {
        if (tokenID == Structures.Tokens.DAI)
            return IMecenateFeedFactory(settings.factoryContract).daiToken();
        if (tokenID == Structures.Tokens.MUSE)
            return IMecenateFeedFactory(settings.factoryContract).museToken();
        return address(0);
    }

    function _checkAllowance(
        Structures.Tokens tokenID,
        address from,
        address to,
        uint256 value
    ) internal view {
        address tokenAddress = _getTokenAddress(tokenID);
        require(
            IERC20(tokenAddress).allowance(from, to) >= value,
            "INSUFFICIENT_ALLOWANCE"
        );
    }

    modifier onlyValidTokenID(Structures.Tokens tokenID) {
        require(
            tokenID == Structures.Tokens.MUSE ||
                tokenID == Structures.Tokens.DAI ||
                tokenID == Structures.Tokens.NaN,
            "WRONG_TOKEN"
        );
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
            IERC20(_getTokenAddress(tokenID)).transfer(to, value),
            "TRANSFER_FAILED"
        );
    }

    function _transferFrom(
        Structures.Tokens tokenID,
        address from,
        address to,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        address tokenAddress = _getTokenAddress(tokenID);
        _checkAllowance(tokenID, from, to, value);
        require(
            IERC20(tokenAddress).transferFrom(from, to, value),
            "TRANSFER_FAILED"
        );
    }

    function _burn(
        Structures.Tokens tokenID,
        address _receiver,
        uint256 value
    ) internal onlyValidTokenID(tokenID) returns (bool success) {
        bool burnEnabled = IMecenateFeedFactory(settings.factoryContract)
            .burnEnabled();

        if (burnEnabled == false) {
            if (tokenID == Structures.Tokens.NaN) {
                (bool result, ) = payable(_receiver).call{value: value}("");
                require(result, "CALL_FAILED");
            } else {
                TokenManager._transfer(tokenID, _receiver, value);
            }
        } else {
            if (tokenID == Structures.Tokens.DAI) {
                _burnDai(value);
            } else if (tokenID == Structures.Tokens.MUSE) {
                _burn(value);
            } else if (tokenID == Structures.Tokens.NaN) {
                _burnWeth(value);
            }
        }

        return true;
    }

    function _burnFrom(
        Structures.Tokens tokenID,
        address from,
        uint256 value
    ) internal onlyValidTokenID(tokenID) {
        address treasury = IMecenateFeedFactory(settings.factoryContract)
            .treasuryContract();

        if (tokenID == Structures.Tokens.DAI) {
            IERC20(IMecenateFeedFactory(settings.factoryContract).daiToken())
                .transferFrom(from, treasury, value);
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
                IERC20(
                    IMecenateFeedFactory(settings.factoryContract).daiToken()
                ).approve(spender, value),
                "APPROVE_FAILED"
            );
        } else if (tokenID == Structures.Tokens.MUSE) {
            uint256 currentAllowance = IMUSE(
                IMecenateFeedFactory(settings.factoryContract).museToken()
            ).allowance(msg.sender, spender);

            uint256 newAllowance = currentAllowance + value;
            require(
                IMUSE(IMecenateFeedFactory(settings.factoryContract).daiToken())
                    .increaseAllowance(spender, newAllowance),
                "APPROVE_FAILED"
            );
        }
    }

    function totalSupply(
        Structures.Tokens tokenID
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(_getTokenAddress(tokenID)).totalSupply();
    }

    function balanceOf(
        Structures.Tokens tokenID,
        address who
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(_getTokenAddress(tokenID)).balanceOf(who);
    }

    function allowance(
        Structures.Tokens tokenID,
        address owner,
        address spender
    ) internal view onlyValidTokenID(tokenID) returns (uint256 value) {
        return IERC20(_getTokenAddress(tokenID)).allowance(owner, spender);
    }
}
