import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useContract, useNetwork } from 'wagmi';
import { getDeployedContract } from '../components/scaffold-eth/Contract/utilsContract';
import { Contract, ContractInterface, Signer, ethers } from 'ethers';
import { notification } from '~~/utils/scaffold-eth';
import { useRouter } from 'next/router';
import {
  formatEther,
  keccak256,
  parseEther,
  toUtf8Bytes,
  toUtf8String,
} from 'ethers/lib/utils.js';
import { useTransactor } from '~~/hooks/scaffold-eth';
import { useWeb3auth } from '../components/Web3authProvider'; // Aggiusta il percorso in base alla tua struttura di cartelle
import { useAppStore } from '~~/services/store/store';
import { format } from 'date-fns';

const Timestamps: NextPage = () => {
  const router = useRouter();
  const [feed, setFeed] = React.useState<string>('');
  const [postId, setPostId] = React.useState<string>('');
  const { signer, setSigner } = useAppStore();
  const [result, setResult] = React.useState<any>(null);
  const deployedContractFeed = getDeployedContract(
    String(process.env.NEXT_PUBLIC_CHAIN_ID),
    'MecenateFeed',
  );
  const runTx = useTransactor();

  let feedAddress!: string;
  let feedAbi: ContractInterface[] = [];

  if (deployedContractFeed) {
    ({ address: feedAddress, abi: feedAbi } = deployedContractFeed);
  }

  const getPostResult = async () => {
    const contract = new Contract(
      feed,
      deployedContractFeed?.abi as ContractInterface,
      signer,
    );
    try {
      const result = await contract.getPostTimestamp(postId);
      setResult(result);
    } catch (e) {
      console.error(e);
      setResult('Error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-tl from-blue-950 to-slate-950 min-w-full min-h-screen">
      <h1 className="text-4xl mb-3 font-light text-white   text-center mt-10">
        VERIFY TIMESTAMPS{' '}
      </h1>
      <h1 className="text-lg  mb-8  font-light text-white  text-center ">
        Input the feed address, the hash of the post that you want to verify.
      </h1>
      <div className="w-1/4">
        <input
          type="text"
          className="input input-text w-96 mb-4"
          placeholder="Feed"
          onChange={e => {
            setFeed(e.target.value);
          }}
        />
        <input
          type="text"
          className="input input-text w-96 mb-4"
          placeholder="Post ID"
          onChange={e => {
            setPostId(e.target.value);
          }}
        />
        <button className="btn btn-custom w-fit mb-4" onClick={getPostResult}>
          Get post timestamp
        </button>
        <div className="card  w-96 bg-gradient-to-br from-blue-950 to-slate-700 opacity-80 my-5 border-1">
          {result && result.postResult && result.creationTimeStamp && (
            <div className="card-body">
              <h3 className="card-title">Result</h3>
              <p>
                {result?.postResult == 0
                  ? 'Nan'
                  : result?.postResult == 1
                  ? '💫 Valid '
                  : 'Punished ❌'}
              </p>
              <h2 className="card-title">Start</h2>
              <p>
                {format(
                  new Date(Number(result?.creationTimeStamp) * 1000),
                  '🕜 dd/MM/yyyy HH:mm:ss',
                )}
              </p>
              <h2 className="card-title">End</h2>
              <p>
                {format(
                  new Date(Number(result?.endTimeStamp) * 1000),
                  '🕝 dd/MM/yyyy HH:mm:ss',
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timestamps;
