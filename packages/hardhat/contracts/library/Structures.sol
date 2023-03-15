pragma solidity 0.8.19;

library Structures {
  enum PostStatus {
    Waiting,
    Proposed,
    Accepted,
    Submitted,
    Finalized,
    Punished,
    Revealed
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
}
