// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import {MecenateFeed} from "../features/MecenateFeed.sol";
import "../interfaces/IMecenateUsers.sol";
import "../modules/FeedViewer.sol";
import "../modules/Factory.sol";

contract MecenateFeedFactory is Factory, FeedViewer {
    address public museToken;

    address public daiToken;

    address public wethToken;

    address public router;

    address public usersMouduleContract;

    constructor(
        address _usersMouduleContract,
        address _identityContract,
        address _treasuryContract,
        address _museToken,
        address _daiToken,
        address _wethToken,
        address _router
    ) Factory(_identityContract, _treasuryContract) {
        router = _router;
        museToken = museToken;
        daiToken = _daiToken;
        wethToken = _wethToken;
        usersMouduleContract = _usersMouduleContract;
        _transferOwnership(address(0x3db5E84e0eBBEa945a0a82E879DcB7E1D1a587B4));
    }

    function _createContract(
        address creator
    ) internal virtual override returns (address) {
        MecenateFeed feed = new MecenateFeed(
            creator,
            usersMouduleContract,
            identityContract,
            address(this)
        );
        return address(feed);
    }

    function changeMuseToken(address _museToken) public onlyOwner {
        museToken = _museToken;
    }

    function changeDaiToken(address _daiToken) public onlyOwner {
        daiToken = _daiToken;
    }

    function changeRouter(address _router) public onlyOwner {
        router = _router;
    }

    function getFeedInfo(
        address _feed
    ) public view returns (Structures.Feed memory) {
        return _getFeedInfo(_feed);
    }

    function getFeedsInfo() public view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(contracts);
    }
}
