import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, Signer, ethers } from "ethers";
import { formatEther, keccak256, parseEther } from "ethers/lib/utils.js";
import { useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
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
  const deployedContractDai = getDeployedContract(chain?.id.toString(), "MockDai");
  const deployedContractMUSE = getDeployedContract(chain?.id.toString(), "MUSE");
  const [requests, setRequests] = React.useState<BayRequest[]>([]);
  const [requestString, setRequestString] = React.useState<string>("");
  const [requestPayment, setRequestPayment] = React.useState<string>("");
  const [requestStake, setRequestStake] = React.useState<string>("");
  const [requestAddress, setRequestAddress] = React.useState<string>("");
  const [, setCustomSigner] = React.useState<any>();
  const txData = useTransactor(signer as Signer);
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);
  const [tokenId, setTokenId] = React.useState<number>(0);
  const [nonce, setNonce] = React.useState<number>(0);
  const [withdrawalAddress, setWithdrawalAddress] = React.useState<string>("");

  type BayRequest = {
    request: string;
    buyer: string;
    seller: string;
    payment: string;
    stake: string;
    postAddress: string;
    accepted: boolean;
    postCount: string;
    tokenId: number;
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

  let daiAddress!: string;
  let daiAbi: ContractInterface[] = [];

  if (deployedContractDai) {
    ({ address: daiAddress, abi: daiAbi } = deployedContractDai);
  }

  let museAddress!: string;
  let museAbi: ContractInterface[] = [];

  if (deployedContractMUSE) {
    ({ address: museAddress, abi: museAbi } = deployedContractMUSE);
  }

  const vaultCtx = useContract({
    address: vaultAddress,
    abi: vaultAbi,
    signerOrProvider: customWallet,
  });

  const bayCtx = useContract({
    address: bayAddress,
    abi: bayAbi,
    signerOrProvider: customWallet,
  });

  const daiCtx = useContract({
    address: daiAddress,
    abi: daiAbi,
    signerOrProvider: customWallet,
  });

  const museCtx = useContract({
    address: museAddress,
    abi: museAbi,
    signerOrProvider: customWallet,
  });

  const acceptBayRequest = async (index: number, address: string) => {
    if (signer) {
      const iface = new ethers.utils.Interface(deployedContractBay?.abi as any[]);
      const data = iface.encodeFunctionData("acceptRequest", [index, address, sismoResponse, withdrawalAddress, nonce]);
      txData(vaultCtx?.execute(bayCtx?.address, data, 0, keccak256(String(sismoData.auths[0].userId))));
    }
  };

  const removeRequest = async (index: number) => {
    const iface = new ethers.utils.Interface(deployedContractBay?.abi as any[]);
    const data = iface.encodeFunctionData("removeRequest", [
      index,
      sismoResponse,
      keccak256(String(vaultCtx?.address)),
    ]);
    txData(vaultCtx?.execute(bayCtx?.address, data, 0, keccak256(String(sismoData.auths[0].userId))));
  };

  const getAllRequest = useMemo(() => {
    return async () => {
      if (customProvider && deployedContractBay) {
        const _requests = await bayCtx?.getRequests();
        setRequests(_requests);
      }
    };
  }, [deployedContractBay, bayCtx]);

  const createBayContract = async () => {
    const _request = ethers.utils.formatBytes32String(requestString);

    const request = {
      request: _request,
      payment: parseEther(requestPayment),
      stake: parseEther(requestStake),
      postAddress: "0x0000000000000000000000000000000000000000",
      accepted: false,
      postCount: 0,
      tokenId: tokenId,
    };

    const iface = new ethers.utils.Interface(deployedContractBay?.abi as any[]);
    const data = iface.encodeFunctionData("createRequest", [request, sismoResponse, withdrawalAddress, nonce]);
    txData(
      vaultCtx?.execute(
        bayCtx?.address,
        data,
        tokenId == 0 ? parseEther(requestPayment) : 0,
        keccak256(String(sismoData.auths[0].userId)),
      ),
    );

    await sendPublicTelegramMessage();
  };

  useEffect(() => {
    const fetchData = async () => {
      // Get and set data from localStorage
      setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
      setNonce(String(localStorage.getItem("nonce")));
      setWithdrawalAddress(String(localStorage.getItem("withdrawalAddress")));
      setVerified(localStorage.getItem("verified"));
      setSismoResponse(localStorage.getItem("sismoResponse"));
    };

    fetchData();
  }, [sismoResponse]); // include customProvider if it's expected to change over time

  useEffect(() => {
    getAllRequest();
  }, [deployedContractBay, getAllRequest]);

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

  const handleSelectToken = async (e: any) => {
    const token = e;
    if (token === "ETH") {
      setTokenId(0);
    } else if (token === "MUSE") {
      setTokenId(1);
    } else if (token === "DAI") {
      setTokenId(2);
    }
  };

  const handleApproveToken = async () => {
    let _tokenAddress;
    if (tokenId == 1) {
      _tokenAddress = process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE;
    } else if (tokenId == 2) {
      _tokenAddress = process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE;
    }

    console.log(_tokenAddress);
    console.log(parseEther(requestPayment));
    console.log(bayCtx?.address);

    const iface = new ethers.utils.Interface(deployedContractVault?.abi as any[]);
    const data = iface.encodeFunctionData("approveTokenToFeed", [
      _tokenAddress,
      parseEther(requestPayment),
      bayCtx?.address,
      keccak256(sismoData.auths[0].userId),
    ]);
    txData(vaultCtx?.execute(vaultCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
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
              Currency
            </label>
            <select
              className="select select-text bg-transparent my-4"
              name="tokens"
              id="tokens"
              onChange={e => handleSelectToken(e.target.value)}
            >
              <option value="Nan">Select Token</option>
              <option value="ETH">ETH</option>
              <option value="DAI">DAI</option>
              <option value="MUSE">MUSE</option>
            </select>

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

            <button
              className="btn btn-large hover:bg-accent  font-bold py-2 px-4 rounded my-5"
              onClick={async () => {
                await handleApproveToken();
              }}
            >
              Approve
            </button>
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
                      Fulfiller must stake{" "}
                      <strong>
                        {formatEther(request.stake)}{" "}
                        {request.tokenId == 0 ? "ETH" : "DAI" ? request.tokenId == 2 : "MUSE"}{" "}
                      </strong>
                    </div>
                    <div className="font-medium">
                      Requester can pay
                      <strong>
                        {" "}
                        {formatEther(request.payment)}{" "}
                        {request.tokenId == 0 ? "ETH" : "DAI" ? request.tokenId == 2 : "MUSE"}{" "}
                      </strong>
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
