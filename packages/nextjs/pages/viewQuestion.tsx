import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";
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
  const [yourQuestion, setYourQuestion] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [stake, setStake] = useState<string>();
  const deployedContract = getDeployedContract(chain?.id.toString(), "MecenateQuestion");
  const deployedTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");

  const [creatorAnswer, setCreatorAnswer] = useState<boolean>();
  const [yourAnswer, setYourAnswer] = useState<boolean>();
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
  const [isFetch, setIsFetch] = useState<boolean>(false);
  const [creationFee, setCreationFee] = useState<string>();

  let ctxAbi: ContractInterface[] = [];

  let treasuryAddress;
  let treasuryAbi: ContractInterface[] = [];

  if (deployedContract) {
    ({ abi: ctxAbi } = deployedContract);
  }

  if (deployedTreasury) {
    ({ abi: treasuryAbi, address: treasuryAddress } = deployedTreasury);
  }

  const ctx = useContract({
    address: String(addr),
    abi: ctxAbi,
    signerOrProvider: signer || provider,
  });

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
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
        setCreationFee(await treasury?.fixedFee());

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
    const tx = await ctx?.create(yourQuestion, endTime, Number(punishmentPercentage) * 100, {
      value: parseEther(String(stake)),
    });
  }

  async function stakePrediction() {
    let _creatorAnswer: number;
    if (yourAnswer == true) {
      _creatorAnswer = 0;
    } else if (yourAnswer == false) {
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
    <div className="flex mx-auto flex-col min-w-fit flex-grow pt-10 p-4 m-4">
      <div className="card  border-2 border-gray-500 my-5 px-10 py-10 shadow-2xl shadow-secondary">
        <h1 className="text-6xl font-bold my-10 text-left mx-auto">Ask</h1>
        <input
          type="text"
          className="input-lg lg:w-full p-2 border rounded-md my-2 bg-transparent "
          placeholder="Question"
          onChange={e => setYourQuestion(e.target.value)}
        />
        <input
          type="text"
          className="input-lg lg:w-full p-2 border rounded-md my-2 bg-transparent "
          placeholder="End Time"
          onChange={e => setEndTime(e.target.value)}
        />
        <input
          type="text"
          className="input-lg lg:w-full p-2 border rounded-md my-2 bg-transparent "
          placeholder="Stake"
          onChange={e => setStake(e.target.value)}
        />

        <input
          type="text"
          className="input-lg lg:w-full p-2 border rounded-md my-2 bg-transparent "
          placeholder="Punishment Percent"
          value={punishmentPercentage}
          onChange={e => setPunishmentPercentage(e.target.value)}
        />
        <button className="btn   w-full p-2 border border-gray-300 rounded-md my-2" onClick={createPrediction}>
          Ask
        </button>
      </div>
      <div className="flex flex-col gap-4 min-w-fit my-5 ">
        {isFetch && (
          <div className="card w-auto border-2 border-gray-500 my-5 px-10 py-10 shadow-2xl shadow-secondary">
            <h1 className="text-6xl font-bold my-10">Question</h1>
            <div className="font-bold text-lg mb-2">{question}</div>
            <div className=" mb-2">
              <strong>CREATOR:</strong> {creator}
            </div>
            <br></br>
            <div className=" mb-2">
              <strong>COMMUNITY ANSWER:</strong> {communityAnswer == 0 ? "Yes" : communityAnswer == 1 ? "No" : "None"}
            </div>
            <div className=" mb-2">
              <strong>CREATOR ANSWER:</strong> {creatorAnswer == 0 ? "Yes" : creatorAnswer == 1 ? "No" : "None"}
            </div>
            <br></br>

            <div className=" mb-2">
              <strong>END TIME:</strong> {convertToDate(String(endTime))}
            </div>
            <div className=" mb-2">
              <strong>VOTING DURATION:</strong> {convertToMinute(String(votingPeriod))} minutes
            </div>
            <div className=" mb-2">
              <strong>CLAIM DURATION:</strong> {convertToMinute(String(claimPeriod))} minutes
            </div>
            <br></br>

            <div className=" mb-2">
              <strong>CREATOR STAKE</strong> {formatEther(String(creatorStaked))} ETH
            </div>
            <div className=" mb-2">
              <strong>YES STAKED:</strong> {formatEther(String(totalYesStaked))} ETH
            </div>
            <div className=" mb-2">
              <strong>NO STAKED:</strong> {formatEther(String(totalNoStaked))} ETH
            </div>
            <br></br>

            <div className=" mb-2">
              <strong>CREATOR FEES:</strong> {formatEther(String(fees))} ETH
            </div>

            <div className=" mb-2 ">
              <strong>STATUS:</strong> {getStatus(status)}
            </div>
            <br></br>

            <div className=" mb-2">
              <strong>YES SHARES:</strong> {String(yesShares)}
            </div>
            <div className=" mb-2">
              {" "}
              <strong>NO SHARES:</strong> {String(noShares)}
            </div>
          </div>
        )}

        <div className="card w-auto border-2 border-gray-500 my-5 px-10 py-10">
          <h1 className="text-6xl font-bold">Operation</h1>
          <div>
            <p className="text-justify mx-2">Stake Amount for the correct answer.</p>
            <input
              type="input text"
              className="input-bordered w-min p-2 border-2 border-gray-500 rounded-md my-2 mx-2 "
              placeholder="Stake"
              value={stake}
              onChange={e => setStake(e.target.value)}
            />
            <br />
            <button
              className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
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
          <p className="text-justify mx-2">Submit the correct answer.</p>
          <div>
            <button
              className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
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
          <p className="text-justify mx-2">Vote the correct answer.</p>
          <div>
            <button
              className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
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
          <p className="text-justify mx-2">Resolve the question.</p>
          <div>
            <button
              className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
              onClick={async () => {
                await resolve();
              }}
            >
              Resolve
            </button>
          </div>
          <p className="text-justify mx-2">Claim Rewards.</p>
          <button
            className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
            onClick={async () => {
              await claim();
            }}
          >
            Claim
          </button>
          <p className="text-justify mx-2">Withdraw Fees.</p>
          <button
            className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
            disabled={signer?.getAddress() == creator}
            onClick={async () => {
              await withdrawFees();
            }}
          >
            Withdraw Fees
          </button>
          <p className="text-justify mx-2">Reset Question.</p>{" "}
          <button
            className="btn w-1/2 p-2 border border-gray-300 rounded-md my-2 mx-2"
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
