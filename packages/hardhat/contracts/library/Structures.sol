pragma solidity 0.8.19;

library Structures {
    enum PostStatus {
        Waiting,
        Proposed,
        Accepted,
        Submitted,
        Finalized,
        Punished,
        Revealed,
        Renounced
    }

    enum PostType {
        Text,
        Image,
        Video,
        Audio,
        File
    }

    enum PostDuration {
        OneDay,
        ThreeDays,
        OneWeek,
        TwoWeeks,
        OneMonth
    }

    struct Post {
        User creator;
        PostData postdata;
    }

    struct PostData {
        PostSettings settings;
        PostEscrow escrow;
        PostEncryptedData data;
    }

    struct PostEncryptedData {
        bytes encryptedData;
        bytes encryptedKey;
        bytes decryptedData;
    }

    struct PostSettings {
        PostStatus status;
        PostType postType;
        address buyer;
        bytes buyerPubKey;
        address seller;
        uint256 creationTimeStamp;
        uint256 endTimeStamp;
        uint256 duration;
    }

    struct PostEscrow {
        uint256 stake;
        uint256 payment;
        uint256 punishment;
        uint256 buyerPunishment;
    }

    struct User {
        uint256 mecenateID;
        address wallet;
        bytes publicKey;
    }

    struct UserCentral {
        uint256 mecenateID;
        address wallet;
        bytes publicKey;
        bytes secretKey;
    }

    struct Feed {
        address contractAddress;
        address operator;
        address buyer;
        address seller;
        uint256 sellerStake;
        uint256 buyerStake;
        uint256 totalStake;
        uint256 postCount;
        uint256 buyerPayment;
    }

    struct BayRequest {
        bytes32 request;
        address buyer;
        address seller;
        uint256 payment;
        uint256 stake;
        address postAddress;
        bool accepted;
        uint256 postCount;
    }
}
