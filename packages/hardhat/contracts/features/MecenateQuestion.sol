pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MecenateQuestion is Ownable {
  enum Choice {
    Yes,
    No,
    None
  }

  enum Status {
    Open,
    Resolve,
    Vote,
    Close
  }

  struct Prediction {
    string question;
    Choice correctAnswer;
    Choice answer;
    uint256 endTime;
    address creator;
    uint256 totalStaked;
    uint256 totalYesStaked;
    uint256 totalNoStaked;
    Status status;
    uint256 fees;
  }

  event UserAction(uint256 indexed predictionId, address indexed user, string action, uint256 amount);

  mapping(uint256 => Prediction) public predictions;
  mapping(uint256 => mapping(Choice => mapping(address => uint256))) public shares;
  mapping(uint256 => mapping(address => Choice)) public vote;
  mapping(uint256 => address[]) public stakers;

  uint256 public voteCounter;
  uint256 public predictionCount;
  uint256 public creatorFee = 100;
  uint256 public votingPeriod = 3 days;
  uint256 public claimingPeriod = 7 days;
  address public treasury;

  constructor(address _treasury, address _creator) {
    treasury = _treasury;
    _transferOwnership(_creator);
  }

  function createPrediction(string memory _question, uint256 _endTime) public payable {
    require(msg.value > 0, "Amount should be greater than 0");
    require(_endTime > block.timestamp, "End time should be in the future");

    predictions[predictionCount] = Prediction({
      question: _question,
      correctAnswer: Choice.None,
      answer: Choice.None,
      endTime: _endTime,
      creator: msg.sender,
      totalStaked: msg.value,
      totalYesStaked: 0,
      totalNoStaked: 0,
      status: Status.Open,
      fees: 0
    });

    predictionCount++;
  }

  function stake(uint256 _predictionId, Choice _choice) public payable {
    require(msg.value > 0, "Amount should be greater than 0");
    require(predictions[_predictionId].endTime > block.timestamp, "Prediction has ended");
    require(predictions[_predictionId].status == Status.Open, "Prediction is not Open");

    // subtract creator Fee
    uint256 creatorFeeAmount = (msg.value * creatorFee) / 10000;
    predictions[_predictionId].fees = predictions[_predictionId].fees + creatorFeeAmount;
    uint256 amountAfter = (msg.value - creatorFeeAmount);

    uint256 sharesToMint = getTokensToMint(
      amountAfter,
      predictions[_predictionId].totalYesStaked,
      predictions[_predictionId].totalNoStaked,
      _choice
    );

    if (_choice == Choice.Yes) {
      predictions[_predictionId].totalYesStaked = predictions[_predictionId].totalYesStaked + amountAfter;
      shares[_predictionId][Choice.Yes][msg.sender] = shares[_predictionId][Choice.Yes][msg.sender] + sharesToMint;
    } else if (_choice == Choice.No) {
      predictions[_predictionId].totalNoStaked = (predictions[_predictionId].totalNoStaked + amountAfter);
      shares[_predictionId][Choice.No][msg.sender] = (shares[_predictionId][Choice.No][msg.sender] + sharesToMint);
    }

    for (uint256 i = 0; i < stakers[_predictionId].length; i++) {
      if (stakers[_predictionId][i] == msg.sender) {
        vote[_predictionId][msg.sender] = Choice.None;
      } else {
        stakers[_predictionId].push(msg.sender);
        vote[_predictionId][msg.sender] = Choice.None;
      }
    }

    emit UserAction(_predictionId, msg.sender, "stake", msg.value);
  }

  function getTokensToMint(
    uint256 _amount,
    uint256 _totalYesStaked,
    uint256 _totalNoStaked,
    Choice _choice
  ) public view returns (uint256) {
    uint256 existingStakedAmount = (_choice == Choice.Yes) ? _totalYesStaked : _totalNoStaked;
    uint256 existingShares = 1e18; // 1:1 ratio for the first user
    if (existingStakedAmount > 0) {
      existingShares = (_amount * 1e18) / existingStakedAmount;
    }

    return existingShares;
  }

  function resolvePrediction(uint256 _predictionId, Choice _choice) public {
    Prediction storage prediction = predictions[_predictionId];
    require(prediction.status == Status.Open, "Prediction is not Open");
    require(msg.sender == prediction.creator, "Only the creator can resolve the prediction");
    require(prediction.endTime <= block.timestamp, "Prediction time has not ended");
    require(_choice == Choice.Yes || _choice == Choice.No, "Answer should be Yes or No");
    prediction.status = Status.Resolve;
    prediction.answer = _choice;
  }

  function voteForCorrectAnswer(uint256 _predictionId, Choice _choice) public {
    Prediction storage prediction = predictions[_predictionId];
    require(
      prediction.status == Status.Resolve || prediction.status == Status.Close,
      "Prediction is not Resolve or Vote is Closed"
    );
    require(vote[_predictionId][msg.sender] == Choice.None, "You have already voted");
    require(msg.sender != prediction.creator, "Creator cannot vote");
    require(_choice == Choice.Yes || _choice == Choice.No, "Answer should be Yes or No");
    require(
      shares[_predictionId][Choice.Yes][msg.sender] > 0 || shares[_predictionId][Choice.No][msg.sender] > 0,
      "You have no shares to vote"
    );

    vote[_predictionId][msg.sender] = _choice;
    voteCounter++;
    if (block.timestamp > (prediction.endTime + votingPeriod)) {
      prediction.status = Status.Vote;
    }
  }

  function countVote(uint256 _predictionId) public {
    require(voteCounter > 0, "No vote to count");
    Prediction storage prediction = predictions[_predictionId];
    uint256 yesVoteWeight = 0;
    uint256 noVoteWeight = 0;
    for (uint256 i = 0; i < stakers[_predictionId].length; i++) {
      address currentUser = stakers[_predictionId][i];
      uint256 userYesShares = shares[_predictionId][Choice.Yes][currentUser];
      uint256 userNoShares = shares[_predictionId][Choice.No][currentUser];

      if (vote[_predictionId][currentUser] == Choice.Yes) {
        yesVoteWeight = (yesVoteWeight + userYesShares);
      } else if (vote[_predictionId][currentUser] == Choice.No) {
        noVoteWeight = (noVoteWeight + userNoShares);
      }
    }

    if (yesVoteWeight > noVoteWeight) {
      prediction.correctAnswer = Choice.Yes;
    } else {
      prediction.correctAnswer = Choice.No;
    }
  }

  function resolve(uint256 _predictionId) public {
    Prediction storage prediction = predictions[_predictionId];
    require(prediction.endTime <= block.timestamp, "Prediction time has not ended");
    require(prediction.status == Status.Vote, "Prediction is not Voted");
    if (prediction.correctAnswer == prediction.answer) {
      prediction.status = Status.Resolve;
    } else {
      punishCreator(_predictionId);
      prediction.status = Status.Resolve;
    }
  }

  function claim(uint256 _predictionId) public {
    require(predictions[_predictionId].status == Status.Resolve, "Prediction is not Resolved");
    Prediction storage prediction = predictions[_predictionId];
    uint256 userShares;

    uint256 reward;

    if (prediction.correctAnswer == Choice.Yes) {
      userShares = shares[_predictionId][Choice.Yes][msg.sender];
      require(userShares > 0, "No shares to claim");
      shares[_predictionId][Choice.Yes][msg.sender] = 0;
      reward = (prediction.totalYesStaked / 1e18) * userShares;
      payable(msg.sender).transfer(reward);
    } else if (prediction.correctAnswer == Choice.No) {
      userShares = shares[_predictionId][Choice.No][msg.sender];
      require(userShares > 0, "No shares to claim");
      shares[_predictionId][Choice.No][msg.sender] = 0;
      reward = (prediction.totalNoStaked / 1e18) * userShares;
      payable(msg.sender).transfer(reward);
    }

    emit UserAction(_predictionId, msg.sender, "claim", reward);
  }

  function punishCreator(uint256 _predictionId) internal {
    Prediction storage prediction = predictions[_predictionId];
    uint256 penalty = (prediction.totalStaked / 10);
    uint256 totalUserStakes = (prediction.totalYesStaked + prediction.totalNoStaked);

    if (totalUserStakes == 0) {
      return;
    }

    // Burn the creator's tokens in totalStaked
    prediction.totalStaked = 0;

    for (uint256 i = 0; i < stakers[_predictionId].length; i++) {
      address currentUser = stakers[_predictionId][i];
      uint256 userYesStake = shares[_predictionId][Choice.Yes][currentUser];
      uint256 userNoStake = shares[_predictionId][Choice.No][currentUser];
      uint256 userTotalStakes = userYesStake + userNoStake;

      if (userTotalStakes > 0) {
        uint256 userLoss = (penalty * userTotalStakes) / totalUserStakes;

        // Prevent underflow in the following calculations
        if (userLoss < userYesStake) {
          shares[_predictionId][Choice.Yes][currentUser] = (userYesStake - userLoss);
        } else {
          shares[_predictionId][Choice.Yes][currentUser] = 0;
        }

        if (userLoss < userNoStake) {
          shares[_predictionId][Choice.No][currentUser] = (userYesStake - userLoss);
        } else {
          shares[_predictionId][Choice.No][currentUser] = 0;
        }
      }
    }

    prediction.status = Status.Close;
  }

  function withdrawFees(uint256 _predictionId) public {
    Prediction storage prediction = predictions[_predictionId];
    require(prediction.status == Status.Resolve, "Prediction is not Resolved");
    require(msg.sender == prediction.creator, "Only the creator can withdraw fees");
    uint256 amount = prediction.fees + prediction.totalStaked;
    prediction.fees = 0;
    prediction.totalStaked = 0;
    payable(msg.sender).transfer(amount);
  }

  function resetPrediction(uint256 _predictionId) public onlyOwner {
    Prediction storage prediction = predictions[_predictionId];
    require(prediction.endTime + votingPeriod + claimingPeriod < block.timestamp, "Prediction is still active");
    require(prediction.correctAnswer == Choice.None, "Prediction already resolved");

    uint256 balance = address(this).balance;
    if (balance > 0) {
      payable(treasury).transfer(balance);
    }

    prediction.status = Status.Open;
    prediction.totalYesStaked = 0;
    prediction.totalNoStaked = 0;
    prediction.totalStaked = 0;
    prediction.fees = 0;
    prediction.correctAnswer = Choice.None;
    prediction.answer = Choice.None;
    prediction.endTime = 0;
    voteCounter = 0;
  }
}
