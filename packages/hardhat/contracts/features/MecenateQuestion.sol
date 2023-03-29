pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MecenateQuestion is Ownable {
  using SafeMath for uint256;

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
  mapping(uint256 => mapping(address => uint256)) public penalties;

  Prediction[] public predictionList;

  uint256 public voteCounter;
  uint256 public predictionCount;
  uint256 public votingPeriod = 5 days;
  uint256 public claimingPeriod = 1 days;
  address public treasury;

  constructor(address _treasury, address _creator) {
    treasury = _treasury;
    _transferOwnership(_creator);
  }

  function createPrediction(string memory _question, uint256 _endTime) external payable {
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

    stakers[predictionCount].push(msg.sender);
    predictionList.push(predictions[predictionCount]);
    predictionCount++;
  }

  function stake(uint256 _predictionId, bool _choice) external payable {
    require(msg.value > 0, "Amount should be greater than 0");
    require(predictions[_predictionId].endTime > block.timestamp, "Prediction has ended");
    require(predictions[_predictionId].status == Status.Open, "Prediction is not Open");

    // subtract creator Fee
    uint256 creatorFeeAmount = (msg.value).mul(100).div(10000);
    uint256 amountAfter = (msg.value).sub(creatorFeeAmount);

    predictions[_predictionId].fees += creatorFeeAmount;

    if (_choice == true) {
      predictions[_predictionId].totalYesStaked += amountAfter;
      shares[_predictionId][Choice.Yes][msg.sender] += amountAfter;
    }

    if (_choice == false) {
      predictions[_predictionId].totalNoStaked += amountAfter;
      shares[_predictionId][Choice.No][msg.sender] += amountAfter;
    }

    stakers[_predictionId].push(msg.sender);

    vote[_predictionId][msg.sender] = Choice.None;

    emit UserAction(_predictionId, msg.sender, "stake", amountAfter);
  }

  function resolvePrediction(uint256 _predictionId, bool _choice) public {
    Prediction storage prediction = predictions[_predictionId];
    require(prediction.status == Status.Open, "Prediction is not Open");
    require(msg.sender == prediction.creator, "Only the creator can resolve the prediction");
    require(prediction.endTime <= block.timestamp, "Prediction time has not ended");
    require(_choice == true || _choice == false, "Answer should be Yes or No");
    prediction.status = Status.Resolve;
    if (_choice == true) {
      prediction.answer = Choice.Yes;
    } else {
      prediction.answer = Choice.No;
    }
  }

  function voteForCorrectAnswer(uint256 _predictionId, bool _choice) public {
    Prediction storage prediction = predictions[_predictionId];
    require(
      prediction.status == Status.Resolve || prediction.status == Status.Close,
      "Prediction is not Resolve or Vote is Closed"
    );
    require(vote[_predictionId][msg.sender] == Choice.None, "You have already voted");
    require(msg.sender != prediction.creator, "Creator cannot vote");
    require(_choice == true || _choice == false, "Answer should be Yes or No");
    require(
      shares[_predictionId][Choice.Yes][msg.sender] > 0 || shares[_predictionId][Choice.No][msg.sender] > 0,
      "You have no shares to vote"
    );

    if (_choice == true) {
      vote[_predictionId][msg.sender] = Choice.Yes;
    } else {
      vote[_predictionId][msg.sender] = Choice.No;
    }

    voteCounter++;

    if (block.timestamp > (prediction.endTime + votingPeriod)) {
      prediction.status = Status.Vote;
    }
  }

  function countVote(uint256 _predictionId) private {
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
    if (voteCounter > 0) {
      countVote(_predictionId);
    }
    if (prediction.correctAnswer == prediction.answer) {
      prediction.status = Status.Resolve;
    } else {
      punishCreator(_predictionId);
      prediction.status = Status.Resolve;
    }
  }

  function claim(uint256 _predictionId) public {
    Prediction storage prediction = predictions[_predictionId];
    require(prediction.status == Status.Resolve, "Prediction is not Resolved");
    uint256 userShares;
    uint256 reward;

    if (prediction.correctAnswer == Choice.Yes) {
      userShares = shares[_predictionId][Choice.Yes][msg.sender];
      require(userShares > 0, "No shares to claim");
      shares[_predictionId][Choice.Yes][msg.sender] = 0;
      reward = (prediction.totalNoStaked / 1 ether) * userShares;
    } else if (prediction.correctAnswer == Choice.No) {
      userShares = shares[_predictionId][Choice.No][msg.sender];
      require(userShares > 0, "No shares to claim");
      shares[_predictionId][Choice.No][msg.sender] = 0;
      reward = (prediction.totalYesStaked / 1 ether) * userShares;
    } else {
      revert("Prediction is not resolved yet");
    }

    if (penalties[_predictionId][msg.sender] > 0) {
      reward = reward - penalties[_predictionId][msg.sender];
      penalties[_predictionId][msg.sender] = 0;
    }

    require(reward > 0, "Reward should be greater than 0");
    payable(msg.sender).transfer(reward);

    emit UserAction(_predictionId, msg.sender, "claim", reward);
  }

  function punishCreator(uint256 _predictionId) private {
    Prediction storage prediction = predictions[_predictionId];
    uint256 penalty = prediction.totalStaked / 10;

    // Distribute the penalty equally to all stakers
    uint256 stakerCount = stakers[_predictionId].length;
    if (stakerCount == 0) {
      return;
    }

    uint256 userLoss = penalty / stakerCount;
    for (uint256 i = 0; i < stakerCount; i++) {
      address currentUser = stakers[_predictionId][i];
      if (shares[_predictionId][Choice.Yes][currentUser] + shares[_predictionId][Choice.No][currentUser] > 0) {
        penalties[_predictionId][currentUser] += userLoss;
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

    uint256 predictionBalance = prediction.totalYesStaked + prediction.totalNoStaked + prediction.fees;
    if (predictionBalance > 0) {
      payable(treasury).transfer(predictionBalance);
    }

    prediction.status = Status.Open;
    prediction.totalYesStaked = 0;
    prediction.totalNoStaked = 0;
    prediction.totalStaked = 0;
    prediction.fees = 0;
    prediction.correctAnswer = Choice.None;
    prediction.answer = Choice.None;
    voteCounter = 0;
  }

  receive() external payable {}
}
