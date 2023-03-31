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
    <div className="flex flex-col items-center pt-10">
      <div className="flex flex-col items-center space-y-4">
        <div className="card bg-slate-200 rounded-lg shadow-2xl px-2 py-2 my-10">
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
    </div>
  );
};

export default Bay;
