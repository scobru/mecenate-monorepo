import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract, useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, providers } from "ethers";
import EthCrypto from "eth-crypto";
import { AbiCoder, parseEther } from "ethers/lib/utils.js";
import { useSignMessage } from "wagmi";

const DEBUG = true;

const Box: NextPage = () => {
  const network = useNetwork();
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const deployedContractBox = getDeployedContract(chain?.id.toString(), "MecenateBox");

  let boxAddress!: string;
  let boxAbi: ContractInterface[] = [];

  const [signature, setSignature] = React.useState<string>("");
  const [balance, setBalance] = React.useState<string>("");
  const [owner, setOwner] = React.useState<string>("");
  const [receiver, setReceiver] = React.useState<string>("");
  const [sender, setSender] = React.useState<string>("");
  const [amountToSend, setAmountToSend] = React.useState<string>("");
  const [hash, setHash] = React.useState<string>("");
  const recoveredAddress = React.useRef<string>();
  const [lockDuration, setLockDuration] = React.useState<string>("");

  const { data, error, isLoading, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      setSignature(data);

      async function verifySignature() {
        if (signature !== undefined) {
          const result = await receiveDonation();
          console.log(result);
        }
      }

      verifySignature();

      const address = ethers.utils.verifyMessage(variables.message, data);
    },
  });

  if (deployedContractBox) {
    ({ address: boxAddress, abi: boxAbi } = deployedContractBox);
  }

  const boxCtx = useContract({
    address: boxAddress,
    abi: boxAbi,
    signerOrProvider: signer || provider,
  });

  async function deposit() {
    // encrypt amount to sha256

    const tx = await boxCtx?.deposit(lockDuration, { value: parseEther(amountToSend) });

    setSignature(await tx?.toString()!);
  }

  async function withdraw() {
    const tx = await boxCtx?.withdraw(signature);
    // split the ésignature using ethers
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
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
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700 my-2"
        onClick={async () => {
          await deposit();
        }}
      >
        Deposit
      </button>

      <button
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700"
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
