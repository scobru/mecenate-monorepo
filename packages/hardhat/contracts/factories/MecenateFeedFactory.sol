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

    address public router;

    address public usersMouduleContract;

    constructor(
        address _usersMouduleContract,
        address _identityContract,
        address _treasuryContract,
        address _museToken,
        address _router
    ) Factory(_identityContract, _treasuryContract) {
        usersMouduleContract = _usersMouduleContract;
        _transferOwnership(msg.sender);
    }

    function _createContract(
        address creator
    ) internal virtual override returns (address) {
        MecenateFeed feed = new MecenateFeed(
            creator,
            identityContract,
            msg.sender
        );

        return address(feed);
    }

    function chengeMuseToken(address _museToken) public onlyOwner {
        museToken = _museToken;
    }

    function changeDaiToken(address _daiToken) public onlyOwner {
        daiToken = _daiToken;
    }

    function changeRouter(address _router) public onlyOwner {
        router = _router;
    }

    function getFeedInfo(
        address _contract
    ) public view returns (Structures.Feed memory) {
        return _getFeedInfo(_contract);
    }

    function getFeedsInfo() public view returns (Structures.Feed[] memory) {
        return _getFeedsInfo(contracts);
    }
}
