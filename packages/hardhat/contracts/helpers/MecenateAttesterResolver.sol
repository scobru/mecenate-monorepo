// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {SchemaResolver} from "../helpers/eas/SchemaResolver.sol";
import {IEAS, Attestation} from "../helpers/eas/IEAS.sol";
import "../interfaces/IMecenateFeed.sol";

/**
 * @title A sample schema resolver that checks whether the attestation is from a specific attester.
 */
contract MecenateAttesterResolver is SchemaResolver {
    constructor(IEAS eas) SchemaResolver(eas) {}

    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal view override returns (bool) {
        (bool valid, address feed, bytes memory postBytes) = abi.decode(
            attestation.data,
            (bool, address, bytes)
        );

        // Check if the post is valid
        IMecenateFeed mecenateFeed = IMecenateFeed(feed);
        require(
            keccak256(mecenateFeed.getEncryptedPost()) == keccak256(postBytes),
            "ENCRYPTED POST DOES NOT MATCH"
        );

        // Check if the status is finalized
        require(
            mecenateFeed.getStatus() == Structures.PostStatus.Finalized,
            "POST NOT FINALIZED"
        );

        Structures.Post memory post = mecenateFeed.getPost();

        require(
            post.postdata.escrow.buyer == attestation.attester,
            "INVALID ATTESTER"
        );

        require(valid, "WRONG VALIDATION");

        return true;
    }

    function onRevoke(
        Attestation calldata /*attestation*/,
        uint256 /*value*/
    ) internal pure override returns (bool) {
        return true;
    }
}
