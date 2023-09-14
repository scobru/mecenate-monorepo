// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IMecenateVerifier.sol";
import "./interfaces/IMecenateUsers.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MecenateVault is Ownable, ReentrancyGuard {
    mapping(bytes32 => uint256) private ethDeposits;
    mapping(bytes32 => mapping(address => uint256)) private tokenDeposits;

    address public verifierContract;
    address public usersContract;

    constructor(address _verifierContract, address _usersContract) {
        verifierContract = _verifierContract;
        usersContract = _usersContract;
    }

    function depositETH(bytes32 _commitment) public payable nonReentrant {
        ethDeposits[_commitment] += msg.value;
    }

    function depositToken(
        address _token,
        uint256 _amount,
        bytes32 _commitment
    ) public nonReentrant {
        IERC20 token = IERC20(_token);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        tokenDeposits[_commitment][_token] += _amount;
    }

    function payETH(
        address _to,
        uint256 _amount,
        bytes32 _commitment
    ) external nonReentrant {
        require(ethDeposits[_commitment] >= _amount, "Not enough balance");
        ethDeposits[_commitment] -= _amount;
        payable(_to).transfer(_amount);
    }

    function payToken(
        address _token,
        address _to,
        uint256 _amount,
        bytes32 _commitment
    ) external nonReentrant {
        require(
            tokenDeposits[_commitment][_token] >= _amount,
            "Not enough token balance"
        );
        tokenDeposits[_commitment][_token] -= _amount;
        IERC20(_token).transfer(_to, _amount);
    }

    function withdrawETH(
        address operator,
        uint256 _amount,
        bytes32 _commitment
    ) public {
        require(ethDeposits[_commitment] >= _amount, "Not enough balance");
        ethDeposits[_commitment] -= _amount;
        payable(operator == address(0) ? msg.sender : operator).transfer(
            _amount
        );
    }

    function withdrawToken(
        address _token,
        address operator,
        uint256 _amount,
        bytes32 _commitment
    ) public {
        require(
            tokenDeposits[_commitment][_token] >= _amount,
            "Not enough token balance"
        );
        tokenDeposits[_commitment][_token] -= _amount;
        IERC20(_token).transfer(
            operator == address(0) ? msg.sender : operator,
            _amount
        );
    }

    function getEthDeposit(bytes32 _commitment) public view returns (uint256) {
        return ethDeposits[_commitment];
    }

    function getTokenDeposit(
        address _token,
        bytes32 _commitment
    ) public view returns (uint256) {
        return tokenDeposits[_commitment][_token];
    }
}
