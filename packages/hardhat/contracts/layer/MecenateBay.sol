/**
 * @title MecenateBay
 * @dev This contract manages the creation and acceptance of requests for Mecenate feeds. It also verifies user identity using the Sismo protocol.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../library/Structures.sol";
import "../modules/FeedViewer.sol";
import "../interfaces/IMecenateUsers.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MecenateBay is Ownable, FeedViewer {
    using SafeERC20 for IERC20;

    Structures.BayRequest[] public allRequests;

    address public usersMouduleContract;
    address public museToken;
    address public daiToken;

    mapping(address => Structures.BayRequest[]) public requests;
    mapping(uint256 => bytes) private sismoResponseMapping;

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

    constructor(address usersMouduleContractAddress) {
        usersMouduleContract = usersMouduleContractAddress;
    }

    function changeMuseToken(address _museToken) external onlyOwner {
        museToken = _museToken;
    }

    function changeDaiToken(address _daiToken) external onlyOwner {
        daiToken = _daiToken;
    }

    function createRequest(
        Structures.BayRequest memory request
    ) external payable returns (Structures.BayRequest memory) {
        if (request.tokenId == Structures.Tokens.NaN) {
            require(msg.value > 0, "BAY:payment is not enough");

            require(request.payment == msg.value, "BAY:payment is not enough");
        } else if (request.tokenId == Structures.Tokens.DAI) {
            IERC20(daiToken).safeTransferFrom(
                msg.sender,
                address(this),
                request.payment
            );
        } else if (request.tokenId == Structures.Tokens.MUSE) {
            IERC20(museToken).safeTransferFrom(
                msg.sender,
                address(this),
                request.payment
            );
        }

        require(request.payment > 0, "BAY:payment is not enough");
        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(msg.sender),
            "user does not exist"
        );

        require(request.stake > 0, "BAY:stake is not enough");
        require(request.payment > 0, "BAY:payment is not enough");

        requests[msg.sender].push(request);

        allRequests.push(request);

        contractCounter++;

        emit RequestCreated(msg.sender, request, allRequests.length - 1);
    }

    function acceptRequest(uint256 index, address feed) external {
        Structures.Feed memory newFeed = _getFeedInfo(feed);

        require(
            allRequests[index].payment >= newFeed.paymentRequested,
            "BAY:payment is not the same of the feed"
        );
        require(
            newFeed.stakeRequested >= allRequests[index].stake,
            "BAY:stake is not the same of the feed"
        );
        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(msg.sender),
            "BAY:user does not exist"
        );

        if (allRequests[index].tokenId != Structures.Tokens.NaN) {
            if (allRequests[index].tokenId == Structures.Tokens.DAI) {
                IERC20(daiToken).approve(feed, allRequests[index].payment);
            } else if (allRequests[index].tokenId == Structures.Tokens.MUSE) {
                IERC20(museToken).approve(feed, allRequests[index].payment);
            }

            IMecenateFeed(feed).acceptPost{value: 0}(
                allRequests[index].tokenId,
                allRequests[index].payment,
                address(this),
                allRequests[index].buyerAddress
            );
        } else {
            IMecenateFeed(feed).acceptPost{value: allRequests[index].payment}(
                allRequests[index].tokenId,
                allRequests[index].payment,
                address(this),
                allRequests[index].buyerAddress
            );
        }

        allRequests[index].accepted = true;
        allRequests[index].postAddress = feed;
        allRequests[index].postCount = newFeed.postCount;
        allRequests[index].postId = IMecenateFeed(feed).getPostId();

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
        address _user
    ) public view returns (Structures.BayRequest[] memory) {
        return requests[_user];
    }

    // removéthe request and refund the user delete the array and move the last element to the index
    function removeRequest(uint256 index) public {
        require(allRequests[index].buyerAddress == msg.sender, "NOT THE BUYER");

        require(
            allRequests[index].accepted == false,
            "BAY:request is already accepted"
        );

        Structures.BayRequest memory requestToRemove = allRequests[index];

        //  send eth with data to the vaultctx
        (bool _result, ) = payable(msg.sender).call{
            value: requestToRemove.payment
        }("");

        require(_result, "BAY:Vault call failed");

        // Remove from allRequests array
        uint256 lastIndex = allRequests.length - 1;
        if (index < lastIndex) {
            allRequests[index] = allRequests[lastIndex];
        }

        allRequests.pop();

        // Remove from requests mapping
        for (uint256 i = 0; i < requests[msg.sender].length; i++) {
            if (
                requests[msg.sender][i].payment == requestToRemove.payment &&
                requests[msg.sender][i].stake == requestToRemove.stake &&
                requests[msg.sender][i].postAddress ==
                requestToRemove.postAddress &&
                requests[msg.sender][i].postCount == requestToRemove.postCount
            ) {
                uint256 lastIndexSender = requests[msg.sender].length - 1;
                if (i < lastIndexSender) {
                    requests[msg.sender][i] = requests[msg.sender][
                        lastIndexSender
                    ];
                }
                requests[msg.sender].pop();
                break;
            }
        }
    }

    function changeUsersModule(address _usersModule) external onlyOwner {
        usersMouduleContract = _usersModule;
    }

    receive() external payable {}
}
