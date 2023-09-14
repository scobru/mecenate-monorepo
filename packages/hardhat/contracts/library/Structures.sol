/**
 * @title Structures
 * @dev This library defines various data structures used in the Mecenate platform.
 */
pragma solidity 0.8.19;

library Structures {
    /**
     * @dev Enum representing the status of a post.
     */
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

    /**
     * @dev Enum representing the type of a post.
     */
    enum PostType {
        Text,
        Image,
        Video,
        Audio,
        File
    }

    /**
     * @dev Enum representing the duration of a post.
     */
    enum PostDuration {
        OneDay,
        ThreeDays,
        OneWeek,
        TwoWeeks,
        OneMonth
    }

    /**
     * @dev Struct representing a post on the Mecenate platform.
     */
    struct Post {
        User creator;
        PostData postdata;
    }

    /**
     * @dev Struct representing the data of a post on the Mecenate platform.
     */
    struct PostData {
        PostSettings settings;
        PostEscrow escrow;
        PostEncryptedData data;
    }

    /**
     * @dev Struct representing the encrypted data of a post on the Mecenate platform.
     */
    struct PostEncryptedData {
        bytes encryptedData;
        bytes encryptedKey;
        bytes decryptedData;
    }

    /**
     * @dev Struct representing the settings of a post on the Mecenate platform.
     */
    struct PostSettings {
        PostStatus status;
        PostType postType;
        uint256 creationTimeStamp;
        uint256 endTimeStamp;
        uint256 duration;
    }

    /**
     * @dev Struct representing the private settings of a post on the Mecenate platform.
     */
    struct postSettingPrivate {
        address seller;
        bytes vaultIdSeller;
        uint256 sellerTelegramId;
        address buyer;
        bytes vaultIdBuyer;
        uint256 buyerTelegramId;
    }

    /**
     * @dev Struct representing the escrow of a post on the Mecenate platform.
     */
    struct PostEscrow {
        uint256 stake;
        uint256 payment;
        uint256 punishment;
        uint256 penality;
    }

    /**
     * @dev Struct representing a user on the Mecenate platform.
     */
    struct User {
        bytes32 vaultId;
    }

    /**
     * @dev Struct representing a feed on the Mecenate platform.
     */
    struct Feed {
        address contractAddress;
        bytes32 operator;
        uint256 sellerStake;
        uint256 buyerStake;
        uint256 totalStake;
        uint256 postCount;
        uint256 buyerPayment;
    }

    /**
     * @dev Struct representing a bay request on the Mecenate platform.
     */
    struct BayRequest {
        bytes32 request;
        uint256 payment;
        uint256 stake;
        address postAddress;
        bool accepted;
        uint256 postCount;
    }

    /**
     * @dev Struct representing the private settings of a bay request on the Mecenate platform.
     */
    struct BayRequestPrivate {
        address seller;
        bytes vaultIdSeller;
        bytes sellerResponse;
        address buyer;
        bytes vaultIdBuyer;
        bytes buyerResponse;
    }
}
