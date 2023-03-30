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
    // Make sure the user is staking a positive amount
    require(msg.value > 0, "Amount should be greater than 0");
    // Check if the prediction is still ongoing
    require(predictions[_predictionId].endTime > block.timestamp, "Prediction has ended");
    // Ensure the prediction is in the Open status
    require(predictions[_predictionId].status == Status.Open, "Prediction is not Open");

    // Calculate the creator fee (1% of the staked amount)
    uint256 creatorFeeAmount = (msg.value).mul(100).div(10000);
    // Subtract the creator fee from the staked amount
    uint256 amountAfter = (msg.value).sub(creatorFeeAmount);

    // Add the creator fee to the total fees
    predictions[_predictionId].fees += creatorFeeAmount;

    // Update the total staked amount for the user's choice (Yes or No)
    if (_choice == true) {
      predictions[_predictionId].totalYesStaked += amountAfter;
      shares[_predictionId][Choice.Yes][msg.sender] += amountAfter;
    }

    if (_choice == false) {
      predictions[_predictionId].totalNoStaked += amountAfter;
      shares[_predictionId][Choice.No][msg.sender] += amountAfter;
    }

    // Add the user to the stakers list
    stakers[_predictionId].push(msg.sender);

    // Set the user's vote to None for this prediction
    vote[_predictionId][msg.sender] = Choice.None;

    // Emit the UserAction event
    emit UserAction(_predictionId, msg.sender, "stake", amountAfter);
  }

  function resolvePrediction(uint256 _predictionId, bool _choice) public {
    // Retrieve the prediction from the mapping
    Prediction storage prediction = predictions[_predictionId];
    // Ensure the prediction is in the Open status
    require(prediction.status == Status.Open, "Prediction is not Open");
    // Make sure only the creator of the prediction can resolve it
    require(msg.sender == prediction.creator, "Only the creator can resolve the prediction");
    // Check if the prediction's end time has passed
    require(prediction.endTime <= block.timestamp, "Prediction time has not ended");
    // Ensure that the given choice is either true (Yes) or false (No)
    require(_choice == true || _choice == false, "Answer should be Yes or No");
    // Update the prediction status to Resolve
    prediction.status = Status.Resolve;
    // Set the final answer of the prediction
    if (_choice == true) {
      prediction.answer = Choice.Yes;
    } else {
      prediction.answer = Choice.No;
    }
  }

  function voteForCorrectAnswer(uint256 _predictionId, bool _choice) public {
    // Retrieve the prediction from the mapping
    Prediction storage prediction = predictions[_predictionId];
    // Ensure the prediction is in the Resolve or Close status
    require(
      prediction.status == Status.Resolve || prediction.status == Status.Close,
      "Prediction is not Resolve or Vote is Closed"
    );
    // Make sure the sender has not already voted
    require(vote[_predictionId][msg.sender] == Choice.None, "You have already voted");
    // Ensure the creator of the prediction cannot vote
    require(msg.sender != prediction.creator, "Creator cannot vote");
    // Ensure the given choice is either true (Yes) or false (No)
    require(_choice == true || _choice == false, "Answer should be Yes or No");
    // Check if the sender has shares in either Yes or No
    require(
      shares[_predictionId][Choice.Yes][msg.sender] > 0 || shares[_predictionId][Choice.No][msg.sender] > 0,
      "You have no shares to vote"
    );

    // Update the user's vote based on the provided choice
    if (_choice == true) {
      vote[_predictionId][msg.sender] = Choice.Yes;
    } else {
      vote[_predictionId][msg.sender] = Choice.No;
    }

    // Increment the global voteCounter
    voteCounter++;

    // If the current time is greater than the sum of prediction's endTime and votingPeriod, set the status to Vote
    if (block.timestamp > (prediction.endTime + votingPeriod)) {
      prediction.status = Status.Vote;
    }
  }

  function countVote(uint256 _predictionId) private {
    // Ensure there are votes to count
    require(voteCounter > 0, "No vote to count");
    // Retrieve the prediction from the mapping
    Prediction storage prediction = predictions[_predictionId];
    // Initialize the vote weights for Yes and No
    uint256 yesVoteWeight = 0;

    uint256 noVoteWeight = 0;

    // Iterate through the stakers of the given prediction
    for (uint256 i = 0; i < stakers[_predictionId].length; i++) {
      // Get the current user address
      address currentUser = stakers[_predictionId][i];
      // Get the user's shares for Yes and No
      uint256 userYesShares = shares[_predictionId][Choice.Yes][currentUser];

      uint256 userNoShares = shares[_predictionId][Choice.No][currentUser];

      // Update the vote weights based on the user's vote
      if (vote[_predictionId][currentUser] == Choice.Yes) {
        yesVoteWeight = (yesVoteWeight + userYesShares);
      } else if (vote[_predictionId][currentUser] == Choice.No) {
        noVoteWeight = (noVoteWeight + userNoShares);
      }
    }

    // Set the correctAnswer of the prediction based on the highest vote weight
    if (yesVoteWeight > noVoteWeight) {
      prediction.correctAnswer = Choice.Yes;
    } else {
      prediction.correctAnswer = Choice.No;
    }
  }

  function resolve(uint256 _predictionId) public {
    // Retrieve the prediction from the mapping
    Prediction storage prediction = predictions[_predictionId];

    // Ensure the prediction has ended and the status is "Vote"
    require(prediction.endTime <= block.timestamp, "Prediction time has not ended");
    require(prediction.status == Status.Vote, "Prediction is not Voted");

    // If there are votes to count, call the countVote function
    if (voteCounter > 0) {
      countVote(_predictionId);
    }

    // Compare the correctAnswer with the answer provided by the creator
    if (prediction.correctAnswer == prediction.answer) {
      // If both are equal, set the prediction status to "Resolve"
      prediction.status = Status.Resolve;
    } else {
      // If not equal, punish the creator and set the prediction status to "Resolve"
      punishCreator(_predictionId);
      prediction.status = Status.Resolve;
    }
  }

  function claim(uint256 _predictionId) public {
    // Retrieve the prediction from the mapping
    Prediction storage prediction = predictions[_predictionId];

    // Ensure the prediction status is "Resolve"
    require(prediction.status == Status.Resolve, "Prediction is not Resolved");

    uint256 userShares;
    uint256 reward;

    if (prediction.correctAnswer == Choice.Yes) {
      // Calculate the user's shares and reward for a correct "Yes" answer
      userShares = shares[_predictionId][Choice.Yes][msg.sender];
      require(userShares > 0, "No shares to claim");
      shares[_predictionId][Choice.Yes][msg.sender] = 0;
      reward = prediction.totalNoStaked.mul(userShares).div(1 ether);
    } else if (prediction.correctAnswer == Choice.No) {
      // Calculate the user's shares and reward for a correct "No" answer
      userShares = shares[_predictionId][Choice.No][msg.sender];
      require(userShares > 0, "No shares to claim");
      shares[_predictionId][Choice.No][msg.sender] = 0;
      reward = prediction.totalYesStaked.mul(userShares).div(1 ether);
    } else {
      revert("Prediction is not resolved yet");
    }

    // Subtract any penalties the user may have incurred
    if (penalties[_predictionId][msg.sender] > 0) {
      reward = reward - penalties[_predictionId][msg.sender];
      penalties[_predictionId][msg.sender] = 0;
    }

    // Ensure the reward is greater than 0 and transfer it to the user
    require(reward > 0, "Reward should be greater than 0");
    payable(msg.sender).transfer(reward);

    // Emit a "claim" event
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
