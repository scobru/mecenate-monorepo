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
  const deployedContractMuse = getDeployedContract(chain?.id.toString(), "MUSE");
  const deployedContractDai = getDeployedContract(chain?.id.toString(), "MockDAI");

  const [globalFee, setGlobalFee] = React.useState<string>("");
  const [fixedFee, setFixedFee] = React.useState<string>("");

  let identityAddress = "";
  let identityAbi: ContractInterface[] = [];

  let statsAddress = "";
  let statsAbi: ContractInterface[] = [];

  let museAddress = "";
  let museAbi: ContractInterface[] = [];

  let daiAddress = "";
  let daiAbi: ContractInterface[] = [];

  const [identityTotalSupply, setIdentityTotalSupply] = React.useState<string>("");
  const [stats, setStats] = React.useState<any>([]);

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractStats) {
    ({ address: statsAddress, abi: statsAbi } = deployedContractStats);
  }

  if (deployedContractMuse) {
    ({ address: museAddress, abi: museAbi } = deployedContractMuse);
  }

  if (deployedContractDai) {
    ({ address: daiAddress, abi: daiAbi } = deployedContractDai);
  }

  const museCtx = useContract({
    address: museAddress,
    abi: museAbi,
    signerOrProvider: signer || provider,
  });

  const daiCtx = useContract({
    address: daiAddress,
    abi: daiAbi,
    signerOrProvider: signer || provider,
  });

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

  async function mintMUSE() {
    const tx = await museCtx?.mint(signer?.getAddress(), utils.parseEther("100"));
    await tx?.wait();
  }

  async function mintDAI() {
    const tx = await daiCtx?.mint(utils.parseEther("100"));
    await tx?.wait();
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
              <div className="text-xl font-thin my-2 ">identities: {Number(stats.totalIdentities)}</div>
              <div className="text-xl font-thin my-2 ">users: {Number(stats.totalUsers)}</div>
              <div className="text-xl font-thin my-2 ">requests: {Number(stats.totalBayRequests)}</div>
              <div className="text-xl font-thin my-2 ">tiers : {Number(stats.totalTiers)}</div>
              <div className="text-xl font-thin my-2 ">feeds : {Number(stats.totalFeeds)}</div>
              <div className="text-xl font-thin my-2 ">questions : {Number(stats.totalQuestions)}</div>
              <div className="text-xl font-thin my-2 ">box deposits : {Number(stats.totalBoxDeposits)}</div>
            </div>
          </div>
        ) : null}
        <div className="flex flex-row items-center justify-center w-full flex-1 px-20 text-center">
          <button
            className="btn btn-primary btn-lg mx-2"
            onClick={() => {
              mintMUSE();
            }}
          >
            Mint MUSE
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              mintDAI();
            }}
          >
            Mint DAI
          </button>
        </div>
        <div className="flex-wrap bg-base-300  mt-2 px-8 py-12 shadow-sm">
          <div className="container p-10 mx-auto">
            <h1 className="text-3xl text-center mb-10">
              Getting Started with Identity NFT and KeyPair for Mecenate Feed
            </h1>
            <div className="flex flex-col md:flex-row justify-between">
              <div className="md:w-1/2 p-6 rounded-lg shadow-md mb-6 md:mb-0">
                <h2 className="text-xl mb-4">Create an Identity NFT</h2>
                <p className="mb-4">To create an Identity NFT, follow these steps:</p>
                <ol className="list-decimal ml-4 mb-4">
                  <li>Visit the "Identity" page</li>
                  <li>Fill in your NFT data with your information</li>
                  <li>Mint your Mecenate ID</li>
                </ol>
              </div>
              <div className="md:w-1/2 p-6 rounded-lg shadow-md">
                <h2 className="text-xl mb-4">Create a KeyPair </h2>
                <p className="mb-4">To create a KeyPair to interact with the Mecenate Feed, follow these steps:</p>
                <ol className="list-decimal ml-4 mb-4">
                  <li>Visit the "Identity" page.</li>
                  <li>Generate a new KeyPair by clicking on the "Generate KeyPair" button.</li>
                  <li>Save your KeyPair securely.</li>
                  <li>Click "Sign In".</li>
                </ol>
                <p>
                  Once you have your KeyPair, you can use it to interact with the Mecenate Feed and participate in the
                  Mecenate economy.
                </p>
              </div>
              <div className="md:w-1/2 p-6 rounded-lg shadow-md mb-6 md:mb-0">
                <h2 className="text-xl mb-4">Create a Tier</h2>
                <p className="mb-4">To create a Tier Subscription, follow these steps:</p>
                <ol className="list-decimal ml-4 mb-4">
                  <li>Visit the "Tier" page</li>
                  <li>Fill in the form with your preferences</li>
                  <li>Click "Create Subscription" and refresh the page</li>
                </ol>
                <p>
                  Once you have your tier contract deployed, you can send the link to your subscribers or use the code
                  to integrate the subscription into your dapp.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between">
              <div className="md:w-2/3 p-6 rounded-lg shadow-md mb-6 md:mb-0">
                <h2 className="text-xl mb-4">Create a Question</h2>
                <p className="mb-4">To become a host of a question, follow these steps:</p>
                <ol className="list-decimal ml-4 mb-4">
                  <li>Visit the "Question" page</li>
                  <li>Click "Create Question"</li>
                  <li>When your question contract is deployed, follow the link to your Question Page </li>
                  <li>Fill in the form with your preferences and click "Ask"</li>
                  <li>Wait until the end of the question period</li>
                  <li>Resolve your question as an oracle with the correct answer</li>
                  <li>Reset the question and create a new one</li>
                </ol>
              </div>
              <div className="md:w-1/3 p-6 rounded-lg shadow-md mb-6 md:mb-0">
                <h2 className="text-xl mb-4">Deposit into the Box</h2>
                <p className="mb-4">Folloẇ this steps:</p>
                <ol className="list-decimal ml-4 mb-4">
                  <li>Go to "Box" Page</li>
                  <li>Select an amount to lock</li>
                  <li>fill the endtime of your lock duration</li>
                  <li>Save the signature in a save Place</li>
                  <li>Wait until the lock end and return on Box Page</li>
                  <li>Past your secret signature and click "Withdraw"</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-col items-center lg:flex-row my-20 ">
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-xl shadow-lg shadow-secondary hover:bg-primary">
              <UserIcon className="h-8 w-8 fill-secondary" />
              <div className="p">
                <div className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>IDENTITY</strong>
                  </ul>
                  <br />
                  <ul>Create your own unique NFT-based identity to be able to interact with the Mecenate ecosystem.</ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-xl shadow-lg shadow-secondary hover:bg-primary">
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

            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-xl shadow-lg shadow-secondary hover:bg-primary">
              <TicketIcon className="h-8 w-8 fill-secondary" />
              <div className="p">
                <div className="font-base align-baseline text-justify-center">
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
                </div>
              </div>
            </div>
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-xl shadow-lg shadow-secondary hover:bg-primary">
              <LockClosedIcon className="h-8 w-8 fill-secondary" />
              <div className="p">
                <div className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>BOX</strong>
                  </ul>
                  <br />
                  <ul>
                    Lock up a cryptocurrency for a selected period of time. Withdraw your stake at any time, with a
                    secret signature.
                  </ul>
                  <br />
                </div>
              </div>
            </div>
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center  my-5 items-center max-w-xs rounded-xl shadow-lg shadow-secondary hover:bg-primary">
              <QuestionMarkCircleIcon className="h-8 w-8 fill-secondary" />
              <div className="p">
                <div className="font-base align-baseline text-justify-center">
                  <ul>
                    <strong>QUESTION</strong>
                  </ul>
                  <br />
                  <ul>
                    Host a question and become a trusted oracle. Any one can ask to your question. Collect Fees from the
                    answers.
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
