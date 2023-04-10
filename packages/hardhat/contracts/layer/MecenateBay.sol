// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

import {MecenateIdentity} from "../token/MecenateIdentity.sol";
import "../library/Structures.sol";
import "../modules/FeedViewer.sol";
import "../interfaces/IMecenateUsers.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MecenateBay is Ownable, FeedViewer {
    Structures.BayRequest[] public allRequests;

    address public identityContract;

    address public usersMouduleContract;

    address public museToken;

    address public daiToken;

    mapping(address => Structures.BayRequest[]) public requests;

    uint256 public contractCounter;

    event RequestCreated(
        address indexed user,
        Structures.BayRequest,
        uint256 indexed index
    );

    event RequestAccepted(
        address indexed user,
        Structures.BayRequest,
        uint256 indexed index
    );

    constructor(
        address _identityContract,
        address _usersMouduleContract,
        address _museToken,
        address _daiToken
    ) {
        identityContract = _identityContract;
        usersMouduleContract = _usersMouduleContract;
        museToken = _museToken;
        daiToken = _daiToken;
    }

    function createRequest(
        Structures.BayRequest memory request
    ) public returns (Structures.BayRequest memory) {
        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "user does not have identity"
        );
        require(request.stake > 0, "stake is not enough");

        require(request.payment > 0, "Payment is not enough");

        require(request.postAddress == address(0), "post address is not valid");

        require(request.seller == address(0), "Seller is not valid");

        if (request.tokenERC20Contract == Structures.Tokens.MUSE) {
            //check allowance
            require(
                IERC20(museToken).allowance(msg.sender, address(this)) >=
                    request.payment,
                "Muse token allowance is not enough"
            );
            IERC20(museToken).transferFrom(
                msg.sender,
                address(this),
                request.payment
            );
        } else if (request.tokenERC20Contract == Structures.Tokens.DAI) {
            require(
                IERC20(daiToken).allowance(msg.sender, address(this)) >=
                    request.payment,
                "Dai token allowance is not enough"
            );
            IERC20(daiToken).transferFrom(
                msg.sender,
                address(this),
                request.payment
            );
        } else {
            revert("Token is not valid");
        }

        contractCounter++;

        requests[msg.sender].push(request);
        allRequests.push(request);
        emit RequestCreated(msg.sender, request, allRequests.length - 1);
    }

    function acceptRequest(uint256 index, address _feed) public {
        require(
            MecenateIdentity(identityContract).balanceOf(msg.sender) > 0,
            "User does not have identity"
        );

        Structures.Feed memory feed = _getFeedInfo(_feed);

        require(
            feed.tokenERC20Contract == allRequests[index].tokenERC20Contract,
            "token is not the same of the feed"
        );

        require(
            feed.seller == msg.sender,
            "seller is not the same of the feed"
        );

        require(
            feed.buyerPayment >= allRequests[index].payment,
            "payment is not the same of the feed"
        );

        require(
            feed.sellerStake >= allRequests[index].stake,
            "stake is not the same of the feed"
        );

        bytes memory publicKey = IMecenateUsers(usersMouduleContract)
            .getUserData(allRequests[index].buyer)
            .publicKey;

        if (feed.tokenERC20Contract == Structures.Tokens.MUSE) {
            // approve muse token to the feed
            IERC20(museToken).approve(_feed, allRequests[index].payment);
        } else if (feed.tokenERC20Contract == Structures.Tokens.DAI) {
            // approve dai token to the feed
            IERC20(daiToken).approve(_feed, allRequests[index].payment);
        } else {
            revert("Token is not valid");
        }

        IMecenateFeed(_feed).acceptPost(
            publicKey,
            allRequests[index].buyer,
            allRequests[index].payment
        );

        allRequests[index].accepted = true;
        allRequests[index].seller = msg.sender;
        allRequests[index].postAddress = _feed;
        allRequests[index].postCount = feed.postCount;

        emit RequestAccepted(msg.sender, allRequests[index], index);
    }

    function getRequests()
        public
        view
        returns (Structures.BayRequest[] memory)
    {
        return allRequests;
    }

    function getRequestForAddress(
        address _address
    ) public view returns (Structures.BayRequest[] memory) {
        return requests[_address];
    }

    // removéthe request and refund the user delete the array and move the last element to the index
    function removeRequest(uint256 index) public {
        require(
            allRequests[index].buyer == msg.sender,
            "user is not the same of the request"
        );
        require(
            allRequests[index].accepted == false,
            "request is already accepted"
        );

        // Refund the buyer
        payable(msg.sender).transfer(allRequests[index].payment);

        uint256 lastIndex = allRequests.length - 1;
        allRequests[index] = allRequests[lastIndex];
        allRequests.pop();

        // Iterate through the requests[msg.sender] array to find and remove the request associated with the msg.sender
        for (uint256 i = 0; i < requests[msg.sender].length; i++) {
            // If the request in the requests[msg.sender] array matches the given index in allRequests, remove it
            if (
                requests[msg.sender][i].buyer == msg.sender &&
                requests[msg.sender][i].payment == allRequests[index].payment &&
                requests[msg.sender][i].stake == allRequests[index].stake &&
                requests[msg.sender][i].postAddress ==
                allRequests[index].postAddress &&
                requests[msg.sender][i].seller == allRequests[index].seller &&
                requests[msg.sender][i].postCount ==
                allRequests[index].postCount
            ) {
                uint256 lastIndexSender = requests[msg.sender].length - 1;
                requests[msg.sender][i] = requests[msg.sender][lastIndexSender];
                requests[msg.sender].pop();
                break;
            }
        }
    }
}
