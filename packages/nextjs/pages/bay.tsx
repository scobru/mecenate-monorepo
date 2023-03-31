import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
const DEBUG = true;

const Bay: NextPage = () => {
  const network = useNetwork();
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractBay = getDeployedContract(chain?.id.toString(), "MecenateBay");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");

  const [requests, setRequests] = React.useState<BayRequest[]>([]);
  const [singleRequest, setSingleRequest] = React.useState<BayRequest>();

  const [requestString, setRequestString] = React.useState<string>("");
  const [requestPayment, setRequestPayment] = React.useState<string>("");
  const [requestStake, setRequestStake] = React.useState<string>("");
  const [requestAddress, setRequestAddress] = React.useState<string>("");

  type BayRequest = {
    request: string;
    buyer: string;
    seller: string;
    payment: string;
    stake: string;
    postAddress: string;
    accepted: boolean;
  };

  let bayAddress!: string;
  let bayAbi: ContractInterface[] = [];

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  if (deployedContractBay) {
    ({ address: bayAddress, abi: bayAbi } = deployedContractBay);
  }

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  const bayCtx = useContract({
    address: bayAddress,
    abi: bayAbi,
    signerOrProvider: signer || provider,
  });

  const identityCtx = useContract({
    address: identityAddress,
    abi: identityAbi,
    signerOrProvider: signer || provider,
  });

  async function acceptBayRequest(index: number, address: string) {
    if (signer) {
      const tx = await bayCtx?.acceptRequest(index, address);
      if (tx) {
        notification.success("Request accepted successfully");
      }
    }
  }

  async function createBayContract() {
    const abicoder = new ethers.utils.AbiCoder();
    //const _request =  abicoder.encode(["string"], [requestString]);
    // econde bytes32
    const _request = ethers.utils.formatBytes32String(requestString);
    console.log(_request);

    if (signer) {
      const request = {
        request: _request,
        buyer: await signer?.getAddress(),
        seller: "0x0000000000000000000000000000000000000000",
        payment: parseEther(requestPayment),
        stake: parseEther(requestStake),
        postAddress: "0x0000000000000000000000000000000000000000",
        accepted: false,
        postCount: 0,
      };

      const tx = await bayCtx?.createRequest(request, { value: parseEther(requestPayment) });

      if (tx) {
        notification.success("Request created successfully");
      }
    }
  }

  async function getAllRequest() {
    const _requests = await bayCtx?.getRequests();
    setRequests(_requests);
  }

  async function getRequestByAddress() {
    const _request = await bayCtx?.getRequestByAddress(identityCtx?.address);
    setRequests(_request);
  }

  useEffect(() => {
    if (bayCtx) {
      getAllRequest();
      console.log(requests);
    }
  }, [bayCtx, signer]);

  return (
    <div className="flex flex-col items-center pt-10 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <h1 className="text-6xl font-bold mb-8">Request any information</h1>
        <p className="text-xl  mb-8">
          Lock up a cryptocurrency reward. Anyone can respond. Destroy their stake if you don't get what you want.
        </p>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="card bg-slate-200 rounded-lg shadow-2xl shadow-primary px-2 py-2 my-10">
          <label className="text-black font-semibold text-sm" htmlFor="request">
            What do you want?
          </label>
          <input
            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2"
            type="text"
            name="request"
            placeholder="Enter Request"
            onChange={e => setRequestString(e.target.value)}
          />
          <label className="text-black font-semibold text-sm" htmlFor="request">
            Reward
          </label>
          <input
            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2"
            type="text"
            name="payment"
            placeholder="Enter Amount"
            onChange={e => setRequestPayment(e.target.value)}
          />
          <label className="text-black font-semibold text-sm" htmlFor="request">
            Staker Fullfill
          </label>
          <input
            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2"
            type="text"
            name="stake"
            placeholder="Enter Amount"
            onChange={e => setRequestStake(e.target.value)}
          />
          <button
            className="bg-primary hover:bg-accent text-black font-bold py-2 px-4 rounded my-5"
            onClick={async () => {
              await createBayContract();
            }}
          >
            Create Request
          </button>
        </div>
      </div>
      {requests.map((request, index) => {
        return (
          <div key={index} className="text-black font flex flex-col space-y-2 p-4 bg-primary shadow-md rounded-md">
            <div className="text-lg font-medium">{ethers.utils.parseBytes32String(request.request)}</div>
            <div>👾 Buyer : {request.buyer}</div>
            <div>🤖 Seller : {request.seller}</div>
            <div>💸 Payment : {formatEther(request.payment)}</div>
            <div>💰 Stake : {formatEther(request.stake)}</div>
            <div>
              📑 Post Address :
              <a className="link-hover" href={`/viewFeed?addr=${request.postAddress}`}>
                {" "}
                {request.postAddress}
              </a>
            </div>
            <div>✔️ Accepted : {String(request.accepted)}</div>
            <div className="flex space-x-4 mt-4">
              <input
                className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                type="text"
                name="address"
                placeholder="Enter Address"
                onChange={e => setRequestAddress(e.target.value)}
              />
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={async () => {
                  await acceptBayRequest(index, requestAddress);
                }}
              >
                Accept Bay Contract
              </button>
            </div>
          </div>
        );
      })}
      <div className="max-w-3xl text-center my-20 text-base-content">
        <h1 className="text-6xl font-bold mb-8">Information finds you 🔮</h1>
        <p className="text-xl  mb-8">
          {" "}
          Lock up a cryptocurrency reward. Anyone in the world can fulfill it. They must stake cryptocurrency and upload
          a file containing the requested information.
        </p>
        <p className="text-xl  mb-8">
          Release the reward if you are satisfied with the upload. Destroy their stake if you are dissatisfied 🔥
        </p>
        <p className="text-xl  mb-8">
          Mecenate Bay is decentralized, encrypted, and unstoppable. All requests are public.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Make a request 📣</h2>
      </div>
      <div className="flex-grow bg-base-300 max-w-3xl mt-16 px-8 py-12">
        <p className="text-xl  mb-8">
          <strong>Question</strong> Enter a short explanation of what you're looking for. This can include links,
          Twitter handles and hastags. Make your descriptions as clear as possible.
        </p>
        <p className="text-xl  mb-8">
          <strong>Reward</strong> An amount of ETH cryptocurrency you are locking up as a reward. This will be
          transferred into an escrow when you make the request, you make sure you have this in your wallet. Like this
          fulfillers can see you really have the money and will take your request seriously. (Once someone fulfills your
          request it is added to their stake and you will not get it back, you can only punish it.)
        </p>
        <p className="text-xl  mb-8">
          <strong>Fulfiller</strong> stake This is what makes Erasure Bay powerful. This is how much DAI cryptocurrency
          someone will need to deposit when fulfilling your request. You can destroy a fraction or all of their staked
          money if you are dissatisfied with what they provide. This will stop people responding with spam or bad
          information. It usually makes sense to have this be roughly 10% - 50% of the reward.
        </p>
        <p className="text-xl  mb-8">
          <strong> Punish ratio</strong> How many ETH it will cost you to destroy one dollar of the fulfiller's stake.
          For example; if you set the ratio to 0.1 and punish a fulfiller who staked 100 ETH, it will cost you 10 ETH to
          destroy their entire stake. This protects the fulfiller from reckless punishment. The default value is good
          for most requests.
        </p>
        <p className="text-xl  mb-8">
          <strong>Punish period</strong> How many days after your request is fulfilled you have to verify the quality of
          the information provided. Within this window, you may punish the fulfiller. After this time their stake and
          reward are released. You may decide to release it early if you are satisfied with the submission. The default
          value is good for most requests.
        </p>
      </div>
    </div>
  );
};

export default Bay;
