import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image"
import { Square3Stack3DIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect } from "react";
import { useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";

const Home: NextPage = () => {
  const deployedContractStats = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateStats");
  const [stats, setStats] = React.useState<any>([]);
  const publicProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  let statsAddress = "";
  let statsAbi: ContractInterface[] = [];

  if (deployedContractStats) {
    ({ address: statsAddress, abi: statsAbi } = deployedContractStats);
  }

  const statsCtx = useContract({
    address: statsAddress,
    abi: statsAbi,
    signerOrProvider: publicProvider,
  });

  const getStats = useCallback(async () => {
    const stats = await statsCtx?.getStats();
    setStats(stats);
  }, [statsCtx]);

  useEffect(() => {
    getStats();
  }, [getStats, statsCtx]);

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
        {/*         <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';" />
         */}{" "}
      </Head>

      <div className="flex w-full items-center flex-col rounded-sm bg-gradient-to-tl from-blue-950 to-slate-950 ">
        <div className="w-full p-5  bg-fixed bg-cover bg-center mx-auto ">
          <h1 className="text-center my-20 ">
            <span className="block text-4xl  mx-auto  w-fit lg:text-7xl md:text-6xl sm:text-4xl xl:text-8xl font-bold">
              ℳ E C E N A T E
            </span>
          </h1>

          <div className="flex justify-between  mx-auto w-96">
            <Image src="/assets/sismo.png" width="50" height="50" />
            <Image src="/assets/base.png" width="50" height="50" />
            <Image src="/assets/eas.png" width="50" height="50" />
          </div>


          {stats ? (
            <div className="text-2xl font-semibold rounded-xl text-left my-5  p-2  w-fit mx-auto bg-gradient-to-br from-blue-950 to-slate-700 opacity-80 ">
              <div className="flex-wrap items-center min-w-fit  lg:text-3xl md:text-4xl text-xl ">
                <div className="stats  mx-2 min-w-fit bg-inherit  ">
                  <div className="stat gap-3">
                    <div className="stat-title  lg:text-3xl md:text-4xl text-xl  ">TREASURY</div>
                    <div className="stat-value lg:text-3xl md:text-4xl text-xl font-number ">
                      {String(Number(Number(stats.treasuryBalance) / 1e18).toFixed(3))} ETH
                    </div>
                    <div className="stat-desc  text-base">earned across all fee&apos;s product.</div>
                  </div>
                </div>
                <div className="stats  mx-2 min-w-fit bg-inherit ">
                  <div className="stat gap-3 ">
                    <div className="stat-title font-bold  ">FEE</div>
                    <div className="stat-value lg:text-3xl md:text-4xl text-xl font-number">
                      {String(Number(stats.globalFee) / 10000)}%
                    </div>
                    <div className="stat-desc text-base "> Percent Protocol Fee</div>
                  </div>
                </div>
                <div className="stats  mx-2 min-w-fit bg-inherit">
                  <div className="stat gap-3">
                    <div className="stat-title font-bold lg:text-3xl md:text-4xl text-xl  ">TAX</div>
                    <div className="stat-value lg:text-3xl md:text-4xl text-xl font-number">
                      {" "}
                      {String(Number(stats.fixedFee) / 1e18)} ETH
                    </div>
                    <div className="stat-desc text-base "> Fixed Protocol Tax </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap mx-auto items-center gap-2 text-center  lg:flex-row px-5 md:text-3xl text-xl ">
                <div className="font-thin my-2  ">
                  users: <span className="font-number">{Number(stats.totalUsers)}</span>
                </div>
                <div className="font-thin my-2 ">
                  requests: <span className="font-number">{Number(stats.totalBayRequests)}</span>
                </div>{" "}
                <div className="font-thin my-2 ">
                  feeds:<span className="font-number"> {Number(stats.totalFeeds)}</span>
                </div>{" "}
              </div>
            </div>
          ) : null}
        </div>

        <div className="w-screen bg-doors bg-cover bg-fixed">
          <div className="xl:w-6/12 md:8/12 lg:10/12 sm:12/12 mx-auto bg-gradient-to-br from-blue-950 to-slate-800 opacity-95 ">
            <div className="p-10 my-20 w-screen">
              <h2 className="text-6xl sm:text-xl   ">Getting Started</h2>
              <h2 className="text-3xl font-light   ">with Mecenate</h2>
              <p className="mb-4 text-2xl font-semibold  ">Follow these steps to begin your journey:</p>
              <br />
              <ol className="list-decimal ml-4 px-8 text-xl font-extralight">
                <li>Navigate to the "Identity" section</li>
                <li>Connect with Sismo to generate your Zero-Knowledge Proof (ZKP)</li>
                <li>Create your key pair and sign in</li>
                <li>Set up your seller feed or browse requests in the marketplace</li>
              </ol>
            </div>
          </div>
          <div className="max-w-3xl my-5 bg-gradient-to-br from-blue-950 to-slate-700 p-10 flex-col mx-auto text-center  text-base-content">
            <h1 className="text-7xl font-extrabold mb-20 font-heading">Data Privacy and Security</h1>
            <h1 className="text-3xl font-extralight mb-20">Redefined.</h1>
            <p className="text-3xl mb-20 font-extralight text-left  hover:text-base-content font-heading ">
              <strong>Mecenate Feeds </strong> allows me to securely and privately post my information and receive
              payments directly from interested parties without any intermediaries.
            </p>
            <p className="text-2xl mb-8 font-thin text-left hover:text-base-content">
              With Mecenate Protocol, I can be confident that my information is protected and that I&apos;m getting fair
              compensation for it.
            </p>
          </div>
        </div>
        <div className="min-w-fit mx-auto text-center my-20 text-base-content">
          <h1 className="text-6xl font-bold">Request</h1>
          <div className="content-slider w-52 ">
            <div className="slider">
              <div className="mask">
                <ul>
                  <li className="anim1">
                    <div className="quote">Secrets Code</div>
                    <div className="quote">Technical Assistance</div>
                    <div className="quote">Clean Data</div>
                    <div className="source">- Fair</div>
                  </li>
                  <li className="anim2">
                    <div className="quote">Personalized Tutorials.</div>
                    <div className="quote">Custom Artwork</div>
                    <div className="quote">Video Proof</div>
                    <div className="source">- Unstoppable</div>
                  </li>
                  <li className="anim3">
                    <div className="quote">Private Keys</div>
                    <div className="quote">Hiring Reccomandation</div>
                    <div className="quote">Cryptopunks</div>
                    <div className="source">- Censorship-Proof</div>
                  </li>
                  <li className="anim4">
                    <div className="quote">Dank Memes</div>
                    <div className="quote">Paywalled Content</div>
                    <div className="quote">Homework Solutions</div>
                    <div className="source">- Decentralized</div>
                  </li>
                  <li className="anim5">
                    <div className="quote">Unique Dataset</div>
                    <div className="quote">State Secrets</div>
                    <div className="quote">Sourdough Recipe</div>
                    <div className="source">- Anonymous</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xl mb-8">
            Lock up a cryptocurrency reward. Anyone can respond. Destroy their stake if you don&apos;t get what you
            want.
          </p>
        </div>
        <div className="w-screen p-5 bg-cyborg bg-fixed">
          <div className="flex p-5 flex-col bg-gradient-to-tl from-blue-950 to-slate-900 opacity-95 items-center text-center py-10 xl:w-6/12 md:8/12 lg:10/12 sm:12/12 mx-auto ">
            <MegaphoneIcon className="h-20 w-20 fill-secondary" />
            <div className="p">
              <div className="font-base align-baseline text-justify-center my-5">
                <ul>
                  <div className="text-6xl font-extrabold mb-5">BAY</div>
                </ul>
                <br />
                <ul className="text-xl font-light">
                  An open marketplace for information of any kind. It can be used to create credible signals over
                  possession of local knowledge and attract a buyer willing to pay for it.
                  <br />
                  <br />
                  <strong>Mecenate BAY</strong> is build on top of:
                  <br />
                  <br />
                  <Square3Stack3DIcon className="h-8 w-8 fill-secondary mx-auto" />
                  <strong>Mecenate FEEDS</strong>
                </ul>
                <br />
              </div>
            </div>
          </div>
        </div>
        <div className="w-screen  bg-center ">
          <div className="flex flex-col xl:w-6/12 md:8/12 lg:10/12 sm:12/12  p-10  text-left  my-5  bg-gradient-to-bl from-slate-800 to-slate-950 opacity-95 mx-auto">
            <h1 className="text-4xl font-extrabold mb-8 text-left ">INFORMATIONS FINDS YOU 🔮</h1>
            <p className="text-2xl  mb-8">
              {" "}
              Lock up a cryptocurrency reward. Anyone in the world can fulfill it. They must stake cryptocurrency and
              upload a file containing the requested information.
            </p>
            <p className="text-3xl  mb-8">
              Release the reward if you are satisfied with the upload. Destroy their stake if you are dissatisfied 🔥
            </p>
            <p className="text-2xl  mb-8">
              Mecenate Bay is decentralized, encrypted, and unstoppable. All requests are public.
            </p>
            <h2 className="text-2xl font-semibold mb-4">Make a request 📣</h2>
          </div>
        </div>
        <div className="w-screen backdrop-opacity-50 backdrop-blur-2xl bg-bazaar bg-cover bg-fixed">
          <div className="flex flex-col xl:w-6/12 md:8/12 lg:10/12 sm:12/12  p-10  text-left  my-5  bg-gradient-to-bl from-slate-800 to-slate-950 opacity-95 mx-auto">
            <div className="text-3xl font-bold my-10">HOW IT WORKS?</div>
            <p className="text-xl  mb-8">
              <strong>Question</strong> Enter a short explanation of what you&apos;re looking for. This can include
              links, Twitter handles and hastags. Make your descriptions as clear as possible.
            </p>
            <p className="text-xl  mb-8">
              <strong>Reward</strong> An amount of ETH cryptocurrency you are locking up as a reward. This will be
              transferred into an escrow when you make the request, you make sure you have this in your wallet. Like
              this fulfillers can see you really have the money and will take your request seriously. (Once someone
              fulfills your request it is added to their stake and you will not get it back, you can only punish it.)
            </p>
            <p className="text-xl  mb-8">
              <strong>Fulfiller</strong> stake This is what makes Mecenate Bay powerful. This is how much ETH
              cryptocurrency someone will need to deposit when fulfilling your request. You can destroy a fraction or
              all of their staked money if you are dissatisfied with what they provide. This will stop people responding
              with spam or bad information. It usually makes sense to have this be roughly 10% - 50% of the reward.
            </p>
            <p className="text-xl  mb-8">
              <strong> Punish ratio</strong> How many ETH it will cost you to destroy one dollar of the fulfiller&apos;s
              stake. For example; if you set the ratio to 0.1 and punish a fulfiller who staked 100 ETH, it will cost
              you 10 ETH to destroy their entire stake. This protects the fulfiller from reckless punishment. The
              default value is good for most requests.
            </p>
            <p className="text-xl  mb-8">
              <strong>Punish period</strong> How many days after your request is fulfilled you have to verify the
              quality of the information provided. Within this window, you may punish the fulfiller. After this time
              their stake and reward are released. You may decide to release it early if you are satisfied with the
              submission. The default value is good for most requests.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
