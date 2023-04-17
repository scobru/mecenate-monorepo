pragma solidity 0.8.19;

import "./MecenateOTCProxyLogic.sol";
import "../library/DSProxy.sol";

contract MecenateOTCProxy is MecenateOTCProxyLogic {
    TokenInterface wethToken;

    function ProxyCreationAndExecute(address wethToken_) public {
        wethToken = TokenInterface(wethToken_);
    }

    function createAndSellAllAmount(
        DSProxyFactory factory,
        OtcInterface otc,
        TokenInterface payToken,
        uint payAmt,
        TokenInterface buyToken,
        uint minBuyAmt
    ) public returns (address proxy, uint buyAmt) {
        proxy = factory.build(msg.sender);
        buyAmt = sellAllAmount(otc, payToken, payAmt, buyToken, minBuyAmt);
    }

    function createAndSellAllAmountPayEth(
        DSProxyFactory factory,
        OtcInterface otc,
        TokenInterface buyToken,
        uint minBuyAmt
    ) public payable returns (address proxy, uint buyAmt) {
        proxy = factory.build(msg.sender);
        buyAmt = sellAllAmountPayEth(otc, wethToken, buyToken, minBuyAmt);
    }

    function createAndSellAllAmountBuyEth(
        DSProxyFactory factory,
        OtcInterface otc,
        TokenInterface payToken,
        uint payAmt,
        uint minBuyAmt
    ) public returns (address proxy, uint wethAmt) {
        proxy = factory.build(msg.sender);
        wethAmt = sellAllAmountBuyEth(
            otc,
            payToken,
            payAmt,
            wethToken,
            minBuyAmt
        );
    }

    function createAndBuyAllAmount(
        DSProxyFactory factory,
        OtcInterface otc,
        TokenInterface buyToken,
        uint buyAmt,
        TokenInterface payToken,
        uint maxPayAmt
    ) public returns (address proxy, uint payAmt) {
        proxy = factory.build(msg.sender);
        payAmt = buyAllAmount(otc, buyToken, buyAmt, payToken, maxPayAmt);
    }

    function createAndBuyAllAmountPayEth(
        DSProxyFactory factory,
        OtcInterface otc,
        TokenInterface buyToken,
        uint buyAmt
    ) public payable returns (address proxy, uint wethAmt) {
        proxy = factory.build(address(msg.sender));
        wethAmt = buyAllAmountPayEth(otc, buyToken, buyAmt, wethToken);
    }

    function createAndBuyAllAmountBuyEth(
        DSProxyFactory factory,
        OtcInterface otc,
        uint wethAmt,
        TokenInterface payToken,
        uint maxPayAmt
    ) public returns (address proxy, uint payAmt) {
        proxy = factory.build(address(msg.sender));
        payAmt = buyAllAmountBuyEth(
            otc,
            wethToken,
            wethAmt,
            payToken,
            maxPayAmt
        );
    }

    receive() external payable override {
        require(msg.sender == address(wethToken));
    }
}
