pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../interfaces/IMecenateFactory.sol";
import "../interfaces/IMecenateTreasury.sol";

contract MecenateQuestion is Ownable {
    using SafeMath for uint256;

    enum Choice {
        Yes,
        No,
        None
    }

    enum Status {
        Open,
        Submit,
        Close
    }

    event UserAction(address indexed user, string action, uint256 amount);

    Status public status;

    mapping(Choice => mapping(address => uint256)) public shares;

    mapping(address => Choice) public vote;

    uint256 public totalYesStaked;
    uint256 public totalNoStaked;
    uint256 public creatorStaked;
    uint256 public fees;
    uint256 public votingPeriod = 3 days; // 3 days for mainnet
    uint256 public claimingPeriod = 7 days; // 7 days for mainnet
    uint256 public endTime;
    uint256 public penalityRatio = 100000000000000000;
    uint256 public punishPercentage;
    uint256 public yesVoteWeight;
    uint256 public noVoteWeight;
    uint256 public questionCounter;
    uint256 public amountToClaim;
    uint256 public submissionTimestamp;
    uint256 public resolveTimestamp;

    string public question;

    address public creator;
    address public factoryContract;

    address[] public stakers;

    Choice public creatorAnswer = Choice.None;
    Choice public communityAnswer = Choice.None;

    constructor(address _factoryContract, address _creator) {
        factoryContract = _factoryContract;
        _transferOwnership(_creator);
    }

    function create(
        string memory _question,
        uint256 _endTime,
        uint256 _punishPercentage
    ) external payable {
        if (creatorStaked == 0) {
            require(msg.value > 0, "Amount should be greater than 0");
        }

        require(_endTime > block.timestamp, "End time should be in the future");

        address treasuryContract = IMecenateFactory(factoryContract)
            .treasuryContract();

        uint256 globalFee = IMecenateTreasury(treasuryContract).globalFee();

        uint256 fee = (msg.value).mul(globalFee).div(10000);

        payable(treasuryContract).transfer(fee);

        uint256 amountAfter = msg.value.sub(fee);

        punishPercentage = _punishPercentage;

        question = _question;

        endTime = _endTime;

        creator = msg.sender;

        status = Status.Open;

        if (msg.value > 0) {
            creatorStaked += amountAfter;
        }

        questionCounter++;
    }

    function stake(Choice _choice) external payable {
        require(msg.value > 0, "Amount should be greater than 0");
        require(endTime > block.timestamp, "Prediction has ended");
        require(status == Status.Open, "Prediction is not Open");

        address treasuryContract = IMecenateFactory(factoryContract)
            .treasuryContract();

        uint256 globalFee = IMecenateTreasury(treasuryContract).globalFee();

        uint256 creatorFeeAmount = (msg.value).mul(globalFee).div(10000);

        uint256 amountAfter = (msg.value).sub(creatorFeeAmount);

        fees += creatorFeeAmount - (creatorFeeAmount / 10);

        payable(treasuryContract).transfer(creatorFeeAmount / 10);

        bool isStaker = false;

        for (uint256 i = 0; i < stakers.length; i++) {
            if (stakers[i] == msg.sender) {
                isStaker = true;
                break;
            }
        }

        if (!isStaker) {
            stakers.push(msg.sender);
        }

        if (_choice == Choice.Yes) {
            totalYesStaked += amountAfter;
            shares[Choice.Yes][msg.sender] += amountAfter;
        } else if (_choice == Choice.No) {
            totalNoStaked += amountAfter;
            shares[Choice.No][msg.sender] += amountAfter;
        }

        vote[msg.sender] = Choice.None;
        emit UserAction(msg.sender, "stake", amountAfter);
    }

    function submit(Choice _choice) public {
        require(status == Status.Open, "Prediction is not Open");
        require(endTime < block.timestamp, "Prediction not ended");

        submissionTimestamp = block.timestamp;

        require(
            msg.sender == creator,
            "Only the creator can resolve the prediction"
        );

        require(
            _choice == Choice.Yes || _choice == Choice.No,
            "Answer should be Yes or No"
        );

        status = Status.Submit;

        // Set the final answer of the prediction
        if (_choice == Choice.Yes) {
            creatorAnswer = Choice.Yes;
        } else if (_choice == Choice.No) {
            creatorAnswer = Choice.No;
        }
    }

    function voteAnswer(Choice _choice) public {
        require(
            block.timestamp < submissionTimestamp + votingPeriod,
            "Voting period has ended"
        );
        require(
            status == Status.Submit,
            "Prediction is not Resolve or Vote is Closed"
        );

        require(vote[msg.sender] == Choice.None, "You have already voted");

        require(msg.sender != creator, "Creator cannot vote");

        require(
            _choice == Choice.Yes || _choice == Choice.No,
            "Answer should be Yes or No"
        );

        require(
            shares[Choice.Yes][msg.sender] > 0 ||
                shares[Choice.No][msg.sender] > 0,
            "You have no shares to vote"
        );

        if (_choice == Choice.Yes) {
            yesVoteWeight = (yesVoteWeight + shares[Choice.Yes][msg.sender]);
        } else if (_choice == Choice.No) {
            noVoteWeight = (noVoteWeight + shares[Choice.No][msg.sender]);
        }
    }

    function resolve() public {
        require(status == Status.Submit, "Prediction is not Voted");
        require(
            block.timestamp >= submissionTimestamp + votingPeriod,
            "Voting period has ended"
        );

        resolveTimestamp = block.timestamp;

        if (yesVoteWeight > noVoteWeight) {
            communityAnswer = Choice.Yes;
        } else {
            communityAnswer = Choice.No;
        }

        if (communityAnswer == creatorAnswer) {
            status = Status.Close;
        } else {
            punish();
            status = Status.Close;
        }

        if (communityAnswer == Choice.Yes) {
            for (uint256 i = 0; i < stakers.length; i++) {
                if (shares[Choice.No][stakers[i]] > 0) {
                    amountToClaim += shares[Choice.No][stakers[i]];
                    shares[Choice.No][stakers[i]] = 0;
                }
            }
        } else if (communityAnswer == Choice.No) {
            for (uint256 i = 0; i < stakers.length; i++) {
                if (shares[Choice.Yes][stakers[i]] > 0) {
                    amountToClaim += shares[Choice.Yes][stakers[i]];
                    shares[Choice.Yes][stakers[i]] = 0;
                }
            }
        }
    }

    function punish() private {
        uint256 punishment = (creatorStaked * punishPercentage) / 10000;

        uint256 bidderPenality = (punishment * penalityRatio) / 1e18;

        uint256 creatorPenality = creatorStaked - punishment;

        uint256 stakerCount = stakers.length;

        for (uint256 i = 0; i < stakerCount; i++) {
            address staker = stakers[i];

            if (shares[Choice.Yes][staker] > 0) {
                uint256 yesPenalty = (bidderPenality *
                    shares[Choice.Yes][staker]) / totalYesStaked;
                shares[Choice.Yes][staker] =
                    shares[Choice.Yes][staker] -
                    yesPenalty;
                totalYesStaked = totalYesStaked - yesPenalty;
            }

            if (shares[Choice.No][staker] > 0) {
                uint256 noPenalty = (bidderPenality *
                    shares[Choice.No][staker]) / totalNoStaked;
                shares[Choice.No][staker] =
                    shares[Choice.No][staker] -
                    noPenalty;
                totalNoStaked = totalNoStaked - noPenalty;
            }
        }

        // Transfer the penalty to the creator
        creatorStaked = creatorPenality;
    }

    function claim() public {
        require(status == Status.Close, "Prediction is not Resolved");
        require(
            block.timestamp <= resolveTimestamp + claimingPeriod,
            "Claim period has ended"
        );

        uint256 userShares;

        uint256 reward;

        if (communityAnswer == Choice.Yes) {
            userShares = shares[Choice.Yes][msg.sender];

            require(
                userShares > 0,
                "No shares to claim or You lost the prediction"
            );

            reward = userShares.mul(amountToClaim).div(1e18);

            shares[Choice.Yes][msg.sender] = 0;

            require(reward > 0, "Reward should be greater than 0");

            (bool success, ) = msg.sender.call{value: reward}("");
            require(success, "Transfer failed");
        } else if (communityAnswer == Choice.No) {
            userShares = shares[Choice.No][msg.sender];

            require(
                userShares > 0,
                "No shares to claim or  You lost the prediction"
            );

            reward = userShares.mul(amountToClaim).div(1e18);

            shares[Choice.No][msg.sender] = 0;

            require(reward > 0, "Reward should be greater than 0");

            (bool success, ) = msg.sender.call{value: reward}("");
            require(success, "Transfer failed");
        } else {
            revert("Prediction is not resolved yet");
        }

        emit UserAction(msg.sender, "claim", reward);
    }

    function withdrawFees() public {
        require(msg.sender == creator);
        require(status == Status.Close, "Prediction is not Resolved");
        uint256 amount = fees + creatorStaked;
        fees = 0;
        creatorStaked = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function reset() public onlyOwner {
        require(
            block.timestamp > resolveTimestamp + claimingPeriod,
            "Claim period not ended"
        );

        require(status == Status.Close, "Prediction already resolved");

        uint256 predictionBalance = address(this).balance -
            (creatorStaked + fees);
        address treasuryContract = IMecenateFactory(factoryContract)
            .treasuryContract();

        if (predictionBalance > 0) {
            (bool success, ) = treasuryContract.call{value: predictionBalance}(
                ""
            );
            require(success, "Transfer failed");
        }

        withdrawFees();

        status = Status.Open;
        totalYesStaked = 0;
        totalNoStaked = 0;
        creatorAnswer = Choice.None;
        communityAnswer = Choice.None;
        yesVoteWeight = 0;
        noVoteWeight = 0;
        amountToClaim = 0;
        delete stakers;
    }

    function getPrediction()
        public
        view
        returns (
            string memory question,
            uint256 predictionEndTime,
            uint256 predictionVotingPeriod,
            uint256 predictionClaimingPeriod,
            uint256 predictionTotalYesStaked,
            uint256 predictionTotalNoStaked,
            uint256 predictionTotalStaked,
            uint256 predictionFees,
            uint256 punishPercentage,
            uint256 penaltyRatio,
            Choice predictionCorrectAnswer,
            Choice predictionAnswer,
            Status predictionStatus
        )
    {
        return (
            question,
            endTime,
            votingPeriod,
            claimingPeriod,
            totalYesStaked,
            totalNoStaked,
            creatorStaked,
            fees,
            punishPercentage,
            penalityRatio,
            communityAnswer,
            creatorAnswer,
            status
        );
    }

    function getReward(address user) public view returns (uint256) {
        uint256 userShares;

        uint256 reward;

        if (communityAnswer == Choice.Yes) {
            userShares = shares[Choice.Yes][user];

            if (userShares > 0) {
                reward = userShares.mul(amountToClaim).div(1e18);
            }
        } else if (communityAnswer == Choice.No) {
            userShares = shares[Choice.No][user];

            if (userShares > 0) {
                reward = userShares.mul(amountToClaim).div(1e18);
            }
        }

        return reward;
    }

    receive() external payable {}
}
