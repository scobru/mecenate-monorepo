// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";
import "./Staking.sol";

abstract contract Creation is Data, Events, Staking {
    function createPost(
        bytes memory encryptedHash,
        Structures.PostType postType,
        Structures.PostDuration postDuration,
        address buyer,
        uint256 payment,
        bytes memory sismoConnectResponse
    ) external payable returns (Structures.Post memory) {
        SismoConnectVerifiedResult memory result = verify({
            responseBytes: sismoConnectResponse,
            // we want users to prove that they own a Sismo Vault
            // and that they are members of the group with the id 0x42c768bb8ae79e4c5c05d3b51a4ec74a
            // we are recreating the auth and claim requests made in the frontend to be sure that
            // the proofs provided in the response are valid with respect to this auth request
            auth: [
                buildAuth({authType: AuthType.VAULT}),
                buildAuth({authType: AuthType.EVM_ACCOUNT})
            ],
            //claim: buildClaim({groupId: 0x42c768bb8ae79e4c5c05d3b51a4ec74a},
            // we also want to check if the signed message provided in the response is the signature of the user's address
            signature: buildSignature({message: "I love Sismo!"})
        });

        // if the proofs and signed message are valid, we can take the userId from the verified result
        // in this case the userId is the vaultId (since we used AuthType.VAULT in the auth request)
        // it is the anonymous identifier of a user's vault for a specific app
        // --> vaultId = hash(userVaultSecret, appId)
        uint256 vaultId = SismoConnectHelper.getUserId(result, AuthType.VAULT);

        uint256 userAddress = SismoConnectHelper.getUserId(
            result,
            AuthType.EVM_ACCOUNT
        );

        address userAddressConverted = address(uint160(userAddress));

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(vaultId),
            "User does not exist"
        );

        if (post.postdata.escrow.stake == 0) {
            require(msg.value > 0, "Stake is required");
        }

        require(
            usersModuleContract != address(0),
            "Users module contract not set"
        );

        require(identityContract != address(0), "Identity contract not set");

        require(
            post.postdata.settings.status == Structures.PostStatus.Waiting ||
                post.postdata.settings.status ==
                Structures.PostStatus.Finalized ||
                post.postdata.settings.status ==
                Structures.PostStatus.Revealed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Punished ||
                post.postdata.settings.status ==
                Structures.PostStatus.Proposed ||
                post.postdata.settings.status ==
                Structures.PostStatus.Renounced,
            "Not Wating or Finalized or Revealed or Proposed"
        );

        uint256 stake = _addStake(userAddress, msg.value);

        uint256 duration;

        if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.OneDay
        ) {
            duration = 1 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.ThreeDays
        ) {
            duration = 3 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.OneWeek
        ) {
            duration = 7 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.TwoWeeks
        ) {
            duration = 14 days;
        } else if (
            Structures.PostDuration(postDuration) ==
            Structures.PostDuration.OneMonth
        ) {
            duration = 30 days;
        }

        Structures.User memory creator = Structures.User({vaultId: vaultId});

        Structures.PostData memory postdata = Structures.PostData({
            settings: Structures.PostSettings({
                postType: Structures.PostType(postType),
                status: Structures.PostStatus.Proposed,
                buyer: buyer,
                buyerPubKey: "0x00",
                seller: userAddress,
                creationTimeStamp: block.timestamp,
                endTimeStamp: 0,
                duration: duration
            }),
            escrow: Structures.PostEscrow({
                stake: stake,
                payment: payment,
                punishment: 0,
                buyerPunishment: 0
            }),
            data: Structures.PostEncryptedData({
                encryptedData: encryptedHash,
                encryptedKey: ZEROHASH,
                decryptedData: ZEROHASH
            })
        });

        Structures.Post memory _post = Structures.Post({
            creator: creator,
            postdata: postdata
        });

        post = _post;

        postCount++;

        emit Created(post);

        return Structures.Post({creator: creator, postdata: postdata});
    }
}
