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

  enum Choice {
    Yes,
    No,
    None,
  }

  enum Status {
    Open,
    Sumbit,
    Close,
  }

  // set type array with question tupe
  const [question, setQuestion] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [stake, setStake] = useState<string>();

  const deployedContract = getDeployedContract(chain?.id.toString(), "MecenateQuestion");

  const [creatorAnswer, setCreatorAnswer] = useState<boolean>();
  const [communityAnswer, setCommunityAnswer] = useState<number>();

  const [creatorStaked, setTotalStaked] = useState<string>();
  const [totalYesStaked, setTotalYesStaked] = useState<string>();
  const [totalNoStaked, setTotalNoStaked] = useState<string>();
  const [yesShares, setYesShares] = useState<string>();
  const [noShares, setNoShares] = useState<string>();
  const [votingPeriod, setVotingPeriod] = useState<string>();
  const [claimPeriod, setClaimPeriod] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [creator, setCreator] = useState<string>();
  const [fees, setFees] = useState<string>();
  const [prediction, setPrediction] = useState<[]>();
  const [punishmentPercentage, setPunishmentPercentage] = useState<string>();
  const [yourAnswer, setYourAnswer] = useState<boolean>();

  const [isFetch, setIsFetch] = useState<boolean>(false);

  let ctxAbi: ContractInterface[] = [];

  if (deployedContract) {
    ({ abi: ctxAbi } = deployedContract);
  }

  const ctx = useContract({
    address: String(addr),
    abi: ctxAbi,
    signerOrProvider: signer || provider,
  });

  // convert second to date
  function convertToDate(seconds: number) {
    const date = new Date(seconds * 1000);
    return date.toLocaleString();
  }

  // convert milliecond to minute
  function convertToMinute(milliSeconds: number) {
    const minutes = milliSeconds / 60;
    return minutes;
  }

  async function submit() {
    if (ctx && signer && provider && router.isReady) {
      let _creatorAnswer;
      if (yourAnswer == true) {
        _creatorAnswer = 0;
      } else {
        _creatorAnswer = 1;
      }
      const tx = await ctx?.submit(_creatorAnswer);
      await tx.wait();
    }
  }

  async function resolve() {
    if (ctx && signer && provider && router.isReady) {
      const tx = await ctx?.resolve();
      await tx.wait();
    }
  }

  async function reset() {
    if (ctx && signer && provider && router.isReady) {
      const tx = await ctx?.reset();
      await tx.wait();
    }
  }

  async function claim() {
    if (ctx && signer && provider && router.isReady) {
      const tx = await ctx?.claim();
      await tx.wait();
    }
  }
  async function vote() {
    if (ctx && signer && provider && router.isReady) {
      let _creatorAnswer;
      if (yourAnswer == true) {
        _creatorAnswer = 0;
      } else {
        _creatorAnswer = 1;
      }
      const tx = await ctx?.voteAnswer(_creatorAnswer);
      await tx.wait();
    }
  }

  const fetchData = async function fetchData() {
    try {
      if (ctx && signer && provider && router.isReady) {
        const _predictionsCount = await ctx?.questionCounter();
        console.log(Number(_predictionsCount));
        let _yesShare: any;
        let _noShare: any;
        let _creatorStaked: any;
        let _totalYesStaked: any;
        let _totalNoStaked: any;

        setTotalStaked(await ctx?.creatorStaked());
        setTotalNoStaked(await ctx?.totalNoStaked());
        setTotalYesStaked(await ctx?.totalYesStaked());
        setQuestion(await ctx?.question());
        setEndTime(await ctx?.endTime());
        setYesShares(await ctx?.shares(Choice.Yes, await signer?.getAddress()));
        setNoShares(await ctx?.shares(Choice.No, await signer?.getAddress()));
        setVotingPeriod(await ctx?.votingPeriod());
        setClaimPeriod(await ctx?.claimingPeriod());
        setFees(await ctx?.fees());
        setStatus(await ctx?.status());
        setCreatorAnswer(await ctx?.creatorAnswer());
        setCommunityAnswer(await ctx?.communityAnswer());
        setCreator(await ctx?.creator());
        setPrediction(await ctx?.getPrediction());

        console.log(prediction);

        setIsFetch(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

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
    const tx = await ctx?.create(question, endTime, Number(punishmentPercentage) * 100, {
      value: parseEther(String(stake)),
    });
  }

  async function stakePrediction() {
    let _creatorAnswer: number;
    if (creatorAnswer == true) {
      _creatorAnswer = 0;
    } else {
      _creatorAnswer = 1;
    }

    console.log(stake);

    const tx = await ctx?.stake(_creatorAnswer, { value: parseEther(String(stake)) });
  }

  async function withdrawFees() {
    const tx = await ctx?.withdrawFees();
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
          className="input-lg w-1/2 p-2 rounded-md my-2 bg-transparent"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <input
          type="text"
          className="input-lg w-1/2 p-2 rounded-md my-2 bg-transparent"
          placeholder="End Time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
        />
        <input
          type="text"
          className="input-lg w-1/2 p-2 rounded-md my-2 bg-transparent"
          placeholder="Stake"
          value={stake}
          onChange={e => setStake(e.target.value)}
        />

        <input
          type="text"
          className="input-lg w-1/2 p-2 rounded-md my-2 bg-transparent"
          placeholder="Punishment Percent"
          value={punishmentPercentage}
          onChange={e => setPunishmentPercentage(e.target.value)}
        />
        <button className="w-1/2 p-2 border border-gray-300 rounded-md my-2" onClick={createPrediction}>
          Ask
        </button>
      </div>
      <div className="flex flex-col-2 gap-4  w-full md:w-fit my-5">
        {isFetch && (
          <div className="bg-white flex flex-col shadow-md rounded-lg p-6 w-full my-2">
            <div className="font-bold text-lg mb-2">{question}</div>
            <div className="text-gray-700 mb-2">Creator: {creator}</div>

            <div className="text-gray-700 mb-2">
              Community Answer: {communityAnswer == 0 ? "Yes" : communityAnswer == 1 ? "No" : "None"}
            </div>
            <div className="text-gray-700 mb-2">
              Creator Answer: {creatorAnswer == 0 ? "Yes" : creatorAnswer == 1 ? "No" : "None"}
            </div>
            <div className="text-gray-700 mb-2">End time: {convertToDate(String(endTime))}</div>
            <div className="text-gray-700 mb-2">Voting Period: {convertToMinute(String(votingPeriod))} minutes</div>
            <div className="text-gray-700 mb-2">Claim Period: {convertToMinute(String(claimPeriod))} minutes</div>

            <div className="text-gray-700 mb-2">Total staked: {formatEther(String(creatorStaked))} ETH</div>
            <div className="text-green-700 mb-2">Total yes staked: {formatEther(String(totalYesStaked))} ETH</div>
            <div className="text-red-700 mb-2">Total no staked: {formatEther(String(totalNoStaked))} ETH</div>
            <div className="text-red-700 mb-2">Creator Fees: {formatEther(String(fees))} ETH</div>

            <div className="text-green-700 mb-2 ">Status: {getStatus(status)}</div>

            <div className="text-gray-700 mb-2">Yes shares: {String(yesShares)}</div>
            <div className="text-gray-700 mb-2">No shares: {String(noShares)}</div>
          </div>
        )}
        <div className="w-full">
          <div>
            <br></br>

            <input
              type="input text"
              className="w-min p-2 border border-gray-300 rounded-md my-2 "
              placeholder="Stake"
              value={stake}
              onChange={e => setStake(e.target.value)}
            />
            <button
              className="btn w-1/2 p-2 border border-gray-300 rounded-md"
              onClick={() => {
                stakePrediction();
              }}
            >
              Stake
            </button>
            <input
              className="checkbox mx-2 my-2"
              type="radio"
              id="yes"
              name="creatorAnswer"
              value="yes"
              onChange={e => setYourAnswer(true)}
            />
            <label htmlFor="yes">Yes</label>
            <input
              className="checkbox mx-2 my-2"
              type="radio"
              id="no"
              name="creatorAnswer"
              value="no"
              onChange={e => setYourAnswer(false)}
            />
            <label htmlFor="no">No</label>
          </div>
          <br></br>
          <div>
            <button
              className="btn  w-1/2 p-2 border border-gray-300 rounded-md"
              onClick={async () => {
                await submit();
              }}
            >
              Submit
            </button>
            <input
              className="checkbox mx-2"
              type="radio"
              id="yes"
              name="creatorAnswer"
              value="yes"
              onChange={e => setYourAnswer(true)}
            />
            <label htmlFor="yes">Yes</label>
            <input className="checkbox mx-2" type="radio" id="no" name="creatorAnswer" value="no" setYourAnswer />
            <label htmlFor="no">No</label>
          </div>
          <br></br>
          <div>
            <button
              className="btn  w-1/2 p-2 border border-gray-300 rounded-md"
              onClick={async () => {
                await vote();
              }}
            >
              Vote
            </button>
            <input
              className="checkbox mx-2"
              type="radio"
              id="yes"
              name="creatorAnswer"
              value="yes"
              onChange={e => setYourAnswer(true)}
            />
            <label htmlFor="yes">Yes</label>
            <input
              className="checkbox mx-2"
              type="radio"
              id="no"
              name="creatorAnswer"
              value="no"
              onChange={e => setYourAnswer(false)}
            />
            <label htmlFor="no">No</label>
          </div>
          <br></br>
          <div>
            <button
              className="btn hover:bg-accent-focus w-1/2 p-2 border border-gray-300 rounded-md my-2"
              onClick={async () => {
                await resolve();
              }}
            >
              Resolve
            </button>
          </div>
          <br></br>
          <button
            className="btn  w-1/2 p-2 border border-gray-300 rounded-md my-2"
            onClick={async () => {
              await claim();
            }}
          >
            Claim
          </button>
          <br></br>
          <button
            className="btn  w-1/2 p-2 border border-gray-300 rounded-md my-2"
            disabled={signer?.getAddress() == creator}
            onClick={async () => {
              await withdrawFees();
            }}
          >
            Withdraw Fees
          </button>
          <br></br>
          <button
            className="btn  w-1/2 p-2 border border-gray-300 rounded-md my-2"
            disabled={signer?.getAddress() == creator}
            onClick={async () => {
              await reset();
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
export default ViewQuestion;
