/**
 * @title MecenateBay
 * @dev This contract manages the creation and acceptance of requests for Mecenate feeds. It also verifies user identity using the Sismo protocol.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateVerifier.sol";
import "../library/Structures.sol";
import "../modules/FeedViewer.sol";
import "../interfaces/IMecenateUsers.sol";

contract MecenateBay is Ownable, FeedViewer {
    Structures.BayRequest[] public allRequests;

    Structures.BayRequestPrivate[] public allRequestsPrivate;

    address public usersMouduleContract;

    address public verifierContract;

    mapping(address => Structures.BayRequest[]) public requests;

    uint256 public contractCounter;

    mapping(uint256 => bytes) private sismoResponseMapping;

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

    constructor(address _usersMouduleContract, address _verifierContract) {
        usersMouduleContract = _usersMouduleContract;
        verifierContract = _verifierContract;
    }

    function createRequest(
        Structures.BayRequest memory request,
        bytes memory sismoConnectResponse
    ) public payable returns (Structures.BayRequest memory) {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted,
            ,

        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        require(request.stake > 0, "BAY:stake is not enough");

        require(request.payment == msg.value, "BAY:payment is not enough");

        require(request.payment > 0, "BAY:payment is not enough");

        requests[userAddressConverted].push(request);

        allRequests.push(request);

        allRequestsPrivate.push(
            Structures.BayRequestPrivate({
                seller: address(0),
                vaultIdSeller: "0x00",
                sellerResponse: "0x00",
                buyer: userAddressConverted,
                vaultIdBuyer: vaultIdBytes,
                buyerResponse: sismoConnectResponse
            })
        );

        contractCounter++;

        emit RequestCreated(
            userAddressConverted,
            request,
            allRequests.length - 1
        );
    }

    function acceptRequest(
        uint256 index,
        address _feed,
        bytes memory sismoConnectResponse
    ) public {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted,
            ,

        ) = sismoVerify(sismoConnectResponse);

        Structures.Feed memory feed = _getFeedInfo(_feed);

        require(
            allRequests[index].payment >= feed.buyerPayment,
            "BAY:payment is not the same of the feed"
        );

        require(
            feed.sellerStake >= allRequests[index].stake,
            "BAY:stake is not the same of the feed"
        );

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "BAY:user does not exist"
        );

        allRequestsPrivate.push(
            Structures.BayRequestPrivate({
                seller: userAddressConverted,
                vaultIdSeller: vaultIdBytes,
                sellerResponse: sismoConnectResponse,
                buyer: allRequestsPrivate[index].buyer,
                vaultIdBuyer: allRequestsPrivate[index].vaultIdBuyer,
                buyerResponse: allRequestsPrivate[index].buyerResponse
            })
        );

        // uint256 paymentRequested = IMecenateFeed(_feed).getPaymentRequested();
        // uint256 stakeRequested = IMecenateFeed(_feed).getStakeRequested();

        // require(
        //     paymentRequested >= allRequests[index].payment,
        //     "payment is not the same of the feed"
        // );

        // require(
        //     stakeRequested >= allRequests[index].stake,
        //     "stake is not the same of the feed"
        // );

        IMecenateFeed(_feed).acceptPost{value: allRequests[index].payment}(
            allRequestsPrivate[index].buyerResponse
        );

        allRequests[index].accepted = true;

        allRequests[index].postAddress = _feed;

        allRequests[index].postCount = feed.postCount;

        emit RequestAccepted(userAddressConverted, allRequests[index], index);
    }

    function sismoVerify(
        bytes memory sismoConnectResponse
    )
        internal
        view
        returns (uint256, bytes memory, uint256, address, uint256, uint256)
    {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted,
            uint256 twitterId,
            uint256 telegramId
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse
            );
        return (
            vaultId,
            vaultIdBytes,
            userAddress,
            userAddressConverted,
            twitterId,
            telegramId
        );
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
    function removeRequest(
        uint256 index,
        bytes memory sismoConnectResponse
    ) public {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted,
            uint256 twitterId,
            uint256 telegramId
        ) = sismoVerify(sismoConnectResponse);

        require(
            allRequestsPrivate[index].buyer == userAddressConverted,
            "BAY:user is not the buyer"
        );

        require(
            allRequests[index].accepted == false,
            "BAY:request is already accepted"
        );

        Structures.BayRequest memory requestToRemove = allRequests[index];

        // Refund the buyer
        payable(userAddressConverted).transfer(requestToRemove.payment);

        // Remove from allRequests array
        uint256 lastIndex = allRequests.length - 1;
        if (index < lastIndex) {
            allRequests[index] = allRequests[lastIndex];
        }
        allRequests.pop();

        // Remove from allRequestsPrivate array
        uint256 lastIndexPrivate = allRequestsPrivate.length - 1;
        if (index < lastIndexPrivate) {
            allRequestsPrivate[index] = allRequestsPrivate[lastIndexPrivate];
        }
        allRequestsPrivate.pop();

        // Remove from requests mapping
        for (uint256 i = 0; i < requests[userAddressConverted].length; i++) {
            if (
                requests[userAddressConverted][i].payment ==
                requestToRemove.payment &&
                requests[userAddressConverted][i].stake ==
                requestToRemove.stake &&
                requests[userAddressConverted][i].postAddress ==
                requestToRemove.postAddress &&
                requests[userAddressConverted][i].postCount ==
                requestToRemove.postCount
            ) {
                uint256 lastIndexSender = requests[userAddressConverted]
                    .length - 1;
                if (i < lastIndexSender) {
                    requests[userAddressConverted][i] = requests[
                        userAddressConverted
                    ][lastIndexSender];
                }
                requests[userAddressConverted].pop();
                break;
            }
        }
    }

    receive() external payable {}
}
