import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { MecenateInterface } from "../../hardhat/typechain-types/contracts/Mecenate";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";
import mecenateABI from "../generated/mecenateABI.json";
import { formatEther, parseEther } from "ethers/lib/utils";

const ViewQuestion: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const router = useRouter();
  const { addr } = router.query;

  const DEBUG = true;

  type Prediction = {
    question: string;
    correctAnswer: Choice;
    answer: Choice;
    endTime: string;
    creator: string;
    totalStaked: string;
    totalYesStaked: string;
    totalNoStaked: string;
    status: Status;
    fees: number;
  };

  enum Choice {
    Yes,
    No,
    None,
  }

  enum Status {
    Open,
    Resolve,
    Vote,
    Close,
  }

  // set type array with question tupe
  const [predictions, setPredictions] = useState<Prediction>();
  const [question, setQuestion] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [predictionsList, setPredictionsList] = useState<Prediction[]>([]);
  const [stake, setStake] = useState<string>();
  const deployedContract = getDeployedContract(chain?.id.toString(), "MecenateQuestion");
  const [answer, setAnswer] = useState<Boolean>(false);
  let ctxAbi: ContractInterface[] = [];

  if (deployedContract) {
    ({ abi: ctxAbi } = deployedContract);
  }

  const ctx = useContract({
    address: String(addr),
    abi: ctxAbi,
    signerOrProvider: signer || provider,
  });

  const fetchData = async function fetchData() {
    if (ctx && signer && provider && router.isReady) {
      const _predictionsCount = await ctx?.predictionCount();
      console.log(Number(_predictionsCount));
      for (let i = 0; i < Number(_predictionsCount); i++) {
        const _predictions = await ctx?.predictionList(i);
        setPredictionsList(prevState => [...prevState, _predictions]);
      }
      console.log(predictionsList);
      console.log("hi");
    }
  };

  async function getYesShares(predictionId: number) {
    const yesShare = await ctx?.shares(predictionId, Choice.Yes, await signer?.getAddress());
    console.log("Yes Share ", Number(yesShare));
    return yesShare;
  }

  async function getNoShares(predictionId: number) {
    const noShare = ctx?.shares(predictionId, Choice.No, await signer?.getAddress());
    console.log("No Share ", Number(noShare));
    return noShare;
  }

  function getChoice(choice: number) {
    if (choice === 0) {
      return "Yes";
    }
    if (choice === 1) {
      return "No";
    }
    return "None";
  }

  function getStatus(status: number) {
    if (status === 0) {
      return "Open";
    }
    if (status === 1) {
      return "Resolve";
    }
    if (status === 2) {
      return "Vote";
    }
    return "Close";
  }

  async function createPrediction() {
    const tx = await ctx?.createPrediction(question, endTime, { value: parseEther(String(stake)) });
  }

  async function stakePrediction(predictionId: number) {
    const tx = await ctx?.stake(predictionId, answer, { value: parseEther(String(stake)) });
  }

  useEffect(() => {
    try {
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }, [ctx, router.isReady]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="flex flex-col items-center justify-center w-full">
        <input
          type="text"
          className="w-1/2 p-2 border border-gray-300 rounded-md"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <input
          type="text"
          className="w-1/2 p-2 border border-gray-300 rounded-md"
          placeholder="End Time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
        />
        <input
          type="text"
          className="w-1/2 p-2 border border-gray-300 rounded-md"
          placeholder="Stake"
          value={stake}
          onChange={e => setStake(e.target.value)}
        />
        <button className="w-1/2 p-2 border border-gray-300 rounded-md" onClick={createPrediction}>
          Create Prediction
        </button>
      </div>
      <div className="card w-full md:w-fit my-5">
        {predictionsList.map((prediction, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6 w-full my-2">
            <div className="font-bold text-lg mb-2">{prediction.question}</div>
            <div className="text-gray-700 mb-2">Correct answer: {getChoice(prediction.correctAnswer)}</div>
            <div className="text-gray-700 mb-2">User answer: {getChoice(prediction.answer)}</div>
            <div className="text-gray-700 mb-2">End time: {String(prediction.endTime)}</div>
            <div className="text-gray-700 mb-2">Creator: {prediction.creator}</div>
            <div className="text-gray-700 mb-2">Total staked: {formatEther(String(prediction.totalStaked))}</div>
            <div className="text-green-700 mb-2">Total yes staked: {String(prediction.totalYesStaked)}</div>
            <div className="text-red-700 mb-2">Total no staked: {Number(prediction.totalNoStaked)}</div>
            <div className="text-green-700 mb-2 ">Status: {getStatus(prediction.status)}</div>
            <div className="text-gray-700">Fees: {formatEther(Number(prediction.fees))}</div>
            <div className="text-gray-700">Yes shares: {Number(getYesShares(index))}</div>
            <div className="text-gray-700">No shares: {Number(getNoShares(index))}</div>

            <input
              type="text"
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Stake"
              value={stake}
              onChange={e => setStake(e.target.value)}
            />
            <input type="radio" id="yes" name="answer" value="yes" onChange={e => setAnswer(true)} />
            <label htmlFor="yes">Yes</label>
            <input type="radio" id="no" name="answer" value="no" onChange={e => setAnswer(false)} />
            <label htmlFor="no">No</label>
            <button
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              onClick={() => {
                stakePrediction(index);
              }}
            >
              Stake
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ViewQuestion;
