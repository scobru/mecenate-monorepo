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

    address public verifierContract;

    event Withdrawn(
        bytes32 indexed commitment,
        uint256 amount,
        string secret,
        address token
    );

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
    }

    function depositETH(bytes32 encryptedVaultId) public payable nonReentrant {
        ethDeposits[encryptedVaultId] += msg.value;
    }

    function depositToken(
        address _token,
        uint256 _amount,
        bytes32 encryptedVaultId
    ) external {
        require(_token != address(0), "Token address cannot be 0");

        require(_amount > 0, "Amount must be greater than zero");

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
        address _from
    ) public nonReentrant {
        (bytes memory vaultId, , ) = IMecenateVerifier(verifierContract)
            .sismoVerify(sismoConnectResponse, _to, _from);

        bytes32 encryptedVaultId = keccak256(vaultId);

        require(ethDeposits[encryptedVaultId] > 0, "Commitment does not exist");

        require(_amount > 0, "Amount must be greater than zero");

        require(ethDeposits[encryptedVaultId] >= _amount, "Not enough balance");

        (bool result, ) = payable(_to).call{value: _amount}("");

        ethDeposits[encryptedVaultId] -= _amount;

        require(result, "ETH transfer failed");
    }

    function withdrawWithSecret(
        string memory _secret,
        address _token,
        address _to
    ) public nonReentrant {
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
        address _from
    ) public nonReentrant {
        (bytes memory vaultId, , ) = IMecenateVerifier(verifierContract)
            .sismoVerify(sismoConnectResponse, _to, _from);

        // Check if the commitment exists
        // and the amount is greater than the deposit.
        require(
            tokenDeposits[keccak256(vaultId)][_token] >= _amount,
            "Not enough token balance"
        );

        // Decrease the token balance for the commitment.
        tokenDeposits[keccak256(vaultId)][_token] -= _amount;

        // Transfer the tokens to msg.sender or operator.
        IERC20(_token).transfer(_to, _amount);
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

    function setVerifierContract(address _verifierContract) external onlyOwner {
        verifierContract = _verifierContract;
    }
}
