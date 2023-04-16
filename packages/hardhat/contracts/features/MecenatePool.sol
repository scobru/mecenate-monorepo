pragma solidity 0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenatePool is Ownable {
    address public oracleA;
    address public oracleB;

    IERC20 public tokenA;
    IERC20 public tokenB;
    LiquidityToken private liquidityToken;

    uint256 private constant PRICE_SCALE = 10 ** 8;
    uint256 public feeRate = 30; // Fee rate in basis points (0.3%)

    constructor(
        address _tokenA,
        address _oracleA,
        address _tokenB,
        address _oracleB
    ) {
        oracleA = _oracleA;
        oracleB = _oracleB;
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function initialize(
        address _tokenA,
        address _oracleA,
        address _tokenB,
        address _oracleB
    ) public {
        oracleA = _oracleA;
        oracleB = _oracleB;
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        liquidityToken = new LiquidityToken();
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        uint256 valueA = (amountA * getLatestPrice(oracleA)) / PRICE_SCALE;
        uint256 valueB = (amountB * getLatestPrice(oracleB)) / PRICE_SCALE;

        // Tolerance of 1% to account for price fluctuations
        uint256 tolerance = (valueA * 100) / 10000;
        require(
            valueA >= valueB - tolerance && valueA <= valueB + tolerance,
            "Token values must be approximately equal"
        );

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        liquidityToken.mint(msg.sender, amountA);
    }

    function removeLiquidity(uint256 liquidity) external {
        require(liquidity > 0, "Amount must be greater than 0");

        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));

        uint256 shareA = (liquidity * balanceA) / liquidityToken.totalSupply();
        uint256 shareB = (liquidity * balanceB) / liquidityToken.totalSupply();

        liquidityToken.burn(msg.sender, liquidity);

        tokenA.transfer(msg.sender, shareA);
        tokenB.transfer(msg.sender, shareB);
    }

    function swapAtoB(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        uint256 amountB = calculateDaiAmount(amount);
        uint256 fee = (amountB * feeRate) / 10000;

        tokenA.transferFrom(msg.sender, address(this), amount);
        tokenB.transfer(msg.sender, amountB - fee);
    }

    function swapBtoA(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        uint256 amountA = calculateDaiAmount(amount);
        uint256 fee = (amountA * feeRate) / 10000;

        tokenB.transferFrom(msg.sender, address(this), amount);
        tokenA.transfer(msg.sender, amountA - fee);
    }

    function calculateDaiAmount(uint256 amount) public view returns (uint256) {
        uint256 priceA = getLatestPrice(oracleA);
        uint256 priceB = getLatestPrice(oracleB);

        uint256 usdValue = (priceA * priceB) / PRICE_SCALE;

        return (usdValue * PRICE_SCALE) / priceB;
    }

    function getLatestPrice(address feed) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(feed);
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        require(answer > 0, "Invalid price");

        return uint256(answer);
    }

    function setFeeRate(uint256 newFeeRate) external onlyOwner {
        require(
            newFeeRate <= 10000,
            "Fee rate must be less than or equal to 10000"
        );
        feeRate = newFeeRate;
    }
}

contract LiquidityToken is ERC20, Ownable {
    constructor()
        ERC20("Mecenate Universal Support Economy Liquidity Token", "MUSELP")
    {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
