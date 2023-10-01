/**
 * @title Structures
 * @dev This library defines various data structures used in the Mecenate platform.
 */
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
    enum Tokens {
        NaN,
        MUSE,
        DAI
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

    struct FeedSettings {
        uint256 punishmentRatio;
        uint256 postCount;
        address usersModuleContract;
        address factoryContract;
        address verifierContract;
        address vaultContract;
        address router;
        bytes encodedSymKey;
        bytes lastMessageForBuyer;
        bytes lastMessageForSeller;
        string version;
    }

    struct FactorySettings {
        address treasuryContract;
        address usersModuleContract;
        address verifierContract;
        address vaultContract;
        address museToken;
        address daiToken;
        address wethToken;
        address router;
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
        Tokens tokenId;
    }

    /**
     * @dev Struct representing the private settings of a post on the Mecenate platform.
     */
    struct PostSettingPrivate {
        bytes vaultIdSeller;
        uint256 sellerTwitterId;
        uint256 sellerTelegramId;
        bytes vaultIdBuyer;
        uint256 buyerTwitterId;
        uint256 buyerTelegramId;
    }

    /**
     * @dev Struct representing the escrow of a post on the Mecenate platform.
     */
    struct PostEscrow {
        uint256 stake;
        uint256 payment;
        uint256 punishment;
        uint256 penalty;
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
        uint256 paymentRequested;
        uint256 stakeRequested;
        PostStatus status;
        Tokens tokenId;
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
        Tokens tokenId;
    }

    /**
     * @dev Struct representing the private settings of a bay request on the Mecenate platform.
     */
    struct BayRequestPrivate {
        bytes vaultIdSeller;
        bytes sellerResponse;
        bytes vaultIdBuyer;
        bytes buyerResponse;
        address buyerTo;
        bytes32 buyerNonce;
    }
}
