// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMecenateFactory.sol";
import "../interfaces/IMecenateTreasury.sol";

contract MecenateDCA is Ownable {
    using SafeMath for uint256;

    // Chainlink Price Feed contract address for the asset
    AggregatorV3Interface internal priceFeed;

    // token token contract address
    IERC20 internal tokenFrom;
    
    IERC20 internal tokenTo;

    address public factoryContract;

    // Uniswap V2 Router contract address
    IUniswapV2Router02 internal uniswapRouter;

    // Upkeep contract address for executing the purchases
    address public upkeep;

    // Amount of funds to use for each purchase
    uint256 public amountToInvest;

    // Interval for executing the purchases (in seconds)
    uint256 public purchaseInterval;

    // Time of the last purchase
    uint256 public lastPurchaseTime;

    // Total amount of asset purchased
    uint256 public totalAssetPurchased;

    // Total amount of funds invested
    uint256 public totalFundsInvested;

    constructor(
        address _owner,
        address _tokenFrom,
        address _tokenTo,
        address _priceFeedAddress,
        address _uniswapRouterAddress
    ) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        tokenFrom = IERC20(_tokenFrom);
        tokenTo = IERC20(_tokenTo);
        uniswapRouter = IUniswapV2Router02(_uniswapRouterAddress);
        lastPurchaseTime = block.timestamp;
        factoryContract = msg.sender;
        transferOwnership(_owner);
    }

    function setAmountToInvest(uint256 _amountToInvest) public onlyOwner {
        amountToInvest = _amountToInvest;
    }

    function setPurchaseInterval(uint256 _purchaseInterval) public onlyOwner {
        purchaseInterval = _purchaseInterval;
    }

    function setUpkeep(address _upkeep) public onlyOwner {
        upkeep = _upkeep;
    }

    function transferToken(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            tokenFrom.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );

        tokenFrom.transferFrom(msg.sender, address(this), amountToInvest);
    }

    function purchase() public {
        require(amountToInvest > 0, "Amount to invest must be set");
        require(purchaseInterval > 0, "Purchase interval must be set");

        // Calculate the current market price of the asset
        // (, int256 price, , , ) = priceFeed.latestRoundData();
        // uint256 currentPrice = uint256(price);
        // uint256 assetToPurchase = amountToInvest.mul(1e18).div(currentPrice);

        // Swap token for the asset on Uniswap
        address[] memory path = new address[](2);
        path[0] = address(tokenFrom);
        path[1] = address(tokenTo);

        // Approve the Uniswap Router to spend the tokenFrom
        tokenFrom.approve(address(uniswapRouter), amountToInvest);

        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            amountToInvest,
            1,
            path,
            address(this),
            block.timestamp
        );

        address treasuryContract = IMecenateFactory(factoryContract)
            .treasuryContract();

        uint256 globalFee = IMecenateTreasury(treasuryContract).globalFee();
        uint256 fee = amounts[1].mul(globalFee).div(10000);
        uint256 amountAfter = amounts[1].sub(fee);

        tokenTo.approve(treasuryContract, fee);
        tokenTo.transfer(treasuryContract, fee);

        // Update purchase information
        lastPurchaseTime = block.timestamp;
        totalAssetPurchased = totalAssetPurchased.add(amountAfter);
        totalFundsInvested = totalFundsInvested.add(amountToInvest);
    }

    function executeUpkeep() public {
        require(
            msg.sender == upkeep,
            "Only the upkeep contract can execute this function"
        );
        require(upkeep != address(0), "Upkeep address must be set");

        // Verify that the purchase interval has passed
        require(
            block.timestamp >= lastPurchaseTime.add(purchaseInterval),
            "Purchase interval not reached"
        );

        // Execute the purchase function
        purchase();
    }

    function withdrawFunds() public onlyOwner {
        // Transfer all tokenFrom and tokenTo balance to the owner
        uint256 _amountFrom = tokenFrom.balanceOf(address(this));
        uint256 _amountTo = tokenTo.balanceOf(address(this));
        tokenFrom.transfer(msg.sender, _amountFrom);
        tokenTo.transfer(msg.sender, _amountTo);
    }
}
