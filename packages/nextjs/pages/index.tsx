import type { NextPage } from "next";
import Head from "next/head";
import {
  QuestionMarkCircleIcon,
  LockClosedIcon,
  TicketIcon,
  UserIcon,
  Square3Stack3DIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract, useBalance, useContractRead } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractStats = getDeployedContract(chain?.id.toString(), "MecenateStats");

  const [globalFee, setGlobalFee] = React.useState<string>("");
  const [fixedFee, setFixedFee] = React.useState<string>("");

  let identityAddress = "";
  let identityAbi: ContractInterface[] = [];

  let statsAddress = "";
  let statsAbi: ContractInterface[] = [];

  const [stats, setStats] = React.useState<any>([]);

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractStats) {
    ({ address: statsAddress, abi: statsAbi } = deployedContractStats);
  }

  const statsCtx = useContract({
    address: statsAddress,
    abi: statsAbi,
    signerOrProvider: signer || provider,
  });

  async function getStats() {
    const stats = await statsCtx?.getStats();
    setStats(stats);
  }

  useEffect(() => {
    getStats();
  }, [statsCtx]);

  return (
    <>
      <Head>
        <title>M E C E N A T E</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      </Head>

      <div className="flex items-center flex-col flex-grow rounded-sm pt-10 font-proxima">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-6xl font-bold">ℳ E C E N A T E</span>
          </h1>
        </div>

        {stats ? (
          <div className="card flex-col w-auto  px-10 py-10 text-4xl font-semibold rounded-xl text-left my-4 ">
            <div className="flex-wrap items-center min-w-fit">
              <div className="stats shadow  my-2 mx-2 min-w-fit">
                <div className="stat ">
                  <div className="stat-title font-bold">TREASURY</div>
                  <div className="stat-value">
                    {String(Number(Number(stats.treasuryBalance) / 1e18).toFixed(3))} ETH
                  </div>
                  <div className="stat-desc">earned across all fee&apos;s product.</div>
                </div>
              </div>
              <div className="stats shadow  my-2 mx-2 min-w-fit">
                <div className="stat">
                  <div className="stat-title font-bold">FEE</div>
                  <div className="stat-value">{String(Number(stats.globalFee) / 10000)} %</div>
                  <div className="stat-desc"> Percent Protocol Fee</div>
                </div>
              </div>
              <div className="stats shadow  my-2 mx-2 min-w-fit">
                <div className="stat">
                  <div className="stat-title font-bold">TAX</div>
                  <div className="stat-value"> {String(Number(stats.fixedFee) / 1e18)} ETH</div>
                  <div className="stat-desc"> Fixed Protocol Tax </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2  lg:flex-row px-5 ">
              <div className="text-xl font-thin my-2 ">users: {Number(stats.totalUsers)}</div>
              <div className="text-xl font-thin my-2 ">requests: {Number(stats.totalBayRequests)}</div>{" "}
              <div className="text-xl font-thin my-2 ">feeds : {Number(stats.totalFeeds)}</div>{" "}
            </div>
          </div>
        ) : null}
        <div className="container p-10 mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-1/2 p-6 ì mb-6 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">Get started</h2>
              <p className="mb-4 text-2xl font-semibold">To use Mecenate Protocol follow this step:</p>
              <ol className="list-decimal ml-4 mb-4 px-8  text-xl font-light ">
                <li>Visit the "Identity" page</li>
                <li>Join with Sismo and create your zkp</li>
                <li>Sign In into Mecenate protocol</li>
                <li>Create your feed as seller or ask for a request on bay</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="flex-wrap bg-base-300 w-full  mt-2 px-8 py-12 shadow-sm">
          <div className="flex gap-2 flex-col items-center text-center lg:flex-row ">
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-md rounded-xl shadow-lg shadow-secondary mx-auto hover:bg-primary">
              <MegaphoneIcon className="h-8 w-8 fill-secondary" />
              <div className="p">
                <div className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>BAY</strong>
                  </ul>
                  <br />
                  <ul>
                    An open marketplace for information of any kind. It can be used to create credible signals over
                    possession of local knowledge and attract a buyer willing to pay for it.
                    <div className="divider"></div>
                    <strong>Mecenate BAY</strong> is build on top of:
                    {""}
                    <Square3Stack3DIcon className="h-8 w-8 fill-secondary mx-auto" /> <strong>Mecenate FEEDS</strong>
                  </ul>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
