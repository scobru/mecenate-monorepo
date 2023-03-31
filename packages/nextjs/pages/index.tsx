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
import React from "react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10 font-proxima">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">M E C E N A T E</span>
          </h1>
        </div>
        <div className="flex-grow bg-base-300 w-auto mt-16 px-8 py-12">
          <div className="flex gap-2 flex-col lg:flex-row ">
            <div className="flex flex-col bg-base-100 px-20 py-5 text-center items-center max-w-xs rounded-3xl">
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
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
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

            <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
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
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
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
            <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
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
