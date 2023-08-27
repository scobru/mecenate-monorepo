// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateVerifier.sol";

import "../library/Structures.sol";
import "../modules/FeedViewer.sol";
import "../interfaces/IMecenateUsers.sol";
import "../interfaces/IMecenateWallet.sol";

contract MecenateBay is Ownable, FeedViewer {
    Structures.BayRequest[] public allRequests;
    Structures.BayRequestPrivate[] public allRequestsPrivate;

    address public usersMouduleContract;

    address public verifierContract;

    address public walletContract;

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
        address _usersMouduleContract,
        address _verifierContract,
        address _walletContract
    ) {
        usersMouduleContract = _usersMouduleContract;
        verifierContract = _verifierContract;
        walletContract = _walletContract;
    }

    function createRequest(
        Structures.BayRequest memory request,
        bytes memory sismoConnectResponse
    ) public returns (Structures.BayRequest memory) {
        (
            ,
            bytes memory vaultIdBytes,
            ,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        require(request.stake > 0, "stake is not enough");

        bool result = IMecenateWallet(walletContract).pay(
            address(this),
            request.payment,
            keccak256(vaultIdBytes)
        );

        require(result, "payment failed");

        contractCounter++;

        requests[userAddressConverted].push(request);

        allRequests.push(request);

        allRequestsPrivate.push(
            Structures.BayRequestPrivate({
                seller: address(0),
                vaultIdSeller: "0x00",
                buyer: userAddressConverted,
                vaultIdBuyer: vaultIdBytes
            })
        );

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
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        Structures.Feed memory feed = _getFeedInfo(_feed);

        require(
            feed.buyerPayment >= allRequests[index].payment,
            "payment is not the same of the feed"
        );

        require(
            feed.sellerStake >= allRequests[index].stake,
            "stake is not the same of the feed"
        );

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(
                keccak256(vaultIdBytes)
            ),
            "user does not exist"
        );

        allRequestsPrivate.push(
            Structures.BayRequestPrivate({
                seller: userAddressConverted,
                vaultIdSeller: vaultIdBytes,
                buyer: allRequestsPrivate[index].buyer,
                vaultIdBuyer: allRequestsPrivate[index].vaultIdBuyer
            })
        );

        uint256 paymentRequested = IMecenateFeed(_feed).getPaymentRequested();

        uint256 stakeRequested = IMecenateFeed(_feed).getStakeRequested();

        require(
            paymentRequested == allRequests[index].payment,
            "payment is not the same of the feed"
        );

        require(
            stakeRequested >= allRequests[index].stake,
            "stake is not the same of the feed"
        );

        IMecenateFeed(_feed).acceptPost(
            sismoConnectResponse,
            allRequests[index].payment
        );

        allRequests[index].accepted = true;
        allRequests[index].postAddress = _feed;
        allRequests[index].postCount = feed.postCount;

        emit RequestAccepted(userAddressConverted, allRequests[index], index);
    }

    function sismoVerify(
        bytes memory sismoConnectResponse
    ) internal view returns (uint256, bytes memory, uint256, address) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse
            );
        return (vaultId, vaultIdBytes, userAddress, userAddressConverted);
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
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            allRequestsPrivate[index].buyer == userAddressConverted,
            "user is not the buyer"
        );

        require(
            allRequests[index].accepted == false,
            "request is already accepted"
        );

        // Refund the buyer
        payable(userAddressConverted).transfer(allRequests[index].payment);

        uint256 lastIndex = allRequests.length - 1;
        allRequests[index] = allRequests[lastIndex];
        allRequests.pop();

        uint256 lastIndexPrivate = allRequestsPrivate.length - 1;
        allRequestsPrivate[index] = allRequestsPrivate[lastIndexPrivate];
        allRequestsPrivate.pop();

        // Iterate through the requests[msg.sender] array to find and remove the request associated with the msg.sender
        for (uint256 i = 0; i < requests[userAddressConverted].length; i++) {
            // If the request in the requests[msg.sender] array matches the given index in allRequests, remove it
            if (
                allRequestsPrivate[i].buyer == userAddressConverted &&
                requests[userAddressConverted][i].payment ==
                allRequests[index].payment &&
                requests[userAddressConverted][i].stake ==
                allRequests[index].stake &&
                requests[userAddressConverted][i].postAddress ==
                allRequests[index].postAddress &&
                requests[userAddressConverted][i].postCount ==
                allRequests[index].postCount
            ) {
                uint256 lastIndexSender = requests[userAddressConverted]
                    .length - 1;
                requests[userAddressConverted][i] = requests[
                    userAddressConverted
                ][lastIndexSender];
                requests[userAddressConverted].pop();
                break;
            }
        }
    }

    receive() external payable {}
}
