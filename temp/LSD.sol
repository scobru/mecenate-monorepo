//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./customInterfaces/stader/IChildPool.sol";
import "./customInterfaces/aave/IPool.sol";
import "./customInterfaces/aave/IRewardsController.sol";
import "./customInterfaces/balancer/IVault.sol";
import "./customInterfaces/wmatic/WMATIC.sol";

contract LSD is ERC20, IERC4626, Ownable {
    event LeverageStakingYieldToggle(bool toggleStatus);
    event BorrowPercentageChange(uint8 updatedPercentage);

    IChildPool immutable stader;
    AggregatorV3Interface immutable priceFeedMatic;
    AggregatorV3Interface immutable priceFeedMaticX;

    address immutable aave;
    address immutable aaveRewards;
    address immutable balancer;
    address immutable aPolMATICX;
    address immutable wMatic;
    address immutable maticX;
    bytes32 immutable balancerPool;

    bool public leverageStakingYieldToggle;
    uint8 public borrowPercentage;
    uint256 public totalInvested;
    uint256 public deployTime;

    constructor(
        string memory _name,
        string memory _symbol,
        bool _leverageStakingYieldToggle,
        uint8 _borrowPercentage,
        address _stader,
        address _aave,
        address _aaveRewards,
        address _balancer,
        address _priceFeedMatic,
        address _priceFeedMaticX,
        address _wMatic,
        address _maticX,
        address _aPolMATICX,
        bytes32 _balancerPool
    ) payable ERC20(_name, _symbol) {
        require(msg.value == 1 ether, "Send exactly 1 matic during deployement!");

        leverageStakingYieldToggle = _leverageStakingYieldToggle;
        borrowPercentage = _borrowPercentage;

        stader = IChildPool(_stader);
        priceFeedMatic = AggregatorV3Interface(_priceFeedMatic);
        priceFeedMaticX = AggregatorV3Interface(_priceFeedMaticX);

        aave = _aave;
        aaveRewards = _aaveRewards;
        balancer = _balancer;
        aPolMATICX = _aPolMATICX;
        wMatic = _wMatic;
        maticX = _maticX;
        balancerPool = _balancerPool;
        deployTime = block.timestamp * (10 ** 18);

        IERC20(_maticX).approve(_aave, type(uint256).max);
        IERC20(_maticX).approve(_balancer, type(uint256).max);
        WMATIC(_wMatic).approve(_aave, type(uint256).max);
        IERC20(_aPolMATICX).approve(_aave, type(uint256).max);

        uint256 _assets = 10 ** 18;
        _wrap(_assets);
        uint256 _shares = _convertToShares(_assets);
        _deposit(_assets);
        _mintLSD(_shares, _assets, msg.sender);
        emit Deposit(msg.sender, msg.sender, _assets, _shares);
    }

    // ERC4626 FUNCTIONS

    function asset() external view returns (address assetTokenAddress) {
        return wMatic;
    }

    function totalAssets() public view returns (uint256 totalManagedAssets) {
        (uint256 _supplied, uint256 _borrowed, , , , ) = getAaveUserAccountData();
        (, int256 _priceWMatic, , , ) = getPriceFeedWMatic();
        uint256 totalAssetsUSD = _supplied - _borrowed;
        return (totalAssetsUSD * (10 ** 18)) / uint256(_priceWMatic);
    }

    function convertToShares(uint256 _assets) external view returns (uint256 shares) {
        return _convertToShares(_assets);
    }

    function convertToAssets(uint256 _shares) external view returns (uint256 assets) {
        return _convertToAssets(_shares);
    }

    function maxDeposit(address _receiver) external view returns (uint256 maxAssets) {
        return type(uint256).max;
    }

    function previewDeposit(uint256 _assets) external view returns (uint256 shares) {
        return _convertToShares(_assets);
    }

    function deposit(uint256 _assets, address _receiver) external returns (uint256 shares) {
        WMATIC(wMatic).transferFrom(msg.sender, address(this), _assets);
        uint256 _shares = _convertToShares(_assets);
        _deposit(_assets);
        _mintLSD(_shares, _assets, _receiver);
        emit Deposit(msg.sender, _receiver, _assets, _shares);
        return _shares;
    }

    function maxMint(address _receiver) external view returns (uint256 maxShares) {
        return type(uint256).max;
    }

    function previewMint(uint256 _shares) external view returns (uint256 assets) {
        return _convertToAssets(_shares);
    }

    function mint(uint256 _shares, address _receiver) external returns (uint256 assets) {
        uint256 _assets = _convertToAssets(_shares);
        WMATIC(wMatic).transferFrom(msg.sender, address(this), _assets);
        _deposit(_assets);
        _mintLSD(_shares, _assets, _receiver);
        emit Deposit(msg.sender, _receiver, _assets, _shares);
        return _assets;
    }

    function maxWithdraw(address _owner) external view returns (uint256 maxAssets) {
        return _convertToAssets(balanceOf(_owner));
    }

    function previewWithdraw(uint256 _assets) external view returns (uint256 shares) {
        return _convertToAssets(_assets);
    }

    function withdraw(uint256 _assets, address _receiver, address _owner) external returns (uint256 shares) {
        uint256 _shares = _convertToShares(_assets);

        require(balanceOf(_owner) >= _shares, "Not enough shares!");
        if (msg.sender != _owner) {
            require(allowance(_owner, msg.sender) >= _shares, "Not enough allowance!");
            _spendAllowance(_owner, msg.sender, _shares);
        }

        (uint256 _supplied, , , , , ) = getAaveUserAccountData();
        uint256 _withdrawAssetsUSD = (_shares * _supplied) / totalSupply();
        _withdraw(_withdrawAssetsUSD);

        uint256 _investedAssets = (_shares * totalInvested) / totalSupply();
        _burnLSD(_shares, _investedAssets, _owner);

        _assets = WMATIC(wMatic).balanceOf(address(this));
        WMATIC(wMatic).transfer(_receiver, _assets);

        emit Withdraw(msg.sender, _receiver, _owner, _assets, _shares);

        return _shares;
    }

    function maxRedeem(address _owner) external view returns (uint256 maxShares) {
        return balanceOf(_owner);
    }

    function previewRedeem(uint256 _shares) external view returns (uint256 assets) {
        return _convertToAssets(_shares);
    }

    function redeem(uint256 _shares, address _receiver, address _owner) external returns (uint256 assets) {
        require(balanceOf(_owner) >= _shares, "Not enough shares!");
        if (msg.sender != _owner) {
            require(allowance(_owner, msg.sender) >= _shares, "Not enough allowance!");
            _spendAllowance(_owner, msg.sender, _shares);
        }

        (uint256 _supplied, , , , , ) = getAaveUserAccountData();
        uint256 _withdrawAssetsUSD = (_shares * _supplied) / totalSupply();
        _withdraw(_withdrawAssetsUSD);

        uint256 _investedAssets = (_shares * totalInvested) / totalSupply();
        _burnLSD(_shares, _investedAssets, _owner);

        uint256 _assets = WMATIC(wMatic).balanceOf(address(this));
        WMATIC(wMatic).transfer(_receiver, _assets);

        emit Withdraw(msg.sender, _receiver, _owner, _assets, _shares);

        return _assets;
    }

    // EXTRA FUNCTIONALITIES / STATS

    function resetApprovals() public {
        IERC20(maticX).approve(aave, type(uint256).max);
        IERC20(maticX).approve(balancer, type(uint256).max);
        WMATIC(wMatic).approve(aave, type(uint256).max);
        IERC20(aPolMATICX).approve(aave, type(uint256).max);
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

    function getPriceFeedWMatic()
        public
        view
        returns (uint80 roundID, int256 price, uint256 startedAt, uint256 timeStamp, uint80 answeredInRound)
    {
        (
            uint80 _roundID,
            int256 _price,
            uint256 _startedAt,
            uint256 _timeStamp,
            uint80 _answeredInRound
        ) = priceFeedMatic.latestRoundData();
        return (_roundID, _price, _startedAt, _timeStamp, _answeredInRound);
    }

    function getPriceFeedMaticX()
        public
        view
        returns (uint80 roundID, int256 price, uint256 startedAt, uint256 timeStamp, uint80 answeredInRound)
    {
        (
            uint80 _roundID,
            int256 _price,
            uint256 _startedAt,
            uint256 _timeStamp,
            uint80 _answeredInRound
        ) = priceFeedMaticX.latestRoundData();
        return (_roundID, _price, _startedAt, _timeStamp, _answeredInRound);
    }

    function getAaveUserAccountData()
        public
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        (
            uint256 _totalCollateralBase,
            uint256 _totalDebtBase,
            uint256 _availableBorrowsBase,
            uint256 _currentLiquidationThreshold,
            uint256 _ltv,
            uint256 _healthFactor
        ) = IPool(aave).getUserAccountData(address(this));
        return (
            _totalCollateralBase,
            _totalDebtBase,
            _availableBorrowsBase,
            _currentLiquidationThreshold,
            _ltv,
            _healthFactor
        );
    }

    function enableLeverageStakingYield() public onlyOwner {
        require(leverageStakingYieldToggle == false, "Leverage staking is already enabled!");
        leverageStakingYieldToggle = true;

        // Leverage Staking
        (uint256 _supplied, uint256 _borrowed, , , , ) = getAaveUserAccountData();
        uint256 _toBeBorrowedUSD = (_supplied * borrowPercentage) / 100;
        if (_toBeBorrowedUSD > _borrowed) {
            _toBeBorrowedUSD -= _borrowed;
            (, int256 _priceWMatic, , , ) = getPriceFeedWMatic();
            uint256 _toBeBorrowed = (_toBeBorrowedUSD * (10 ** 18)) / uint256(_priceWMatic);
            IPool(aave).borrow(wMatic, _toBeBorrowed, 2, 0, address(this));
            _unWrap(_toBeBorrowed);
            stader.swapMaticForMaticXViaInstantPool{value: _toBeBorrowed}();
            IPool(aave).supply(maticX, IERC20(maticX).balanceOf(address(this)), address(this), 0);
        }

        emit LeverageStakingYieldToggle(true);
    }

    function disbaleLeverageStakingYield() public onlyOwner {
        require(leverageStakingYieldToggle == true, "Leverage staking is already disabled!");
        leverageStakingYieldToggle = false;

        // Settling Leverage Staking
        (, int256 _priceWMatic, , , ) = getPriceFeedWMatic();
        (, int256 _priceMaticX, , , ) = getPriceFeedMaticX();
        (, uint256 _borrowed, , , , ) = getAaveUserAccountData();

        uint256 _repayPercentageSlippageUSD = _borrowed + ((_borrowed * 2) / 100);
        uint256 _initialWithdrawMaticX = (_repayPercentageSlippageUSD * (10 ** 18)) / uint256(_priceMaticX);
        uint256 _initialWithdrawnMaticX = IPool(aave).withdraw(maticX, _initialWithdrawMaticX, address(this));
        uint256 _initialLimit = (_initialWithdrawnMaticX * 995) / 1000;
        IVault(balancer).swap(
            IVault.SingleSwap(
                balancerPool,
                IVault.SwapKind(0),
                IAsset(maticX),
                IAsset(wMatic),
                _initialWithdrawnMaticX,
                bytes("0")
            ),
            IVault.FundManagement(address(this), false, payable(address(this)), false),
            _initialLimit,
            block.timestamp + 4000
        );

        uint256 _repayWMatic = (_borrowed * (10 ** 18)) / uint256(_priceWMatic);
        IPool(aave).repay(wMatic, _repayWMatic, 2, address(this));

        // Liquid Staking the extra withdrawn maticx
        uint256 _extraWMatic = WMATIC(wMatic).balanceOf(address(this));
        _unWrap(_extraWMatic);
        stader.swapMaticForMaticXViaInstantPool{value: _extraWMatic}();
        IPool(aave).supply(maticX, IERC20(maticX).balanceOf(address(this)), address(this), 0);

        emit LeverageStakingYieldToggle(false);
    }

    function setBorrowPercentage(uint8 _borrowPercentage) external onlyOwner {
        if (leverageStakingYieldToggle) {
            disbaleLeverageStakingYield();
            borrowPercentage = _borrowPercentage;
            enableLeverageStakingYield();
        } else {
            borrowPercentage = _borrowPercentage;
        }

        emit BorrowPercentageChange(_borrowPercentage);
    }

    function claimAaveRewards(address[] calldata _assets, address _to) external onlyOwner {
        IRewardsController(aaveRewards).claimAllRewards(_assets, _to);
    }

    // INTERNAL FUNCTIONS

    function _convertToShares(uint256 _assets) internal view returns (uint256 shares) {
        if (totalSupply() == 0) {
            return _assets;
        }
        return (_assets * totalSupply()) / totalAssets();
    }

    function _convertToAssets(uint256 _shares) internal view returns (uint256 assets) {
        if (totalSupply() == 0) {
            return _shares;
        }
        return (_shares * totalAssets()) / totalSupply();
    }

    function _deposit(uint256 _assets) internal {
        // Liquid Staking
        _unWrap(_assets);
        stader.swapMaticForMaticXViaInstantPool{value: _assets}();
        IPool(aave).supply(maticX, IERC20(maticX).balanceOf(address(this)), address(this), 0);

        // Leverage Staking
        if (leverageStakingYieldToggle) {
            (uint256 _supplied, uint256 _borrowed, , , , ) = getAaveUserAccountData();
            uint256 _toBeBorrowedUSD = (_supplied * borrowPercentage) / 100;
            if (_toBeBorrowedUSD > _borrowed) {
                _toBeBorrowedUSD -= _borrowed;
                (, int256 _priceWMatic, , , ) = getPriceFeedWMatic();
                uint256 _toBeBorrowed = (_toBeBorrowedUSD * (10 ** 18)) / uint256(_priceWMatic);
                IPool(aave).borrow(wMatic, _toBeBorrowed, 2, 0, address(this));
                _unWrap(_toBeBorrowed);
                stader.swapMaticForMaticXViaInstantPool{value: _toBeBorrowed}();
                IPool(aave).supply(maticX, IERC20(maticX).balanceOf(address(this)), address(this), 0);
            }
        }
    }

    function _mintLSD(uint256 _shares, uint256 _assets, address _receiver) internal {
        _mint(_receiver, _shares);
        totalInvested += _assets;
    }

    function _withdraw(uint256 _assetsUSD) internal {
        (, int256 _priceWMatic, , , ) = getPriceFeedWMatic();
        (, int256 _priceMaticX, , , ) = getPriceFeedMaticX();

        uint256 _finalWithdrawMaticX;

        if (leverageStakingYieldToggle) {
            // Settling Leverage Staking
            (uint256 _supplied, uint256 _borrowed, , , , ) = getAaveUserAccountData();
            uint256 _repayPercentageUSD = (_assetsUSD * _borrowed) / _supplied;

            uint256 _repayPercentageSlippageUSD = _repayPercentageUSD + ((_repayPercentageUSD * 2) / 100);
            uint256 _initialWithdrawMaticX = (_repayPercentageSlippageUSD * (10 ** 18)) / uint256(_priceMaticX);
            uint256 _initialWithdrawnMaticX = IPool(aave).withdraw(maticX, _initialWithdrawMaticX, address(this));
            uint256 _initialLimit = (_initialWithdrawnMaticX * 995) / 1000;
            IVault(balancer).swap(
                IVault.SingleSwap(
                    balancerPool,
                    IVault.SwapKind(0),
                    IAsset(maticX),
                    IAsset(wMatic),
                    _initialWithdrawnMaticX,
                    bytes("0")
                ),
                IVault.FundManagement(address(this), false, payable(address(this)), false),
                _initialLimit,
                block.timestamp + 4000
            );

            uint256 _repayWMatic = (_repayPercentageUSD * (10 ** 18)) / uint256(_priceWMatic);
            IPool(aave).repay(wMatic, _repayWMatic, 2, address(this));

            _finalWithdrawMaticX = ((_assetsUSD - _repayPercentageSlippageUSD) * (10 ** 18)) / uint256(_priceMaticX);
        } else {
            _finalWithdrawMaticX = (_assetsUSD * (10 ** 18)) / uint256(_priceMaticX);
        }

        // Settling Liquid Staking
        uint256 _finalWithdrawnMaticX = IPool(aave).withdraw(maticX, _finalWithdrawMaticX, address(this));
        uint256 _finalLimit = (_finalWithdrawnMaticX * 995) / 1000;
        IVault(balancer).swap(
            IVault.SingleSwap(
                balancerPool,
                IVault.SwapKind(0),
                IAsset(maticX),
                IAsset(wMatic),
                _finalWithdrawnMaticX,
                bytes("0")
            ),
            IVault.FundManagement(address(this), false, payable(address(this)), false),
            _finalLimit,
            block.timestamp + 4000
        );
    }

    function _burnLSD(uint256 _shares, uint256 _assets, address _owner) internal {
        _burn(_owner, _shares);
        totalInvested -= _assets;
    }
}
