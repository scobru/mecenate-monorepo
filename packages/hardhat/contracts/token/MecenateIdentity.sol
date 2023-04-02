// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import {IMecenateTreasury} from "../interfaces/IMecenateTreasury.sol";

contract MecenateIdentity is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    address public treasuryContract;

    Counters.Counter private _tokenIds;

    uint256 public identityCreationFee;

    constructor(address _treasury) ERC721("Mecenate Creator Identity", "MCI") {
        treasuryContract = _treasury;
        identityCreationFee = IMecenateTreasury(treasuryContract).fixedFee();
    }

    // Create an identity struct
    struct IdentityData {
        string name;
        string image;
        string description;
        address owner;
    }

    // Create a mapping of identities
    mapping(uint256 => IdentityData) public identities;

    mapping(address => uint256) public identityByAddress;

    function mint(IdentityData memory id) public payable {
        require(msg.value == identityCreationFee, "Incorrect payment amount");
        require(balanceOf(msg.sender) == 0, "You already have an identity");

        payable(treasuryContract).transfer(msg.value);
        emit PaymentReceived(msg.sender, msg.value);
        _tokenIds.increment();
        uint256 newIdentityId = _tokenIds.current();
        identityByAddress[msg.sender] = newIdentityId;
        _safeMint(msg.sender, newIdentityId);
        _setTokenURI(newIdentityId, id.image);
        identities[newIdentityId] = id;
        emit IdentityCreated(msg.sender, newIdentityId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name":',
            '"',
            identities[tokenId].name,
            '",',
            '"description":',
            '"',
            identities[tokenId].description,
            '",',
            '"image":',
            '"',
            identities[tokenId].image,
            '"',
            "}"
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    function getOwnerById(uint256 tokenId) public view returns (address) {
        return identities[tokenId].owner;
    }

    function changeImage(uint256 tokenId, string memory newImage) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "You are not the owner of this identity"
        );
        _setTokenURI(tokenId, newImage);
    }

    function changeDescription(
        uint256 tokenId,
        string memory newDescription
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "You are not the owner of this identity"
        );
        identities[tokenId].description = newDescription;
    }

    function changeName(uint256 tokenId, string memory newName) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "You are not the owner of this identity"
        );
        identities[tokenId].name = newName;
    }

    function setIdentityCreationFee(uint256 newFee) public onlyOwner {
        identityCreationFee = newFee;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        require(
            from == address(0) || to == address(0),
            "Transfers are not allowed"
        );
    }

    function _burn(uint256 tokenId) internal virtual override {
        revert("Burn are not allowed");
    }

    function changeTreasury(address _treasury) public onlyOwner {
        treasuryContract = _treasury;
    }

    function getTotalIdentities() public view returns (uint256) {
        return _tokenIds.current();
    }

    event IdentityCreated(address indexed owner, uint256 indexed);
    event PaymentReceived(address payer, uint256 amount);
}
