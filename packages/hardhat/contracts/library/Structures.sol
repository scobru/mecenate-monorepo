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
        uint256 creationTimeStamp;
        uint256 endTimeStamp;
        uint256 duration;
    }

    struct postSettingPrivate {
        address seller;
        bytes vaultIdSeller;
        address buyer;
        bytes vaultIdBuyer;
    }

    struct PostEscrow {
        uint256 stake;
        uint256 payment;
        uint256 punishment;
        uint256 buyerPunishment;
    }

    struct User {
        bytes32 vaultId;
    }

    struct Feed {
        address contractAddress;
        bytes32 operator;
        uint256 sellerStake;
        uint256 buyerStake;
        uint256 totalStake;
        uint256 postCount;
        uint256 buyerPayment;
    }

    struct BayRequest {
        bytes32 request;
        uint256 payment;
        uint256 stake;
        address postAddress;
        bool accepted;
        uint256 postCount;
    }

    struct BayRequestPrivate {
        address seller;
        bytes vaultIdSeller;
        address buyer;
        bytes vaultIdBuyer;
    }
}
