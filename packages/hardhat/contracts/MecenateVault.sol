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
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IMecenateVerifier.sol";
import "./interfaces/IMecenateFeedFactory.sol";

contract MecenateVault is Ownable, ReentrancyGuard {
    using Address for address;
    using Address for address payable;

    mapping(bytes32 => uint256) private ethDeposits;
    mapping(bytes32 => mapping(address => uint256)) private tokenDeposits;

    address public WETH;
    address public DAI;
    address public USDC;
    address public MUSE;
    address public verifierContract;
    address public factoryContract;
    address public mecenateBay;
    address public mecenateUsers;
    address private relayer;

    uint256 public relayerFeePercentage = 200;
    uint256 public constant MAX_RELAYER_FEE_PERCENTAGE = 500;

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

    function setTokens(
        address _WETH,
        address _DAI,
        address _USDC,
        address _MUSE
    ) external onlyOwner {
        WETH = _WETH;
        DAI = _DAI;
        USDC = _USDC;
        MUSE = _MUSE;
    }

    function changeRelayerFee(
        uint256 _newRelayerFeePercentage
    ) external onlyOwner {
        require(
            _newRelayerFeePercentage <= MAX_RELAYER_FEE_PERCENTAGE,
            "New relayer fee percentage is too high"
        );
        relayerFeePercentage = _newRelayerFeePercentage;
    }

    function depositETH(bytes32 encryptedVaultId) public payable nonReentrant {
        // 1. Add the deposit to the correct deposit mapping
        ethDeposits[encryptedVaultId] += msg.value;
    }

    function approveTokenToFeed(
        address _token,
        uint256 _amount,
        address _feed,
        bytes32 encryptedVaultId
    ) public {
        require(_token != address(0), "Token address cannot be 0");
        require(_amount > 0, "Amount must be greater than zero");
        require(
            _token == WETH || _token == DAI || _token == USDC || _token == MUSE,
            "Token not supported"
        );
        require(
            tokenDeposits[encryptedVaultId][_token] >= _amount,
            "Not enough balance"
        );

        require(
            IMecenateFeedFactory(factoryContract).isFeed(_feed) ||
                _feed == mecenateBay,
            "Not a feed"
        );

        // The user must first approve the token transfer
        // to this contract
        IERC20 token = IERC20(_token);
        // Approve the token to the feed
        token.approve(_feed, _amount);
    }

    function depositToken(
        address _token,
        uint256 _amount,
        bytes32 encryptedVaultId
    ) external {
        require(_token != address(0), "Token address cannot be 0");

        require(_amount > 0, "Amount must be greater than zero");

        require(
            _token == WETH || _token == DAI || _token == USDC || _token == MUSE,
            "Token not supported"
        );

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
        uint256 _amount,
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) public onlyRelayer nonReentrant {
        uint256 initialGas = gasleft();

        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        (address to, bytes32 nonce) = abi.decode(
            signedMessage,
            (address, bytes32)
        );

        require(to == _to, "Not Same Address");

        require(nonce == _nonce, "Not Same Nonce");

        bytes32 encryptedVaultId = keccak256(vaultId);

        uint256 totalRequired = _amount; // Initialize with _value

        totalRequired -= tx.gasprice * initialGas; // Add maximum possible gas cost

        require(
            ethDeposits[encryptedVaultId] >= totalRequired,
            "Not enough balance"
        );

        // 1. Verify that the commitment exists and the amount is not zero
        require(ethDeposits[encryptedVaultId] > 0, "Commitment does not exist");

        require(_amount > 0, "Amount must be greater than zero");

        // 2. Verify that the commitment has enough balance to withdraw from
        require(ethDeposits[encryptedVaultId] >= _amount, "Not enough balance");

        //decode signedMessage as address
        ethDeposits[encryptedVaultId] -= _amount;

        uint256 gasUsed = initialGas - gasleft();

        uint256 gasCost = gasUsed * tx.gasprice;

        uint256 relayerFee = (gasCost * relayerFeePercentage) / 10000;

        require(_amount >= gasCost + relayerFee, "Not enough balance for gas");

        uint256 newAmount = _amount - gasCost - relayerFee;

        (bool result, ) = payable(to).call{value: newAmount}("");

        require(result, "ETH transfer failed");

        (bool result2, ) = payable(msg.sender).call{
            value: gasCost + relayerFee
        }("");

        require(result2, "ETH transfer failed with gas");
    }

    function withdrawWithSecret(
        string memory _secret,
        address _token,
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) public onlyRelayer nonReentrant {
        bytes32 commitment = keccak256(abi.encodePacked(_secret));
        uint256 amount;

        if (_token == address(0)) {
            amount = ethDeposits[commitment];
            require(amount > 0, "No ETH deposit for this secret");
            ethDeposits[commitment] = 0;
            payable(_to).transfer(amount);
        } else {
            amount = tokenDeposits[commitment][_token];
            require(amount > 0, "No Token deposit for this secret");
            tokenDeposits[commitment][_token] = 0;
            IERC20(_token).transfer(_to, amount);
        }

        emit Withdrawn(commitment, amount, _secret, _token);
    }

    function withdrawToken(
        address _token,
        uint256 _amount,
        bytes memory sismoConnectResponse,
        address _to,
        bytes32 _nonce
    ) public onlyRelayer nonReentrant {
        uint256 initialGas = gasleft();

        uint256 totalRequired = tx.gasprice * initialGas;

        (
            bytes memory vaultId,
            ,
            ,
            bytes memory signedMessage
        ) = IMecenateVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                _to,
                _nonce
            );

        (address to, bytes32 nonce) = abi.decode(
            signedMessage,
            (address, bytes32)
        );

        require(
            ethDeposits[keccak256(vaultId)] >= totalRequired,
            "Not enough ETH for gas required"
        );

        require(to == _to, "Not Same Address");

        require(nonce == _nonce, "Not Same Nonce");

        // Check if the commitment exists
        // and the amount is greater than the deposit.
        require(
            tokenDeposits[keccak256(vaultId)][_token] >= _amount,
            "Not enough token balance"
        );

        // Decrease the token balance for the commitment.
        tokenDeposits[keccak256(vaultId)][_token] -= _amount;

        // Transfer the tokens to msg.sender or operator.
        IERC20(_token).transfer(to, _amount);

        uint256 gasUsed = initialGas - gasleft();

        uint256 gasCost = gasUsed * tx.gasprice;

        uint256 relayerFee = (gasCost * relayerFeePercentage) / 10000;

        require(
            ethDeposits[keccak256(vaultId)] >= gasCost + relayerFee,
            "Not enough balance for gas used"
        );

        ethDeposits[keccak256(vaultId)] -= gasCost + relayerFee;

        (bool result, ) = payable(msg.sender).call{value: gasCost + relayerFee}(
            ""
        );

        require(result, "ETH transfer failed with gas");
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

    function execute(
        address _target,
        bytes calldata _data,
        uint256 _value,
        bytes32 _encryptedVaultId
    ) external onlyRelayer nonReentrant returns (bool) {
        uint256 availableBalance = ethDeposits[_encryptedVaultId];

        uint256 ethBalanceB4 = address(this).balance;
        uint256 daiBalanceB4 = IERC20(DAI).balanceOf(address(this));
        uint256 museBalanceB4 = IERC20(MUSE).balanceOf(address(this));

        uint256 totalRequired = _value + (tx.gasprice * gasleft());

        require(availableBalance >= totalRequired, "Insufficient ETH balance");

        bool success; // variabile per verificare il successo delle transazioni
        bytes memory retData; // dati di ritorno dalle transazioni

        if (_data.length == 0) {
            (success, ) = payable(_target).call{value: _value}("");
        } else {
            if (_value == 0) {
                (success, retData) = _target.call(_data);
            } else {
                (success, retData) = _target.call{value: _value}(_data);
            }
        }

        require(success, "Transaction failed");

        uint256 gasUsed = totalRequired - _value - (tx.gasprice * gasleft());

        uint256 relayerFee = (gasUsed * relayerFeePercentage) / 10000;

        require(
            availableBalance >= gasUsed + relayerFee,
            "Insufficient balance for gas and fee"
        );

        uint256 daiBalance = IERC20(DAI).balanceOf(address(this));
        uint256 museBalance = IERC20(MUSE).balanceOf(address(this));

        uint256 diffDai;
        uint256 diffMuse;

        if (_value > 0) {
            ethDeposits[_encryptedVaultId] -= _value;
        }

        ethDeposits[_encryptedVaultId] = gasUsed - relayerFee;

        (success, ) = payable(msg.sender).call{value: gasUsed + relayerFee}("");

        require(success, "ETH transfer failed");

        if (daiBalanceB4 > daiBalance) {
            diffDai = daiBalanceB4 - daiBalance;

            if (diffDai > 0 && daiBalanceB4 != 0) {
                tokenDeposits[_encryptedVaultId][DAI] -= diffDai;
            }
        }

        if (museBalanceB4 > museBalance) {
            diffMuse = museBalanceB4 - museBalance;

            if (diffMuse > 0 && museBalanceB4 != 0) {
                tokenDeposits[_encryptedVaultId][MUSE] -= diffMuse;
            }
        }

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
