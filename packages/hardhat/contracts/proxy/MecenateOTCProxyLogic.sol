pragma solidity 0.8.19;

import "../library/DSMath.sol";

abstract contract OtcInterface {
    function sellAllAmount(
        address,
        uint,
        address,
        uint
    ) public virtual returns (uint);

    function buyAllAmount(
        address,
        uint,
        address,
        uint
    ) public virtual returns (uint);

    function getPayAmount(address, address, uint) public virtual returns (uint);
}

abstract contract TokenInterface {
    function balanceOf(address) public virtual returns (uint);

    function allowance(address, address) public virtual returns (uint);

    function approve(address, uint) public virtual;

    function transfer(address, uint) public virtual returns (bool);

    function transferFrom(address, address, uint) public virtual returns (bool);

    function deposit() public payable virtual;

    function withdraw(uint) public virtual;
}

contract MecenateOTCProxyLogic is DSMath {
    uint256 MAX_INT =
        0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    function withdrawAndSend(TokenInterface wethToken, uint wethAmt) internal {
        wethToken.withdraw(wethAmt);
        (bool success, ) = msg.sender.call{value: wethAmt}("");
        require(success, "transfer-failed");
    }

    function sellAllAmount(
        OtcInterface otc,
        TokenInterface payToken,
        uint payAmt,
        TokenInterface buyToken,
        uint minBuyAmt
    ) public returns (uint buyAmt) {
        require(payToken.transferFrom(msg.sender, address(this), payAmt));
        if (payToken.allowance(address(this), address(otc)) < payAmt) {
            payToken.approve(address(otc), uint(MAX_INT));
        }
        buyAmt = otc.sellAllAmount(
            address(payToken),
            payAmt,
            address(buyToken),
            minBuyAmt
        );
        require(buyToken.transfer(msg.sender, buyAmt));
    }

    function sellAllAmountPayEth(
        OtcInterface otc,
        TokenInterface wethToken,
        TokenInterface buyToken,
        uint minBuyAmt
    ) public payable returns (uint buyAmt) {
        wethToken.deposit{value: msg.value}();

        if (
            wethToken.allowance(address(address(this)), address(address(otc))) <
            msg.value
        ) {
            wethToken.approve(address(address(otc)), uint(MAX_INT));
        }
        buyAmt = otc.sellAllAmount(
            address(wethToken),
            msg.value,
            address(buyToken),
            minBuyAmt
        );
        require(buyToken.transfer(msg.sender, buyAmt));
    }

    function sellAllAmountBuyEth(
        OtcInterface otc,
        TokenInterface payToken,
        uint payAmt,
        TokenInterface wethToken,
        uint minBuyAmt
    ) public returns (uint wethAmt) {
        require(payToken.transferFrom(msg.sender, address(this), payAmt));
        if (
            payToken.allowance(address(address(this)), address(address(otc))) <
            payAmt
        ) {
            payToken.approve(address(address(otc)), uint(MAX_INT));
        }
        wethAmt = otc.sellAllAmount(
            address(payToken),
            payAmt,
            address(wethToken),
            minBuyAmt
        );
        withdrawAndSend(wethToken, wethAmt);
    }

    function buyAllAmount(
        OtcInterface otc,
        TokenInterface buyToken,
        uint buyAmt,
        TokenInterface payToken,
        uint maxPayAmt
    ) public returns (uint payAmt) {
        uint payAmtNow = otc.getPayAmount(
            address(payToken),
            address(buyToken),
            buyAmt
        );
        require(payAmtNow <= maxPayAmt);
        require(payToken.transferFrom(msg.sender, address(this), payAmtNow));
        if (payToken.allowance(address(this), address(otc)) < payAmtNow) {
            payToken.approve(address(otc), uint(MAX_INT));
        }
        payAmt = otc.buyAllAmount(
            address(buyToken),
            buyAmt,
            address(payToken),
            payAmtNow
        );
        require(
            buyToken.transfer(
                msg.sender,
                min(buyAmt, buyToken.balanceOf(address(this)))
            )
        ); // To avoid rounding issues we check the minimum value
    }

    function buyAllAmountPayEth(
        OtcInterface otc,
        TokenInterface buyToken,
        uint buyAmt,
        TokenInterface wethToken
    ) public payable returns (uint wethAmt) {
        // In address(this) case user needs to send more ETH than a estimated value, then contract will send back the rest
        wethToken.deposit{value: msg.value};

        if (wethToken.allowance(address(this), address(otc)) < msg.value) {
            wethToken.approve(address(otc), uint(MAX_INT));
        }
        wethAmt = otc.buyAllAmount(
            address(buyToken),
            buyAmt,
            address(wethToken),
            msg.value
        );
        require(
            buyToken.transfer(
                msg.sender,
                min(buyAmt, buyToken.balanceOf(address(this)))
            )
        ); // To avoid rounding issues we check the minimum value
        withdrawAndSend((wethToken), sub(msg.value, wethAmt));
    }

    function buyAllAmountBuyEth(
        OtcInterface otc,
        TokenInterface wethToken,
        uint wethAmt,
        TokenInterface payToken,
        uint maxPayAmt
    ) public returns (uint payAmt) {
        uint payAmtNow = otc.getPayAmount(
            address(payToken),
            address(wethToken),
            wethAmt
        );
        require(payAmtNow <= maxPayAmt);
        require(payToken.transferFrom(msg.sender, address(this), payAmtNow));
        if (payToken.allowance(address(this), address(otc)) < payAmtNow) {
            payToken.approve(address(otc), uint(2 ^ (256 - 1)));
        }
        payAmt = otc.buyAllAmount(
            address(wethToken),
            wethAmt,
            address(payToken),
            payAmtNow
        );
        withdrawAndSend(wethToken, wethAmt);
    }

    receive() external payable virtual {}
}
