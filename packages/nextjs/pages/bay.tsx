import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";

const Bay: NextPage = () => {
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

  const [signerAddress, setSignerAddress] = React.useState<string>("");

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

  async function removeRequest(index: number) {
    if (signer) {
      const tx = await bayCtx?.removeRequest(index);
      if (tx) {
        notification.success("Request removed successfully");
      }
    }
  }

  async function createBayContract() {
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

      getAllRequest();
    }
  }

  async function getAllRequest() {
    const _requests = await bayCtx?.getRequests();
    setSignerAddress(String(await signer?.getAddress()));
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
    <div className="flex min-w-fit flex-col mx-auto flex-grow  text-base-content ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="min-w-fit mx-auto text-center my-2 text-base-content">
          <h1 className="text-6xl font-bold mb-8">Request any information</h1>
          <p className="text-xl  mb-8">
            Lock up a cryptocurrency reward. Anyone can respond. Destroy their stake if you don't get what you want.
          </p>
        </div>
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20 p-4 m-4">
          <div className="card bg-slate-200 rounded-lg shadow-2xl shadow-primary px-2 py-2 my-10 text-base-content p-4 m-4">
            <label className="text-black font-semibold text-sm" htmlFor="request">
              What do you want?
            </label>
            <input
              className="border-2 border-gray-300  h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2"
              type="text"
              name="request"
              placeholder="Enter Request"
              onChange={e => setRequestString(e.target.value)}
            />
            <label className="text-black font-semibold text-sm" htmlFor="request">
              Reward
            </label>
            <input
              className="border-2 border-gray-300  h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2"
              type="text"
              name="payment"
              placeholder="Enter Amount"
              onChange={e => setRequestPayment(e.target.value)}
            />
            <label className="text-black font-semibold text-sm" htmlFor="request">
              Staker Fullfill
            </label>
            <input
              className="border-2 border-gray-300  h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none my-2"
              type="text"
              name="stake"
              placeholder="Enter Amount"
              onChange={e => setRequestStake(e.target.value)}
            />
            <button
              className="bg-primary hover:bg-accent  font-bold py-2 px-4 rounded my-5"
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
            <div key={index} className="font flex flex-col   bg-primary shadow-md rounded-md text-left p-4 m-4">
              <div className="text-2xl font-medium px-2">{ethers.utils.parseBytes32String(request.request)}</div>
              <div className="my-2">👾 Buyer : {request.buyer}</div>
              <div className="my-2">🤖 Seller : {request.seller}</div>
              <div className="my-2">💸 Payment : {formatEther(request.payment)}</div>
              <div className="my-2">💰 Stake : {formatEther(request.stake)}</div>
              <div className="my-2">
                📑 Post Address :
                <a className="link-hover" href={`/viewFeed?addr=${request.postAddress}`}>
                  {" "}
                  {request.postAddress}
                </a>
              </div>
              <div className="my-2">✔️ Accepted : {String(request.accepted)}</div>
              <div className="flex flex-row space-x-4 my-4">
                <input
                  className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                  type="text"
                  name="address"
                  placeholder="Enter Address"
                  onChange={e => setRequestAddress(e.target.value)}
                />
                {request.buyer === signerAddress && (
                  <button
                    className="bg-transparent hover:bg-accent text-black font-bold py-2 px-4 rounded "
                    onClick={async () => {
                      await removeRequest(index);
                    }}
                  >
                    ❌
                  </button>
                )}
                <button
                  className="bg-secondary hover:bg-accent text-black font-bold py-2 px-4 rounded "
                  onClick={async () => {
                    await acceptBayRequest(index, requestAddress);
                  }}
                >
                  🦄 Accept
                </button>
                <a className="link-hover" href={"/feeds"}>
                  <button className="bg-secondary hover:bg-accent text-black font-bold py-2 px-4 rounded ">
                    📣 Answer
                  </button>
                </a>
              </div>
            </div>
          );
        })}
        <div className="max-w-3xl text-center my-20 text-base-content">
          <h1 className="text-6xl font-bold mb-8">Information finds you 🔮</h1>
          <p className="text-xl  mb-8">
            {" "}
            Lock up a cryptocurrency reward. Anyone in the world can fulfill it. They must stake cryptocurrency and
            upload a file containing the requested information.
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
            fulfillers can see you really have the money and will take your request seriously. (Once someone fulfills
            your request it is added to their stake and you will not get it back, you can only punish it.)
          </p>
          <p className="text-xl  mb-8">
            <strong>Fulfiller</strong> stake This is what makes Erasure Bay powerful. This is how much DAI
            cryptocurrency someone will need to deposit when fulfilling your request. You can destroy a fraction or all
            of their staked money if you are dissatisfied with what they provide. This will stop people responding with
            spam or bad information. It usually makes sense to have this be roughly 10% - 50% of the reward.
          </p>
          <p className="text-xl  mb-8">
            <strong> Punish ratio</strong> How many ETH it will cost you to destroy one dollar of the fulfiller's stake.
            For example; if you set the ratio to 0.1 and punish a fulfiller who staked 100 ETH, it will cost you 10 ETH
            to destroy their entire stake. This protects the fulfiller from reckless punishment. The default value is
            good for most requests.
          </p>
          <p className="text-xl  mb-8">
            <strong>Punish period</strong> How many days after your request is fulfilled you have to verify the quality
            of the information provided. Within this window, you may punish the fulfiller. After this time their stake
            and reward are released. You may decide to release it early if you are satisfied with the submission. The
            default value is good for most requests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bay;
