// Sources flattened with hardhat v2.12.7 https://hardhat.org

// File @openzeppelin/contracts/utils/Context.sol@v4.8.1

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.8.1

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File contracts/library/Structures.sol

pragma solidity 0.8.19;

library Structures {
  enum PostStatus {
    Proposed,
    Accepted,
    Submitted,
    Finalized,
    Punished
  }

  enum PostType {
    Limited,
    Infinite
  }

  struct Post {
    uint id;
    address creator;
    string metadata;
    uint256 stake;
    uint256 payment;
    address seller;
    address buyer;
    bytes encryptedHash;
    uint256 creationTimeStamp;
    uint256 endTimeStamp;
    uint256 duration;
    PostStatus status;
    PostType postType;
  }

  function createPost(
    uint256 id,
    address creator,
    string memory metadata,
    uint256 stake,
    uint256 payment,
    address seller,
    address buyer,
    bytes memory encryptedHash,
    uint256 creationTimeStamp,
    uint256 endTimeStamp,
    uint256 duration,
    PostStatus status,
    PostType postType
  ) internal pure returns (Post memory) {
    return
      Post({
        id: id,
        creator: creator,
        metadata: metadata,
        stake: stake,
        payment: payment,
        seller: seller,
        buyer: buyer,
        encryptedHash: encryptedHash,
        creationTimeStamp: creationTimeStamp,
        endTimeStamp: endTimeStamp,
        duration: duration,
        status: status,
        postType: postType
      });
  }
}


// File contracts/modules/Data.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
abstract contract Data {
  uint256 public numPosts;
  uint256 public constant punishmentRatio = 100000000000000000;
  mapping(uint256 => Structures.Post) public posts;
}


// File contracts/modules/Events.sol

pragma solidity 0.8.19;
abstract contract Events {
  event Created(Structures.Post post);
  event Accepted(Structures.Post post);
  event Valid(Structures.Post post);
  event Finalized(Structures.Post post);
}


// File contracts/modules/Acceptance.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
abstract contract Acceptance is Data, Events {
  function acceptPost(uint256 postId) public payable virtual {
    require(posts[postId].status == Structures.PostStatus.Proposed, "Post is not proposed");
    posts[postId].buyer = msg.sender;
    posts[postId].payment = msg.value;
    posts[postId].status = Structures.PostStatus.Accepted;
    emit Accepted(posts[postId]);
  }
}


// File contracts/modules/Creation.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
abstract contract Creation is Data, Events {
  function submitPost(Structures.Post memory _post) public payable {
    numPosts++;
    require(msg.value == _post.stake, "Incorrect stake amount");
    require(msg.sender == _post.creator, "You are not the creator");
    if (_post.duration == 0) {
      posts[numPosts].status = Structures.PostStatus.Submitted;
      posts[numPosts].postType = Structures.PostType.Infinite;
      posts[numPosts] = createInfinitePost(_post, numPosts);
      emit Created(posts[numPosts]);
    } else {
      posts[numPosts] = createLimitedPost(_post, numPosts);
      emit Created(posts[numPosts]);
    }
  }

  function createInfinitePost(
    Structures.Post memory _post,
    uint256 _id
  ) internal virtual returns (Structures.Post memory) {
    return
      Structures.Post({
        id: _id,
        creator: _post.creator,
        metadata: _post.metadata,
        stake: _post.stake,
        payment: 0,
        seller: _post.creator,
        buyer: address(0),
        encryptedHash: "0x0",
        creationTimeStamp: block.timestamp,
        endTimeStamp: 0,
        duration: 0,
        status: _post.status,
        postType: _post.postType
      });
  }

  function createLimitedPost(
    Structures.Post memory _post,
    uint256 _id
  ) internal virtual returns (Structures.Post memory) {
    require(_post.duration > 0, "Duration should be greater than 0");
    uint256 endTimeStamp = block.timestamp + _post.duration;
    return
      Structures.Post({
        id: _id,
        creator: _post.creator,
        metadata: _post.metadata,
        stake: _post.stake,
        payment: 0,
        seller: _post.creator,
        buyer: address(0),
        encryptedHash: "0x0",
        creationTimeStamp: block.timestamp,
        endTimeStamp: _post.endTimeStamp,
        duration: _post.duration,
        status: _post.status,
        postType: _post.postType
      });
  }
}


// File contracts/modules/Finalization.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
abstract contract Finalization is Data, Events {
  function finalizePost(uint256 postId, bool valid, uint256 punishment) public virtual returns (bytes memory) {
    require(punishment <= posts[postId].stake, "Punishment is too high");
    require(posts[postId].status == Structures.PostStatus.Submitted, "Post is not submitted");
    require(posts[postId].buyer == msg.sender, "You are not the creator");
    if (posts[postId].endTimeStamp < block.timestamp && valid == false) {
      valid = true;
      posts[postId].status = Structures.PostStatus.Finalized;
      payable(posts[postId].seller).transfer(posts[postId].payment);
      payable(posts[postId].seller).transfer(posts[postId].stake);
    } else if (valid) {
      posts[postId].status = Structures.PostStatus.Finalized;
      payable(posts[postId].seller).transfer(posts[postId].payment);
      payable(posts[postId].seller).transfer(posts[postId].stake);
      emit Valid(posts[postId]);
    } else if (!valid) {
      posts[postId].status = Structures.PostStatus.Punished;
      uint256 buyerPunishment = (punishment * punishmentRatio) / 1e18;
      payable(posts[postId].buyer).transfer(posts[postId].payment - buyerPunishment);
      payable(posts[postId].buyer).transfer(posts[postId].stake - punishment);
      // burn punishment and stake to addres┼ø 0
      payable(address(0)).transfer(buyerPunishment);
      payable(address(0)).transfer(punishment);
      emit Valid(posts[postId]);
    }
  }
}


// File contracts/modules/Submission.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
abstract contract Submission is Data, Events {
  function submitHash(uint256 postId, bytes memory encryptedHash) public virtual {
    require(posts[postId].status == Structures.PostStatus.Accepted, "Post is not accepted");
    require(posts[postId].creator == msg.sender, "You are not the creator");
    posts[postId].encryptedHash = encryptedHash;
    posts[postId].status = Structures.PostStatus.Submitted;
    emit Valid(posts[numPosts]);
  }

  function revealData(uint256 postId) public view virtual returns (bytes memory) {
    require(posts[postId].status == Structures.PostStatus.Submitted, "Post is not submitted");
    require(posts[postId].buyer == msg.sender, "You are not the buyer");
    return posts[postId].encryptedHash;
  }
}


// File contracts/Feed.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
contract Feed is Ownable, Data, Creation, Acceptance, Submission, Finalization {
  using Structures for Structures.Post;

  constructor() {}
}
