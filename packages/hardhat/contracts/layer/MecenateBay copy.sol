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

    struct Market {
        address token0,
        address token1,
        uint256 amount0,
                uint256 amount0,
    

    }


    Structures.BayRequest[] public allRequests;

    Structures.BayRequestPrivate[] public allRequestsPrivate;

    address public usersMouduleContract;

    address public verifierContract;

    address public vaultContract;

    mapping(bytes32 => Structures.BayRequest[]) public requests;

    uint256 public contractCounter;

    mapping(uint256 => bytes) private sismoResponseMapping;

    event RequestCreated(
        bytes32 indexed user,
        Structures.BayRequest,
        uint256 indexed index
    );

    event RequestAccepted(
        bytes32 indexed user,
        Structures.BayRequest,
        uint256 indexed index
    );

    constructor(
        address _usersMouduleContract,
        address _verifierContract,
        address _vaultContract
    ) {
        usersMouduleContract = _usersMouduleContract;
        verifierContract = _verifierContract;
        vaultContract = _vaultContract;
    }

    function createRequest(
        Structures.BayRequest memory request,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) public payable returns (Structures.BayRequest memory) {
        // verify user
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            IMecenateUsers(usersMouduleContract).checkifUserExist(
                keccak256(vaultId)
            ),
            "user does not exist"
        );

        require(request.stake > 0, "BAY:stake is not enough");

        require(request.payment == msg.value, "BAY:payment is not enough");

        require(request.payment > 0, "BAY:payment is not enough");

        requests[encryptedVaultId].push(request);

        allRequests.push(request);

        allRequestsPrivate.push(
            Structures.BayRequestPrivate({
                vaultIdSeller: "0x00",
                sellerResponse: "0x00",
                vaultIdBuyer: vaultId,
                buyerResponse: sismoConnectResponse
            })
        );

        contractCounter++;

        emit RequestCreated(encryptedVaultId, request, allRequests.length - 1);
    }

    function acceptRequest(
        uint256 index,
        address _feed,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) public {
        // verify user
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

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
                encryptedVaultId
            ),
            "BAY:user does not exist"
        );

        allRequestsPrivate.push(
            Structures.BayRequestPrivate({
                vaultIdSeller: vaultId,
                sellerResponse: sismoConnectResponse,
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
            allRequestsPrivate[index].buyerResponse,
            _to
        );

        allRequests[index].accepted = true;

        allRequests[index].postAddress = _feed;

        allRequests[index].postCount = feed.postCount;

        emit RequestAccepted(encryptedVaultId, allRequests[index], index);
    }

    function sismoVerify(
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) internal view returns (bytes memory, uint256, uint256) {
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );
        return (vaultId, twitterId, telegramId);
    }

    function getRequests()
        public
        view
        returns (Structures.BayRequest[] memory)
    {
        return allRequests;
    }

    function getRequestForAddress(
        bytes32 _user
    ) public view returns (Structures.BayRequest[] memory) {
        return requests[_user];
    }

    // removéthe request and refund the user delete the array and move the last element to the index
    function removeRequest(
        uint256 index,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) public {
        // verify user
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(
            encryptedVaultId ==
                keccak256(allRequestsPrivate[index].vaultIdBuyer),
            "BAY:you are not the buyer"
        );

        require(
            allRequests[index].accepted == false,
            "BAY:request is already accepted"
        );

        Structures.BayRequest memory requestToRemove = allRequests[index];

        //  send eth with data to the vaultctx
        (bool _result, ) = vaultContract.call{value: requestToRemove.payment}(
            sismoConnectResponse
        );

        require(_result, "BAY:Vault call failed");

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
        for (uint256 i = 0; i < requests[encryptedVaultId].length; i++) {
            if (
                requests[encryptedVaultId][i].payment ==
                requestToRemove.payment &&
                requests[encryptedVaultId][i].stake == requestToRemove.stake &&
                requests[encryptedVaultId][i].postAddress ==
                requestToRemove.postAddress &&
                requests[encryptedVaultId][i].postCount ==
                requestToRemove.postCount
            ) {
                uint256 lastIndexSender = requests[encryptedVaultId].length - 1;
                if (i < lastIndexSender) {
                    requests[encryptedVaultId][i] = requests[encryptedVaultId][
                        lastIndexSender
                    ];
                }
                requests[encryptedVaultId].pop();
                break;
            }
        }
    }

    function changeVault(address _vault) external onlyOwner {
        vaultContract = _vault;
    }

    function changeVerifier(address _verifier) external onlyOwner {
        verifierContract = _verifier;
    }

    function changeUsersModule(address _usersModule) external onlyOwner {
        usersMouduleContract = _usersModule;
    }

    receive() external payable {}
}
