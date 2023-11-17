import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, Signer, ethers } from "ethers";
import { formatEther, keccak256, parseEther, toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import { useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import axios from "axios";
import { useAppStore } from "~~/services/store/store";
import { set } from "date-fns";
import Link from "next/link";



const Market: NextPage = () => {
  const deployedContractMarket = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateMarket");
  const deployedContractDai = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MockDai");
  const deployedContractMUSE = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MUSE");

  const [posts, setPosts] = useState([]);
  const [newFeedAddress, setNewFeedAddress] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isActiveStates, setIsActiveStates] = useState([]);


  const publicProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const runTx = useTransactor();
  const { signer } = useAppStore();

  type MarketPost = {
    feed: string;
    description: string;
    tokenId: string;
    stake: string;
    payment: string;
    postId: string;
  };

  let marketAddress!: string;
  let marketAbi: ContractInterface[] = [];

  if (deployedContractMarket) {
    ({ address: marketAddress, abi: marketAbi } = deployedContractMarket);
  }

  const fetchPosts = async () => {
    if (signer) {
      const contract = new ethers.Contract(marketAddress, marketAbi, signer);
      const loadedPosts = await contract.getPosts();
      setPosts(loadedPosts);
      console.log(loadedPosts)
    }
  };

  const createPost = async (feedAddress, description) => {
    const contract = new ethers.Contract(marketAddress, marketAbi, signer);
    const transaction = await contract.createPost(feedAddress, toUtf8Bytes(description));
    await transaction.wait(); // Wait for the transaction to be mined
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createPost(newFeedAddress, newDescription);
      fetchPosts(); // Refresh the posts list
      setNewFeedAddress('');
      setNewDescription('');
    } catch (error) {
      console.error(error);
      // Handle errors (e.g., show a message)
    }
  };
  const isPostActive = async (postIndex) => {
    const contract = new ethers.Contract(marketAddress, marketAbi, signer);
    return await contract.isActive(postIndex);
  };

  const handleCheckActive = async (index) => {
    try {
      const isActive = await isPostActive(index);

      // Crea una copia di isActiveStates e aggiorna l'elemento all'indice corrispondente
      const newIsActiveStates = [...isActiveStates];
      newIsActiveStates[index] = isActive ? "Active" : "Not Active";

      setIsActiveStates(newIsActiveStates);
    } catch (error) {
      console.error(error);
      // Gestisci eventuali errori
    }
  };


  useEffect(() => {
    if (signer) {
      fetchPosts();
    }
  }, [signer]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10  min-w-fit bg-gradient-to-tl from-blue-950 to-slate-950">
      <div className="mx-10">
        <h1 className="text-4xl mb-3 font-light text-white text-center mt-10">
          POST YOUR DATA INTO THE MARKET TO FIND BUYERS{" "}

        </h1>
        <h2 className="text-lg mb-8 font-light text-white text-center">
          Reveal what data you sell and how much you want to be paid.
        </h2>
        <div className="card card-body bg-gradient-to-br from-blue-950 to-slate-700 opacity-95 my-5 w-full mx-auto shadow-lg ">
          <form onSubmit={handleSubmit} className="form-control ">
            <label className="label mb-2">
              <span className="label-text">Feed Address</span>
            </label>
            <input
              type="text"
              placeholder="Feed address"
              className="input input-bordered"
              value={newFeedAddress}
              onChange={(e) => setNewFeedAddress(e.target.value)}
            />

            <label className="label mt-5 mb-2">
              <span className="label-text">What are you selling?</span>
            </label>
            <input
              type="text"
              placeholder="Description"
              className="input input-bordered"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <button type="submit" className="btn btn-custom mt-4">
              Create Post
            </button>
          </form>
        </div>
        <div className="card card-compact w-full mx-auto bg-gradient-to-tl from-blue-900 to-slate-900 shadow-xl">
          {posts.map((post, index) => (
            <div key={index} className="card card-body transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
              <div className="card-body compact">
                {/*  Post {index} */}
                <div className="form-control text-4xl">
                  <Link href={`http://localhost:3000/viewFeed?addr=${post.feed}`}>
                    {toUtf8String(post.description)}
                  </Link>
                </div>
                <details className="mt-4">
                  <summary>More details</summary>
                  <div className="p-5">
                    <div className="form-control">
                      <span className="label-text ">Feed</span>
                      {post.feed}
                    </div>
                    <div className="form-control ">
                      <span className="label-text mt-4">Token</span>
                      {post.tokenId == "0" ? "ETH" : post.tokenId == "1" ? "MUSE" : "DAI"}
                    </div>
                    <div className="form-control">
                      <span className="label-text mt-4">Seller Stake</span>
                      {`${formatEther(post.stake)} ETH`}
                    </div>
                    <div className="form-control">
                      <span className="label-text mt-4">Payment Requested</span>
                      {`${formatEther(post.payment)} ETH`}
                    </div>
                    <div className="form-control">
                      <span className="label-text mt-4">Post ID</span>
                      {post.postId}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCheckActive(index)}
                    className="btn btn-custom mt-4 transition duration-300 ease-in-out hover:bg-blue-700"
                  >
                    check active
                  </button>

                  {isActiveStates[index] && (
                    <div className="alert-success mt-4 text-center p-2 h-15">
                      <div className="flex-1 font-semibold">
                        <label>{isActiveStates[index]}</label>
                      </div>
                    </div>)
                  }
                </details>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Market;
