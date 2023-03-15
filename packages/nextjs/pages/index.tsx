import type { NextPage } from "next";
import Head from "next/head";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">M E C E N A T E</span>
          </h1>
          <p className="text-center  text-lg w-1/3 justify-center mx-auto">
            Mecenate is the perfect solution for creators seeking to monetize their content and fans looking to support
            their favorite creators. With our smart contract platform, creators can set their own subscription fee and
            duration, while fans can subscribe with just a few clicks to gain access to exclusive content. Join us today
            on the Ethereum blockchain and start earning or supporting your favorite creators in a fair and transparent
            way!
          </p>
        </div>

        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl font-bold my-5">Get Started</span>
          </h1>
          <p className="text-center text-lg justify-center mx-auto">
            <li>Mint Your Creator Identity NFT</li>
            <li>Create your subscription for your fan</li>
            <button className="btn btn-primary my-5">
              <a href="/createMecenate">Create</a>
            </button>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="text-center">
                  <ul>
                    <strong>CREATORS</strong>
                  </ul>
                  <br />
                  <ul>Set your own subscription fee and duration</ul>
                  <br />
                  <ul>Complete control over your earnings</ul>
                  <br />
                  <ul>Built-in revenue sharing model ensures fair compensation for your hard work</ul>
                  <br />
                  <ul>Easy Smart Contract Implementation</ul>
                </p>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SparklesIcon className="h-8 w-8 fill-secondary" />
              <p>
                <p className="text-center">
                  <ul>
                    <strong>FAN</strong>
                  </ul>
                  <br />
                  <ul>Subscribe with just a few clicks</ul>
                  <br />
                  <ul>Easy-to-use platform requires no technical knowledge</ul>
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
