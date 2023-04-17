// SPDX-License-Identifier: AGPL-3.0-or-later

/// simple_market.sol

// Copyright (C) 2016 - 2021 Dai Foundation

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

// ERC20b import
import "../library/DSMath.sol";
import "../library/ERC20b.sol";

contract EventfulMarket {
    event LogItemUpdate(uint id);
    event LogTrade(
        uint pay_amt,
        address indexed pay_gem,
        uint buy_amt,
        address indexed buy_gem
    );

    event LogMake(
        bytes32 indexed id,
        bytes32 indexed pair,
        address indexed maker,
        ERC20b pay_gem,
        ERC20b buy_gem,
        uint128 pay_amt,
        uint128 buy_amt,
        uint64 timestamp
    );

    event LogBump(
        bytes32 indexed id,
        bytes32 indexed pair,
        address indexed maker,
        ERC20b pay_gem,
        ERC20b buy_gem,
        uint128 pay_amt,
        uint128 buy_amt,
        uint64 timestamp
    );

    event LogTake(
        bytes32 id,
        bytes32 indexed pair,
        address indexed maker,
        ERC20b pay_gem,
        ERC20b buy_gem,
        address indexed taker,
        uint128 take_amt,
        uint128 give_amt,
        uint64 timestamp
    );

    event LogKill(
        bytes32 indexed id,
        bytes32 indexed pair,
        address indexed maker,
        ERC20b pay_gem,
        ERC20b buy_gem,
        uint128 pay_amt,
        uint128 buy_amt,
        uint64 timestamp
    );
}

