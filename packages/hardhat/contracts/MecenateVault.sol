/**
 * @title MecenateVault
 * @dev This contract allows users to deposit and withdraw ETH and ERC20 tokens, and pay ETH and ERC20 tokens to other addresses.
 * It also keeps track of the deposited balances for each user using a commitment hash.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMecenateVerifier.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IMecenateFeedFactory.sol";

contract MecenateVault is Ownable, ReentrancyGuard {
    using Address for address;
    using Address for address payable;

    mapping(bytes32 => uint256) private ethDeposits;
    mapping(bytes32 => mapping(address => uint256)) private tokenDeposits;

    address public verifierContract;

    address public factoryContract;

    address public mecenateBay;

    address public mecenateUsers;

    address private relayer;

    uint256 public maxGasPrice = 100 * 10 ** 9; // 50 Gwei in Wei

    event MetaTransactionExecuted(
        address userAddress,
        address relayerAddress,
        bytes functionSignature
    );

    event Withdrawn(
        bytes32 indexed commitment,
        uint256 amount,
        string secret,
        address token
    );

    modifier validGasPrice() {
        require(tx.gasprice <= maxGasPrice, "Gas price too high");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Not relayer");
        _;
    }

    constructor(
        address _verifierContract,
        address _factoryContract,
        address _bayContract,
        address _usersContract,
        address _relayer
    ) {
        verifierContract = _verifierContract;
        factoryContract = _factoryContract;
        mecenateBay = _bayContract;
        mecenateUsers = _usersContract;
        relayer = _relayer;
    }

    function depositETH(bytes32 encryptedVaultId) public payable nonReentrant {
        // 1. Add the deposit to the correct deposit mapping
        ethDeposits[encryptedVaultId] += msg.value;
    }

    function depositToken(
        address _token,
        uint256 _amount,
        bytes32 encryptedVaultId,
        address _to
    ) public nonReentrant {
        // The user must first approve the token transfer
        // to this contract
        IERC20 token = IERC20(_token);

        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        // Add the deposited amount to the tokenDeposits mapping
        tokenDeposits[encryptedVaultId][_token] += _amount;
    }

    function withdrawETH(
        address _receiver,
        uint256 _amount,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) public {
        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == abi.decode(signedMessage, (bytes32)),
            "FEEDS:_to address does not match signed message"
        );

        bytes32 encryptedVaultId = keccak256(vaultId);

        // 1. Verify that the commitment exists and the amount is not zero
        require(ethDeposits[encryptedVaultId] > 0, "Commitment does not exist");
        require(_amount > 0, "Amount must be greater than zero");

        // 2. Verify that the commitment has enough balance to withdraw from
        require(ethDeposits[encryptedVaultId] >= _amount, "Not enough balance");

        //decode signedMessage as address
        ethDeposits[encryptedVaultId] -= _amount;

        (bool result, ) = payable(_receiver).call{value: _amount}("");
        require(result, "ETH transfer failed");
    }

    function withdrawWithSecret(string memory _secret, address _token) public {
        bytes32 commitment = keccak256(abi.encodePacked(_secret));
        uint256 amount;

        if (_token == address(0)) {
            amount = ethDeposits[commitment];
            require(amount > 0, "No ETH deposit for this secret");
            ethDeposits[commitment] = 0;
            payable(msg.sender).transfer(amount);
        } else {
            amount = tokenDeposits[commitment][_token];
            require(amount > 0, "No Token deposit for this secret");
            tokenDeposits[commitment][_token] = 0;
            IERC20(_token).transfer(msg.sender, amount);
        }

        emit Withdrawn(commitment, amount, _secret, _token);
    }

    function withdrawToken(
        address _receiver,
        address _token,
        uint256 _amount,
        bytes memory sismoConnectResponse,
        bytes32 _to
    ) public {
        (
            bytes memory vaultId,
            uint256 twitterId,
            uint256 telegramId,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to
            );

        require(
            _to == keccak256(signedMessage),
            "FEEDS:_to address does not match signed message"
        );

        // Check if the commitment exists
        // and the amount is greater than the deposit.
        require(
            tokenDeposits[keccak256(vaultId)][_token] >= _amount,
            "Not enough token balance"
        );

        // Decrease the token balance for the commitment.
        tokenDeposits[keccak256(vaultId)][_token] -= _amount;

        // Transfer the tokens to msg.sender or operator.
        IERC20(_token).transfer(_receiver, _amount);
    }

    function getEthDeposit(
        bytes32 encryptedVaultId
    ) public view returns (uint256) {
        return ethDeposits[encryptedVaultId];
    }

    receive() external payable {
        revert("Use depositETH function");
    }

    fallback() external payable {
        require(msg.data.length > 0, "Data required for Sismo verification.");

        bytes32 encryptedVaultId = abi.decode(msg.data, (bytes32));

        ethDeposits[encryptedVaultId] += msg.value;
    }

    function getTokenDeposit(
        address _token,
        bytes32 encryptedVaultId
    ) public view returns (uint256) {
        return tokenDeposits[encryptedVaultId][_token];
    }

    function setMaxGasPrice(uint256 _newMaxGasPrice) external onlyOwner {
        maxGasPrice = _newMaxGasPrice;
    }

    function execute(
        address _target,
        bytes calldata _data,
        uint256 _value,
        bytes32 _encryptedVaultId
    ) external onlyRelayer validGasPrice nonReentrant returns (bool) {
        uint256 initialGas = gasleft();

        require(
            IMecenateFeedFactory(factoryContract).isFeed(_target) == true ||
                _target == mecenateBay ||
                _target == mecenateUsers ||
                _target == verifierContract ||
                _target == factoryContract,
            "Target is not a feed or a mecenate contract"
        );

        uint256 totalRequired = _value; // Initialize with _value
        totalRequired += tx.gasprice * initialGas; // Add maximum possible gas cost

        require(
            ethDeposits[_encryptedVaultId] >= totalRequired,
            "Not enough balance"
        );

        if (_data.length == 0) {
            payable(_target).sendValue(_value);
        } else {
            if (_value == 0) {
                _target.functionCall(_data);
            } else {
                _target.functionCallWithValue(_data, _value);
            }
        }

        ethDeposits[_encryptedVaultId] -= _value;

        uint256 gasUsed = initialGas - gasleft();
        uint256 gasCost = gasUsed * tx.gasprice;

        require(
            ethDeposits[_encryptedVaultId] >= gasCost,
            "Not enough balance for gas"
        );

        ethDeposits[_encryptedVaultId] -= gasCost;

        payable(msg.sender).transfer(gasCost);

        return true;
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function setVerifierContract(address _verifierContract) external onlyOwner {
        verifierContract = _verifierContract;
    }

    function setFactoryContract(address _factoryContract) external onlyOwner {
        factoryContract = _factoryContract;
    }

    function setMecenateBay(address _mecenateBay) external onlyOwner {
        mecenateBay = _mecenateBay;
    }

    function setMecenateUsers(address _mecenateUsers) external onlyOwner {
        mecenateUsers = _mecenateUsers;
    }
}
