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

  const [identityTotalSupply, setIdentityTotalSupply] = React.useState<string>("");
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

  const identityCtx = useContract({
    address: identityAddress,
    abi: identityAbi,
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
      </Head>

      <div className="flex items-center flex-col flex-grow rounded-sm pt-10 font-proxima">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-6xl font-bold">M E C E N A T E</span>
          </h1>
        </div>
        {stats ? (
          <div className="card flex-col w-auto bg-primary px-10 py-10 text-4xl font-semibold shadow-xl shadow-black rounded-3xl text-left my-4 ">
            <div className="row row-1 items-center min-w-fit">
              <div className="stats shadow  my-2 mx-2 min-w-fit">
                <div className="stat ">
                  <div className="stat-title font-bold">TREASURY</div>
                  <div className="stat-value">
                    {String(Number(Number(stats.treasuryBalance) / 1e18).toFixed(3))} ETH
                  </div>
                  <div className="stat-desc">earned across all fee's product.</div>
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
            <div className="flex flex-col items-center gap-10  lg:flex-row px-5 ">
              <div className="text-3xl font-thin my-5 ">identities: {Number(stats.totalIdentities)}</div>
              <div className="text-3xl font-thin my-5 ">requests: {Number(stats.totalBayRequests)}</div>
              <div className="text-3xl font-thin my-5 ">tiers : {Number(stats.totalTiers)}</div>
              <div className="text-3xl font-thin my-5 ">feeds : {Number(stats.totalFeeds)}</div>
              <div className="text-3xl font-thin my-5 ">questions : {Number(stats.totalQuestions)}</div>
              <div className="text-3xl font-thin my-5 ">box deposits : {Number(stats.totalBoxDeposits)}</div>
            </div>
          </div>
        ) : null}
        <div className="flex-grow bg-base-300  mt-16 px-8 py-12 shadow-sm">
          <div className="flex gap-4 flex-col items-center lg:flex-row my-20 ">
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-3xl shadow-lg shadow-slate-300">
              <UserIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>IDENTITY</strong>
                  </ul>
                  <br />
                  <ul>Create your own unique NFT-based identity to be able to interact with the Mecenate ecosystem.</ul>
                </p>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-3xl shadow-lg shadow-slate-300">
              <MegaphoneIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="font-base align-baseline text-justify-center">
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
                </p>
              </p>
            </div>

            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-3xl shadow-lg shadow-slate-300">
              <TicketIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>TIERS</strong>
                  </ul>
                  <br />
                  <ul>
                    Mecenate is the perfect solution for creators seeking to monetize their content and fans looking to
                    support their favorite creators. With our smart contract platform, creators can set their own
                    subscription fee and duration, while fans can subscribe with just a few clicks to gain access to
                    exclusive content.
                  </ul>
                  <br />
                </p>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-3xl shadow-lg shadow-slate-300">
              <LockClosedIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>BOX</strong>
                  </ul>
                  <br />
                  <ul>
                    Lock up a cryptocurrency for a selected period of time. Withdraw your stake at any time, with a
                    secret signature.
                  </ul>
                  <br />
                </p>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-3xl shadow-lg shadow-slate-300">
              <QuestionMarkCircleIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>QUESTION</strong>
                  </ul>
                  <br />
                  <ul>
                    Host a question and become a trusted oracle. Any one can ask to your question. Collect Fees from the
                    answers.
                  </ul>
                  <br />
                </p>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
