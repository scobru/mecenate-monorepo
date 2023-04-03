//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/interfaces/IERC4626.sol";

import "./customInterfaces/wmatic/WMATIC.sol";

contract LSDWrapper {
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(
        address indexed sender,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    address immutable lsd;
    address immutable wMatic;

    constructor(address _lsd, address _wMatic) {
        lsd = _lsd;
        wMatic = _wMatic;

        WMATIC(wMatic).approve(lsd, type(uint256).max);
    }

    function deposit(uint256 _assets, address _receiver, uint256 _limit) external returns (uint256 shares) {
        WMATIC(wMatic).transferFrom(msg.sender, address(this), _assets);

        uint256 _shares = IERC4626(lsd).deposit(_assets, _receiver);
        require(_shares >= _limit, "Slippage occured!");

        emit Deposit(msg.sender, _receiver, _assets, _shares);

        return _shares;
    }

    function mint(uint256 _shares, address _receiver, uint256 _limit) external returns (uint256 assets) {
        uint256 _assets = IERC4626(lsd).convertToAssets(_shares);
        WMATIC(wMatic).transferFrom(msg.sender, address(this), _assets);

        _assets = IERC4626(lsd).mint(_shares, _receiver);
        require(_assets <= _limit, "Slippage occured!");

        emit Deposit(msg.sender, _receiver, _assets, _shares);

        return _assets;
    }

    function withdraw(uint256 _assets, address _receiver, uint256 _limit) external returns (uint256 shares) {
        uint256 _shares = IERC4626(lsd).withdraw(_assets, _receiver, msg.sender);
        require(_shares <= _limit, "Slippage occured!");

        emit Withdraw(msg.sender, _receiver, msg.sender, _assets, _shares);

        return _shares;
    }

    function redeem(uint256 _shares, address _receiver, uint256 _limit) external returns (uint256 assets) {
        uint256 _assets = IERC4626(lsd).redeem(_shares, _receiver, msg.sender);
        require(_assets >= _limit, "Slippage occured!");

        emit Withdraw(msg.sender, _receiver, msg.sender, _assets, _shares);

        return _assets;
    }

    // GATEWAY FUNCTIONS

    function depositGateway(address _receiver, uint256 _limit) external payable returns (uint256 shares) {
        _wrap(msg.value);

        uint256 _shares = IERC4626(lsd).deposit(msg.value, _receiver);
        require(_shares >= _limit, "Slippage occured!");

        emit Deposit(msg.sender, _receiver, msg.value, _shares);

        return _shares;
    }

    function mintGateway(uint256 _shares, address _receiver, uint256 _limit) external payable returns (uint256 assets) {
        uint256 _assets = IERC4626(lsd).convertToAssets(_shares);
        require(_assets <= msg.value, "Please send the exact or more assets as per the shares required!");

        _wrap(_assets);
        _assets = IERC4626(lsd).mint(_shares, _receiver);
        require(_assets <= _limit, "Slippage occured!");
        payable(address(msg.sender)).transfer(msg.value - _assets);

        emit Deposit(msg.sender, _receiver, _assets, _shares);

        return _assets;
    }

    function withdrawGateway(uint256 _assets, address _receiver, uint256 _limit) external returns (uint256 shares) {
        uint256 _shares = IERC4626(lsd).convertToShares(_assets);
        require(IERC4626(lsd).balanceOf(msg.sender) >= _shares, "Not enough shares!");

        _shares = IERC4626(lsd).withdraw(_assets, address(this), msg.sender);
        require(_shares <= _limit, "Slippage occured!");
        _assets = WMATIC(wMatic).balanceOf(address(this));
        _unWrap(_assets);
        payable(address(msg.sender)).transfer(_assets);

        emit Withdraw(msg.sender, _receiver, msg.sender, _assets, _shares);

        return _shares;
    }

    function redeemGateway(uint256 _shares, address _receiver, uint256 _limit) external returns (uint256 assets) {
        require(IERC4626(lsd).balanceOf(msg.sender) >= _shares, "Not enough shares!");

        uint256 _assets = IERC4626(lsd).redeem(_shares, address(this), msg.sender);
        require(_assets >= _limit, "Slippage occured!");
        _unWrap(_assets);
        payable(address(msg.sender)).transfer(_assets);

        emit Withdraw(msg.sender, _receiver, msg.sender, _assets, _shares);

        return _assets;
    }

    function resetApprovals() public {
        WMATIC(wMatic).approve(lsd, type(uint256).max);
    }

    function _wrap(uint256 _assets) internal {
        WMATIC(wMatic).deposit{value: _assets}();
    }

    function _unWrap(uint256 _assets) internal {
        WMATIC(wMatic).withdraw(_assets);
    }

    receive() external payable {
        require(msg.sender == wMatic, "Transfer denied!");
    }
}
