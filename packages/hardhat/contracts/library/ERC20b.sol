/// erc20.sol -- API for the ERC20 token standard

// See <https://github.com/ethereum/EIPs/issues/20>.

// This file likely does not meet the threshold of originality
// required for copyright to apply.  As a result, this is free and
// unencumbered software belonging to the public domain.

pragma solidity 0.8.19;

contract ERC20Events {
    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
}

abstract contract ERC20b is ERC20Events {
    function totalSupply() public view virtual returns (uint);

    function balanceOf(address guy) public view virtual returns (uint);

    function allowance(
        address src,
        address guy
    ) public view virtual returns (uint);

    function approve(address guy, uint wad) public virtual returns (bool);

    function transfer(address dst, uint wad) public virtual returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint wad
    ) public virtual returns (bool);
}
