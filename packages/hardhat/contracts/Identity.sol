// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Identity is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  using SafeMath for uint256;

  Counters.Counter private _tokenIds;
  uint256 public identityCreationFee;

  constructor(uint256 _creationFee) ERC721("Identity", "ID") {
    identityCreationFee = _creationFee;
  }

  // Create an identity struct
  struct IdentityData {
    string name;
    string image;
    string description;
  }

  // Create a mapping of identities
  mapping(uint256 => IdentityData) public identities;

  function mint(IdentityData memory id) public payable {
    require(msg.value == identityCreationFee, "Incorrect payment amount");
    payable(owner()).transfer(msg.value);
    emit PaymentReceived(msg.sender, msg.value);
    _tokenIds.increment();
    uint256 newIdentityId = _tokenIds.current();
    _safeMint(msg.sender, newIdentityId);
    _setTokenURI(newIdentityId, id.image);
    identities[newIdentityId] = id;
    emit IdentityCreated(msg.sender, newIdentityId);
  }

  function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
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
    return string(abi.encodePacked("data:application/json;base64,", Base64.encode(dataURI)));
  }

  function changeImage(uint256 tokenId, string memory newImage) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "You are not the owner of this identity");
    _setTokenURI(tokenId, newImage);
  }

  function changeDescription(uint256 tokenId, string memory newDescription) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "You are not the owner of this identity");
    identities[tokenId].description = newDescription;
  }

  function changeName(uint256 tokenId, string memory newName) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "You are not the owner of this identity");
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
    require(from == address(0) || to == address(0), "Transfers are not allowed");
  }

  function _burn(uint256 tokenId) internal virtual override {
    revert("Burn are not allowed");
  }

  event IdentityCreated(address indexed owner, uint256 indexed);
  event PaymentReceived(address payer, uint256 amount);
}
