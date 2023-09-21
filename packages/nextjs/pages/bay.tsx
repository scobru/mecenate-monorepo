import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { formatEther, keccak256, parseEther } from "ethers/lib/utils.js";
import { useAppStore } from "~~/services/store/store";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import axios from "axios";

const Bay: NextPage = () => {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const customProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const customWallet = new ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);

  const deployedContractBay = getDeployedContract(chain?.id.toString(), "MecenateBay");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractVault = getDeployedContract(chain?.id.toString(), "MecenateVault");

  const [requests, setRequests] = React.useState<BayRequest[]>([]);
  const [requestString, setRequestString] = React.useState<string>("");
  const [requestPayment, setRequestPayment] = React.useState<string>("");
  const [requestStake, setRequestStake] = React.useState<string>("");
  const [requestAddress, setRequestAddress] = React.useState<string>("");
  const [customSigner, setCustomSigner] = React.useState<any>();
  const txData = useTransactor(signer as Signer);
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);

  type BayRequest = {
    request: string;
    buyer: string;
    seller: string;
    payment: string;
    stake: string;
    postAddress: string;
    accepted: boolean;
    postCount: string;
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

  let vaultAddress!: string;
  let vaultAbi: ContractInterface[] = [];

  if (deployedContractVault) {
    ({ address: vaultAddress, abi: vaultAbi } = deployedContractVault);
  }

  const vaultCtx = useContract({
    address: vaultAddress,
    abi: vaultAbi,
    signerOrProvider: customWallet || provider,
  });

  const bayCtx = useContract({
    address: bayAddress,
    abi: bayAbi,
    signerOrProvider: customWallet || provider,
  });

  const acceptBayRequest = useCallback(
    async (index: number, address: string) => {
      if (signer) {
        const iface = new ethers.utils.Interface(deployedContractBay?.abi as any[]);
        const data = iface.encodeFunctionData("acceptRequest", [
          index,
          address,
          sismoResponse,
          keccak256(String(vaultCtx?.address)),
        ]);
        txData(vaultCtx?.execute(bayCtx?.address, data, 0, keccak256(String(sismoData.auths[0].userId))));
      }
    },
    [signer, txData, vaultCtx, bayCtx, sismoData],
  );

  const removeRequest = useCallback(
    async (index: number) => {
      const iface = new ethers.utils.Interface(deployedContractBay?.abi as any[]);
      const data = iface.encodeFunctionData("removeRequest", [
        index,
        sismoResponse,
        keccak256(String(vaultCtx?.address)),
      ]);
      txData(vaultCtx?.execute(bayCtx?.address, data, 0, keccak256(String(sismoData.auths[0].userId))));
    },
    [txData, vaultCtx, bayCtx],
  );

  const getAllRequest = useMemo(() => {
    return async () => {
      if (customProvider && deployedContractBay) {
        const _requests = await bayCtx?.getRequests();
        setRequests(_requests);
      }
    };
  }, [deployedContractBay, customProvider, bayCtx]);

  const createBayContract = useCallback(async () => {
    const _request = ethers.utils.formatBytes32String(requestString);

    const request = {
      request: _request,
      payment: parseEther(requestPayment),
      stake: parseEther(requestStake),
      postAddress: "0x0000000000000000000000000000000000000000",
      accepted: false,
      postCount: 0,
    };

    const iface = new ethers.utils.Interface(deployedContractBay?.abi as any[]);
    const data = iface.encodeFunctionData("createRequest", [
      request,
      sismoResponse,
      keccak256(String(vaultCtx?.address)),
    ]);
    txData(
      vaultCtx?.execute(
        bayCtx?.address,
        data,
        parseEther(requestPayment),
        keccak256(String(sismoData.auths[0].userId)),
      ),
    );

    getAllRequest();
    await sendPublicTelegramMessage();
  }, [requestString, requestPayment, requestStake, txData, vaultCtx, bayCtx, getAllRequest]);

  useEffect(() => {
    const fetchData = async () => {
      // Get and set data from localStorage
      setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
      setVerified(localStorage.getItem("verified"));
      setSismoResponse(localStorage.getItem("sismoResponse"));
      const storedEthWallet = await JSON.parse(String(localStorage.getItem("ethWallet")));

      console.log("Stored ethWallet: ", storedEthWallet);

      // Check if storedEthWallet and its privateKey are not null or undefined
      if (storedEthWallet && storedEthWallet?.key) {
        // Create new ethers.Wallet instance
        const instance = new ethers.Wallet(storedEthWallet?.key, customProvider);
        console.log("Instance: ", instance);
        setCustomSigner(instance);
      } else {
        console.warn("Stored ethWallet or its privateKey is undefined.");
      }
    };

    fetchData();
  }, [sismoResponse]); // include customProvider if it's expected to change over time

  useEffect(() => {
    getAllRequest();
  }, [deployedContractBay, requests, getAllRequest]);

  const sendPublicTelegramMessage = async () => {
    const url = `https://api.telegram.org/bot${String(process.env.NEXT_PUBLIC_TELEGRAM_TOKEN)}/sendMessage`;

    const message = {
      message: requestString,
      payment: requestPayment,
      stake: requestStake,
    };

    const formattedText = `<b>⭐ Bay Request</b>\n\n<b>📣 request: </b>${message.message} \n<b>⚖️ stake: </b>${message.stake} \n<b>💲 payment: </b>${message.message}`;

    try {
      const response = await axios.post(url, {
        chat_id: "@mecenate_channel",
        text: formattedText,
        parse_mode: "HTML",
      });

      console.log("Message sent:", response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    notification.success("Message sent successfully");
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black min-w-fit">
      <div className="text-center my-2 text-base-content mx-auto">
        <div className=" text-center">
          <h1 className="text-6xl font-bold mb-8">BAY</h1>
          <h1 className="text-base font-base mb-8">
            {" "}
            * All request are also posted on our{" "}
            <a href="https://t.me/mecenate_message_bot" className="link-hover font-bold">
              Telegram Channel
            </a>{" "}
          </h1>

          <p className="text-xl  mb-20">Request any data</p>
        </div>

        <div className="flex flex-col min-w-fit mx-auto items-center mb-20 ">
          <div className="card bg-slate-200 rounded-lg shadow-2xl shadow-primary py-2   p-4 m-4 text-black">
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
              className=" hover:bg-accent  font-bold py-2 px-4 rounded my-5"
              onClick={async () => {
                await createBayContract();
              }}
            >
              Create Request
            </button>
          </div>
        </div>
        <div className="grid  sm:grid-cols-1 xl:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((request, index) => {
            return (
              <div
                key={index}
                tabIndex={0}
                className="card card-bordered grid-cols-3 my-5 bg-secondary hover:bg-base-300 shadow-lg shadow-primary hover:shadow-2xl hover:scale-105 transform transition-all duration-500"
              >
                <div className="bg-primary  ">
                  <div className="text-left p-5">
                    <span className="font-light text-left">WANTED</span>
                    <div className="text-2xl font-bold">{ethers.utils.parseBytes32String(request.request)}</div>
                    <a className="link-hover" href={`/viewFeed?addr=${request.postAddress}`}>
                      {" "}
                      {request.postAddress}
                    </a>
                  </div>
                  <div className="text-right p-5">
                    <div className="text-xl font-regular">{formatEther(request.payment)} ETH</div>
                    <div className=" text-md font-light">Reward</div>
                  </div>
                </div>
                <div className="bg-secondary">
                  <div className="text-left p-5 space-y-1">
                    <div className="font-medium">
                      Fulfiller must stake <strong>{formatEther(request.stake)} ETH </strong>
                    </div>
                    <div className="font-medium">
                      Requester can pay
                      <strong> {formatEther(request.payment)} ETH </strong>
                      to destroy stake
                    </div>
                    <div className="font-medium">
                      This feed had already fullfill <strong>{String(request.postCount)}</strong> requests
                    </div>
                    <div className="font-medium">
                      Accepted: <strong>{String(request.accepted)}</strong>
                    </div>
                  </div>
                  <div className="text-right p-5 space-x-4 mt-5">
                    <div className="text-left">
                      <input
                        className="input input-primary"
                        type="text"
                        name="address"
                        placeholder="Enter Feed Address"
                        onChange={e => setRequestAddress(e.target.value)}
                      />
                    </div>
                    <button
                      className="link link-hover hover:font-semibold "
                      onClick={async () => {
                        await acceptBayRequest(index, requestAddress);
                      }}
                    >
                      accept
                    </button>
                    <button>
                      <a className="link link-hover hover:font-semibold " href={"/feeds"}>
                        answer
                      </a>
                    </button>
                    <button
                      className="link link-hover hover:font-semibold "
                      onClick={async () => {
                        await removeRequest(index);
                      }}
                    >
                      cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Bay;