contract MecenateMarket is EventfulMarket, DSMath {
    uint public last_offer_id;

    mapping(uint => OfferInfo) public offers;

    bool locked;

    struct OfferInfo {
        uint pay_amt;
        ERC20b pay_gem;
        uint buy_amt;
        ERC20b buy_gem;
        address owner;
        uint64 timestamp;
    }

    modifier can_buy(uint id) {
        require(isActive(id));
        _;
    }

    modifier can_cancel(uint id) virtual {
        require(isActive(id));
        require(getOwner(id) == msg.sender);
        _;
    }

    modifier can_offer() {
        _;
    }

    modifier synchronized() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }

    function isActive(uint id) public view returns (bool active) {
        return offers[id].timestamp > 0;
    }

    function getOwner(uint id) public view returns (address owner) {
        return offers[id].owner;
    }

    function getOffer(
        uint id
    ) public view returns (uint, ERC20b, uint, ERC20b) {
        OfferInfo memory offer = offers[id];
        return (offer.pay_amt, offer.pay_gem, offer.buy_amt, offer.buy_gem);
    }

    // ---- Public entrypoints ---- //

    function bump(bytes32 id_) public can_buy(uint256(id_)) {
        uint256 id = uint256(id_);
        emit LogBump(
            id_,
            keccak256(abi.encodePacked(offers[id].pay_gem, offers[id].buy_gem)),
            offers[id].owner,
            offers[id].pay_gem,
            offers[id].buy_gem,
            uint128(offers[id].pay_amt),
            uint128(offers[id].buy_amt),
            offers[id].timestamp
        );
    }

    // Accept given `quantity` of an offer. Transfers funds from caller to
    // offer maker, and from market to caller.
    function buy(
        uint id,
        uint quantity
    ) public virtual can_buy(id) synchronized returns (bool) {
        OfferInfo memory offer = offers[id];
        uint spend = mul(quantity, offer.buy_amt) / offer.pay_amt;

        require(uint128(spend) == spend);
        require(uint128(quantity) == quantity);

        // For backwards semantic compatibility.
        if (
            quantity == 0 ||
            spend == 0 ||
            quantity > offer.pay_amt ||
            spend > offer.buy_amt
        ) {
            return false;
        }

        offers[id].pay_amt = sub(offer.pay_amt, quantity);
        offers[id].buy_amt = sub(offer.buy_amt, spend);
        safeTransferFrom(offer.buy_gem, msg.sender, offer.owner, spend);
        safeTransfer(offer.pay_gem, msg.sender, quantity);

        emit LogItemUpdate(id);
        emit LogTake(
            bytes32(id),
            keccak256(abi.encodePacked(offer.pay_gem, offer.buy_gem)),
            offer.owner,
            offer.pay_gem,
            offer.buy_gem,
            msg.sender,
            uint128(quantity),
            uint128(spend),
            uint64(block.timestamp)
        );
        emit LogTrade(
            quantity,
            address(offer.pay_gem),
            spend,
            address(offer.buy_gem)
        );

        if (offers[id].pay_amt == 0) {
            delete offers[id];
        }

        return true;
    }

    // Cancel an offer. Refunds offer maker.
    function cancel(
        uint id
    ) public virtual can_cancel(id) synchronized returns (bool success) {
        // read-only offer. Modify an offer by directly accessing offers[id]
        OfferInfo memory offer = offers[id];
        delete offers[id];

        safeTransfer(offer.pay_gem, offer.owner, offer.pay_amt);

        emit LogItemUpdate(id);
        emit LogKill(
            bytes32(id),
            keccak256(abi.encodePacked(offer.pay_gem, offer.buy_gem)),
            offer.owner,
            offer.pay_gem,
            offer.buy_gem,
            uint128(offer.pay_amt),
            uint128(offer.buy_amt),
            uint64(block.timestamp)
        );

        success = true;
    }

    function kill(bytes32 id) public virtual {
        require(cancel(uint256(id)));
    }

    function make(
        ERC20b pay_gem,
        ERC20b buy_gem,
        uint128 pay_amt,
        uint128 buy_amt
    ) public virtual returns (bytes32 id) {
        return bytes32(offer(pay_amt, pay_gem, buy_amt, buy_gem));
    }

    // Make a new offer. Takes funds from the caller into market escrow.
    function offer(
        uint pay_amt,
        ERC20b pay_gem,
        uint buy_amt,
        ERC20b buy_gem
    ) public virtual can_offer synchronized returns (uint id) {
        require(uint128(pay_amt) == pay_amt);
        require(uint128(buy_amt) == buy_amt);
        require(pay_amt > 0);
        require(pay_gem != ERC20b(address(0)));
        require(buy_amt > 0);
        require(buy_gem != ERC20b(address(0)));
        require(pay_gem != buy_gem);

        OfferInfo memory info;
        info.pay_amt = pay_amt;
        info.pay_gem = pay_gem;
        info.buy_amt = buy_amt;
        info.buy_gem = buy_gem;
        info.owner = msg.sender;
        info.timestamp = uint64(block.timestamp);
        id = _next_id();
        offers[id] = info;

        safeTransferFrom(pay_gem, msg.sender, address(this), pay_amt);

        emit LogItemUpdate(id);
        emit LogMake(
            bytes32(id),
            keccak256(abi.encodePacked(pay_gem, buy_gem)),
            msg.sender,
            pay_gem,
            buy_gem,
            uint128(pay_amt),
            uint128(buy_amt),
            uint64(block.timestamp)
        );
    }

    function take(bytes32 id, uint128 maxTakeAmount) public virtual {
        require(buy(uint256(id), maxTakeAmount));
    }

    function _next_id() internal returns (uint) {
        last_offer_id++;
        return last_offer_id;
    }

    function safeTransfer(ERC20b token, address to, uint256 value) internal {
        _callOptionalReturn(
            token,
            abi.encodeWithSelector(token.transfer.selector, to, value)
        );
    }

    function safeTransferFrom(
        ERC20b token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(
            token,
            abi.encodeWithSelector(token.transferFrom.selector, from, to, value)
        );
    }

    function _callOptionalReturn(ERC20b token, bytes memory data) private {
        uint256 size;
        assembly {
            size := extcodesize(token)
        }
        require(size > 0, "Not a contract");

        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "Token call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(
                abi.decode(returndata, (bool)),
                "SafeERC20b: ERC20b operation did not succeed"
            );
        }
    }
}
