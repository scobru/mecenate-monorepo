/// MakerOtcSupportMethods.sol
// Copyright (C) 2018 - 2020 Maker Ecosystem Growth Holdings, INC.

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

pragma solidity 0.8.19;

import "../library/DSMath.sol";

abstract contract OtcLike {
    struct OfferInfo {
        uint pay_amt;
        address pay_gem;
        uint buy_amt;
        address buy_gem;
        address owner;
        uint64 timestamp;
    }
    mapping(uint => OfferInfo) public offers;

    function getBestOffer(address, address) public view virtual returns (uint);

    function getWorseOffer(uint) public view virtual returns (uint);
}

contract MarketViewer is DSMath {
    function getOffers(
        address otc,
        address payToken,
        address buyToken
    )
        public
        view
        returns (
            uint[100] memory ids,
            uint[100] memory payAmts,
            uint[100] memory buyAmts,
            address[100] memory owners,
            uint[100] memory timestamps
        )
    {
        (ids, payAmts, buyAmts, owners, timestamps) = getOffers(
            otc,
            OtcLike(otc).getBestOffer(payToken, buyToken)
        );
    }

    function getOffers(
        address otc,
        uint offerId_
    )
        public
        view
        returns (
            uint[100] memory ids,
            uint[100] memory payAmts,
            uint[100] memory buyAmts,
            address[100] memory owners,
            uint[100] memory timestamps
        )
    {
        uint offerId = offerId_;
        uint i = 0;
        do {
            (payAmts[i], , buyAmts[i], , owners[i], timestamps[i]) = OtcLike(
                otc
            ).offers(offerId);
            if (owners[i] == address(0)) break;
            ids[i] = offerId;
            offerId = OtcLike(otc).getWorseOffer(offerId);
        } while (++i < 100);
    }

    function getOffersAmountToSellAll(
        address otc,
        address payToken,
        uint payAmt,
        address buyToken
    ) public view returns (uint ordersToTake, bool takesPartialOrder) {
        uint offerId = OtcLike(otc).getBestOffer(buyToken, payToken); // Get best offer for the token pair
        ordersToTake = 0;
        uint payAmt2 = payAmt;
        uint orderBuyAmt = 0;
        (, , orderBuyAmt, , , ) = OtcLike(otc).offers(offerId);
        while (payAmt2 > orderBuyAmt) {
            ordersToTake++; // New order taken
            payAmt2 = sub(payAmt2, orderBuyAmt); // Decrease amount to pay
            if (payAmt2 > 0) {
                // If we still need more offers
                offerId = OtcLike(otc).getWorseOffer(offerId); // We look for the next best offer
                require(offerId != 0, ""); // Fails if there are not enough offers to complete
                (, , orderBuyAmt, , , ) = OtcLike(otc).offers(offerId);
            }
        }
        ordersToTake = payAmt2 == orderBuyAmt ? ordersToTake + 1 : ordersToTake; // If the remaining amount is equal than the latest order, then it will also be taken completely
        takesPartialOrder = payAmt2 < orderBuyAmt; // If the remaining amount is lower than the latest order, then it will take a partial order
    }

    function getOffersAmountToBuyAll(
        address otc,
        address buyToken,
        uint buyAmt,
        address payToken
    ) public view returns (uint ordersToTake, bool takesPartialOrder) {
        uint offerId = OtcLike(otc).getBestOffer(buyToken, payToken); // Get best offer for the token pair
        ordersToTake = 0;
        uint buyAmt2 = buyAmt;
        uint orderPayAmt = 0;
        (orderPayAmt, , , , , ) = OtcLike(otc).offers(offerId);
        while (buyAmt2 > orderPayAmt) {
            ordersToTake++; // New order taken
            buyAmt2 = sub(buyAmt2, orderPayAmt); // Decrease amount to buy
            if (buyAmt2 > 0) {
                // If we still need more offers
                offerId = OtcLike(otc).getWorseOffer(offerId); // We look for the next best offer
                require(offerId != 0, ""); // Fails if there are not enough offers to complete
                (orderPayAmt, , , , , ) = OtcLike(otc).offers(offerId);
            }
        }
        ordersToTake = buyAmt2 == orderPayAmt ? ordersToTake + 1 : ordersToTake; // If the remaining amount is equal than the latest order, then it will also be taken completely
        takesPartialOrder = buyAmt2 < orderPayAmt; // If the remaining amount is lower than the latest order, then it will take a partial order
    }
}
