import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface } from "ethers";
import { parseEther } from "ethers/lib/utils.js";

const Box: NextPage = () => {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractBox = getDeployedContract(chain?.id.toString(), "MecenateBox");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");

  let boxAddress: string;
  let boxAbi: ContractInterface[] = [];

  let identityAddress: string;
  let identityAbi: ContractInterface[] = [];

  const [signature, setSignature] = React.useState<string>("");
  const [amountToSend, setAmountToSend] = React.useState<string>("");
  const [lockDuration, setLockDuration] = React.useState<string>("");
  const [haveID, setHaveID] = React.useState<boolean>(false);

  if (deployedContractBox) {
    ({ address: boxAddress, abi: boxAbi } = deployedContractBox);
  }

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  const boxCtx = useContract({
    address: boxAddress!,
    abi: boxAbi,
    signerOrProvider: signer || provider,
  });

  const identityCtx = useContract({
    address: identityAddress!,
    abi: identityAbi,
    signerOrProvider: signer || provider,
  });

  async function deposit() {
    const tx = await boxCtx?.callStatic.deposit(Number(lockDuration), { value: parseEther(amountToSend) });
    await boxCtx?.deposit(Number(lockDuration), { value: parseEther(amountToSend) });

    if (tx) {
      notification.success("Deposit Done");
    }
    setSignature(await tx);
  }

  async function withdraw() {
    const tx = await boxCtx?.withdraw(signature);
  }

  useEffect(() => {
    async function getBalance() {
      const balance = await identityCtx?.balanceOf(signer?.getAddress());
      if (balance > 0) {
        setHaveID(true);
      }
    }
    getBalance();
  }, [boxCtx]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <h1 className="text-6xl font-bold mb-8">Lock your eth into the box</h1>
        <p className="text-xl  mb-8">
          Secure Your Crypto and Plan for the Future with Our Locked Savings Contract: Lock Your ETH for Your Preferred
          Timeframe and Retrieve it with a Signature Upon Expiration!
        </p>
      </div>
      <input
        className="input w-1/2 p-2 border rounded-md shadow-sm my-2 text-primary-focus"
        placeholder="Amount"
        value={amountToSend}
        onChange={e => setAmountToSend(e.target.value)}
      />

      <input
        className="input w-1/2 p-2 border rounded-md shadow-sm my-2 text-primary-focus"
        placeholder="Lock Duration in seconds"
        value={lockDuration}
        onChange={e => setLockDuration(e.target.value)}
      />

      <input
        className="input w-1/2 p-2 border rounded-md shadow-sm my-2 text-primary-focus "
        placeholder="Signature"
        value={signature}
        onChange={e => setSignature(e.target.value)}
      />

      <button
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500  hover:bg-primary-700 my-2"
        disabled={!haveID}
        onClick={async () => {
          await deposit();
        }}
      >
        Deposit
      </button>

      <button
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 hover:bg-primary-700"
        disabled={!haveID}
        onClick={async () => {
          await withdraw();
        }}
      >
        Withdraw
      </button>
    </div>
  );
};

export default Box;
