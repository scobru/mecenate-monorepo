// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../library/Structures.sol";
import "./Data.sol";
import "./Events.sol";

abstract contract Submission is Data, Events {
    function submitHash(
        bytes memory encryptedKey,
        bytes memory sismoConnectResponse
    ) public virtual {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            post.postdata.settings.status == Structures.PostStatus.Accepted ||
                post.postdata.settings.status ==
                Structures.PostStatus.Submitted,
            "Post is not Accepted or Submitted"
        );

        require(
            IMecenateUsers(usersModuleContract).checkifUserExist(vaultId),
            "User does not exist"
        );

        require(
            post.creator.wallet == userAddressConverted,
            "You are not the creator"
        );

        post.postdata.data.encryptedKey = encryptedKey;
        post.postdata.settings.status = Structures.PostStatus.Submitted;
        post.postdata.settings.endTimeStamp =
            block.timestamp +
            post.postdata.settings.duration;

        emit Valid(post);
    }

    function revealData(
        bytes memory decryptedData,
        bytes memory sismoConnectResponse
    ) public virtual returns (bytes memory) {
        (
            uint256 vaultId,
            bytes memory vaultIdBytes,
            uint256 userAddress,
            address userAddressConverted
        ) = sismoVerify(sismoConnectResponse);

        require(
            post.postdata.settings.status == Structures.PostStatus.Finalized,
            "Post is not Finalized"
        );
        require(
            post.postdata.settings.seller == userAddressConverted,
            "You are not the buyer"
        );
        post.postdata.data.decryptedData = decryptedData;
        post.postdata.settings.status = Structures.PostStatus.Revealed;
        return post.postdata.data.decryptedData;
    }
}
