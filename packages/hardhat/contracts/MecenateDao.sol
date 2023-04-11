// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./token/AMUSE.sol";

contract DAO {
    using Counters for Counters.Counter;

    AMUSE public governanceToken;
    uint256 public constant VOTE_DURATION = 1 weeks;
    uint256 public constant QUORUM_PERCENT = 20;

    struct Proposal {
        address proposer;
        address payable target;
        uint256 value;
        bytes data;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    Counters.Counter private proposalId;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => bool) public permitted;

    constructor(address _governanceToken) {
        governanceToken = AMUSE(_governanceToken);
    }

    modifier onlyPermitted() {
        require(permitted[msg.sender], "Not authorized to execute proposals");
        _;
    }

    function propose(
        address payable _target,
        uint256 _value,
        bytes calldata _data,
        string calldata _description
    ) external returns (uint256) {
        uint256 newProposalId = proposalId.current();
        proposals[newProposalId] = Proposal({
            proposer: msg.sender,
            target: _target,
            value: _value,
            data: _data,
            description: _description,
            yesVotes: 0,
            noVotes: 0,
            endTime: block.timestamp + VOTE_DURATION,
            executed: false
        });
        proposalId.increment();
        return newProposalId;
    }

    function vote(uint256 _proposalId, bool _approve) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp <= proposal.endTime, "Voting period has ended");
        require(
            !hasVoted[msg.sender][_proposalId],
            "You have already voted on this proposal"
        );

        uint256 balance = governanceToken.balanceOf(msg.sender);
        require(balance > 0, "You must hold governance tokens to vote");

        if (_approve) {
            proposal.yesVotes += balance;
        } else {
            proposal.noVotes += balance;
        }
        hasVoted[msg.sender][_proposalId] = true;
    }

    function execute(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal has already been executed");
        require(
            block.timestamp > proposal.endTime,
            "Voting period is not over yet"
        );

        uint256 totalSupply = governanceToken.totalSupply();
        require(
            proposal.yesVotes * 100 >= totalSupply * QUORUM_PERCENT,
            "Not enough votes for quorum"
        );
        require(
            proposal.yesVotes > proposal.noVotes,
            "Proposal has not been approved"
        );

        (bool success, ) = proposal.target.call{value: proposal.value}(
            proposal.data
        );
        require(success, "Proposal execution failed");

        proposal.executed = true;
    }

    function executePermitted(uint256 _proposalId) external onlyPermitted {
        executeInternal(_proposalId);
    }

    function grantPermission(address _contract) external onlyPermitted {
        permitted[_contract] = true;
    }

    function revokePermission(address _contract) external onlyPermitted {
        permitted[_contract] = false;
    }

    function executeInternal(uint256 _proposalId) private {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal has already been executed");
        require(
            block.timestamp > proposal.endTime,
            "Voting period is not over yet"
        );

        uint256 totalSupply = governanceToken.totalSupply();
        require(
            proposal.yesVotes * 100 >= totalSupply * QUORUM_PERCENT,
            "Not enough votes for quorum"
        );
        require(
            proposal.yesVotes > proposal.noVotes,
            "Proposal has not been approved"
        );

        (bool success, ) = proposal.target.call{value: proposal.value}(
            proposal.data
        );
        require(success, "Proposal execution failed");

        proposal.executed = true;
    }
}
