// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../library/Structures.sol";
import "../interfaces/IMecenateFeed.sol";
import "../modules/FeedViewer.sol";

contract MecenateMarket is FeedViewer {
    Structures.MarketPost[] public posts;

    // Funzione per creare un nuovo post
    function createPost(address _feed, bytes memory _description) public {
        posts.push(
            Structures.MarketPost({
                feed: _feed,
                description: _description,
                tokenId: IMecenateFeed(_feed).getTokenId(),
                stake: IMecenateFeed(_feed).getStakeRequested(),
                payment: IMecenateFeed(_feed).getPaymentRequested(),
                postId: IMecenateFeed(_feed).getPostId()
            })
        );
    }

    function isActive(uint _postIndex) public view returns (bool) {
        bool result = posts[_postIndex].postId ==
            IMecenateFeed(posts[_postIndex].feed).getPostId();

        return result;
    }

    function getPost(
        uint _postIndex
    ) public view returns (address, bytes memory) {
        require(_postIndex < posts.length, "Post non esistente");
        return (posts[_postIndex].feed, posts[_postIndex].description);
    }

    function getPostCount() public view returns (uint) {
        return posts.length;
    }

    function getPosts() public view returns (Structures.MarketPost[] memory) {
        return posts;
    }
}
