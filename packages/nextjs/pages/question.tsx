import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers, utils } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";

const DEBUG = true;

const Question: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [questions, setQuestions] = React.useState<string[]>([]);

  const [questionData, setQuestionData] = React.useState<any>([]);
  const [creationFee, setCreationFee] = React.useState<string>("");

  const deployedContractQuestion = getDeployedContract(chain?.id.toString(), "MecenateQuestion");
  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateQuestionFactory");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");

  let treasuryAddress = "";
  let treasuryAbi: ContractInterface[] = [];

  let factoryAddress!: string;
  let factoryAbi: ContractInterface[] = [];

  let questionAddress!: string;
  let questionAbi: ContractInterface[] = [];

  if (deployedContractFactory) {
    ({ address: factoryAddress, abi: factoryAbi } = deployedContractFactory);
  }

  if (deployedContractQuestion) {
    ({ address: questionAddress, abi: questionAbi } = deployedContractQuestion);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  const treasuryCtx = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  const factoryCtx = useContract({
    address: factoryAddress,
    abi: factoryAbi,
    signerOrProvider: signer || provider,
  });

  const questionCtx = useContract({
    address: questionAddress,
    abi: questionAbi,
    signerOrProvider: signer || provider,
  });

  async function createQuestionContract() {
    console.log(Number(creationFee));
    const _questionAddress = await factoryCtx?.createQuestion({ value: String(creationFee) });
    if (DEBUG) console.log(_questionAddress);
  }

  async function getOwnedQuestions() {
    const _questionsOwned = await factoryCtx?.getQuestionOwned(signer?.getAddress());
    setQuestions(_questionsOwned);
    const _data = [];

    for (let i = 0; i < _questionsOwned.length; i++) {
      const contract = new ethers.Contract(_questionsOwned[i], questionAbi[0], provider);
      const _questionData = await contract?.getPrediction();
      _data.push(_questionData);
    }
    setQuestionData(_data);
    console.log(questionData);
    if (DEBUG) console.log(_questionsOwned);
  }

  async function getQuestion() {
    if (signer) {
      const _questions = await factoryCtx?.getQuestions();
      setQuestions(_questions);
      const _data = [];

      for (let i = 0; i < _questions.length; i++) {
        const contract = new ethers.Contract(_questions[i], questionAbi[0], provider);
        const _questionData = await contract?.getPrediction();
        _data.push(_questionData);
      }
      setQuestionData(_data);
      setCreationFee(await treasuryCtx?.fixedFee());
      console.log(questionData);

      if (DEBUG) console.log(_questions);
    }
  }

  useEffect(() => {
    if (factoryCtx) {
      getQuestion();
    }
  }, [factoryCtx]);

  function convertToDate(seconds: number) {
    const date = new Date(seconds * 1000);
    return date.toLocaleString();
  }

  return (
    <div className="flex flex-col items-center pt-10 text-black p-2 m-2">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <h1 className="text-6xl font-bold mb-8">Ask any question</h1>
        <p className="text-xl  mb-8">
          Introducing MecenateQuestion: A Decentralized Prediction Market with Punishment Mechanism 🌐💡🔥
        </p>
        <p className="text-xl  mb-8">
          Empower the wisdom of the crowd through MecenateQuestion - a decentralized prediction market built on
          Ethereum.
        </p>
        <p className="text-xl  mb-8">
          Users can stake funds on various outcomes and vote on the correct answer. If the community&apos;s answer
          doesn&apos;t match the creator&apos;s answer, a punishment mechanism gets triggered to disincentivize false
          information. Stake, vote, and claim rewards in a fair, transparent, and unstoppable environment.
        </p>
      </div>
      <div className="flex items-center mb-20">
        <button
          className="bg-primary text-base-content  hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={createQuestionContract}
        >
          Create Question
        </button>
        <button
          className="bg-primary text-base-content  hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={getOwnedQuestions}
        >
          Owned Questions
        </button>
      </div>
      <div>
        {questions &&
          questions.map((question, index) => (
            <div key={index} className="card w-full bg-neutral shadow-xl px-2 py-2 text-base-content mb-20">
              <a href={`/viewQuestion?addr=${question}`}>
                <div className="grid grid-cols-1 p-5 text-lg">
                  <div className="col-span-1">
                    <div className=" mb-2">
                      <strong>Address: </strong>
                      {question}

                      {questionData[index] && (
                        <div>
                          <br />
                          <strong>Question: </strong>
                          {questionData[index].question}
                          <br />
                          <br />
                          Ratio: {formatEther(String(questionData[index].penaltyRatio))}
                          <br />
                          Stake: {formatEther(String(questionData[index].predictionTotalStaked))}
                          <br />
                          Punish: {formatEther(String(questionData[index].punishPercentage))} %
                          <br />
                          endtime: {convertToDate(questionData[index].predictionEndTime)}
                          <br />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1"></div>
                </div>
              </a>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Question;
