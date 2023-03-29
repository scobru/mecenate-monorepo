import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract, useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";
import { formatEther } from "ethers/lib/utils.js";

const DEBUG = true;

const Question: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();

  const [questions, setQuestions] = React.useState<string[]>([]);
  const [questionsOwned, setQuestionsOwned] = React.useState<string[]>([]);
  const [showOwned, setShowOwned] = React.useState<boolean>(false);

  const deployedContractQuestion = getDeployedContract(chain?.id.toString(), "MecenateQuestion");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractFactory = getDeployedContract(chain?.id.toString(), "MecenateQuestionFactory");

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
    const _questionAddress = await factoryCtx?.createQuestion();
    if (DEBUG) console.log(_questionAddress);
  }

  async function getOwnedQuestions() {
    const _questionsOwned = await factoryCtx?.getQuestionOwned(signer?.getAddress());
    setQuestions(_questionsOwned);
    if (DEBUG) console.log(_questionsOwned);
  }

  async function getQuestion() {
    if (signer) {
      const _questions = await factoryCtx?.getQuestions();
      setQuestions(_questions);

      if (DEBUG) console.log(_questions);
    }
  }

  useEffect(() => {
    if (factoryCtx) {
      getQuestion();
    }
  }, [factoryCtx]);

  return (
    <div className="flex flex-col items-center pt-10 text-black">
      <div className="flex items-center mb-5">
        <button
          className="bg-primary  hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={createQuestionContract}
        >
          Create Question Contract
        </button>
        <button
          className="bg-primary  hover:bg-accent  font-bold py-2 px-4 rounded-md mr-2"
          onClick={getOwnedQuestions}
        >
          Owned Questions
        </button>
      </div>
      <div>
        {questions &&
          questions.map((question, index) => (
            <div key={index} className="card w-full bg-base-100 shadow-xl px-2 py-2 text-info">
              <a href={`/viewQuestion?addr=${question}`}>
                <div className="grid grid-cols-1 p-5">
                  <div className="col-span-1">
                    <div className=" mb-2">
                      <strong>Address: </strong>
                      {question}
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
