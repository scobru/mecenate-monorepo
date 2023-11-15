import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, Signer, ethers } from "ethers";
import { formatEther, hexlify, keccak256, parseEther, toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import { useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import axios from "axios";
import { useAppStore } from "~~/services/store/store";
import pinataSDK from "@pinata/sdk";
import MecenateHelper from "@scobru/crypto-ipfs";

import generateStealthAddress from "~~/utils/stealthAddress";
import { verifyStealthAddress, generateKeyPairFromSeed } from "~~/utils/stealthAddress";
import { run } from "node:test";

const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;

const Pay: NextPage = () => {
  const deployedContractBay = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenatePay");
  const deployedContractUsers = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateUsers");
  const deployedContractDai = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MockDai");
  const deployedContractMUSE = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MUSE");

  const [receiver, setReceiver] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [hash, setHash] = React.useState<string>("");

  const [encrypted, setEncrypted] = React.useState<any>("");

  const [needSetup, setNeedSetup] = React.useState<boolean>(true);

  const [kp, setKP] = React.useState<string>("")
  const publicProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const runTx = useTransactor();

  const { signer } = useAppStore();

  type BayRequest = {
    encryptedData: string;
    pubKey: string;
  };

  let payAddress!: string;
  let payAbi: ContractInterface[] = [];

  let usersAddress!: string;
  let usersAbi: ContractInterface[] = [];

  if (deployedContractBay) {
    ({ address: payAddress, abi: payAbi } = deployedContractBay);
  }

  if (deployedContractUsers) {
    ({ address: usersAddress, abi: usersAbi } = deployedContractUsers);
  }

  let daiAddress!: string;
  let daiAbi: ContractInterface[] = [];

  if (deployedContractDai) {
    ({ address: daiAddress, abi: daiAbi } = deployedContractDai);
  }

  let museAddress!: string;
  let museAbi: ContractInterface[] = [];

  if (deployedContractMUSE) {
    ({ address: museAddress, abi: museAbi } = deployedContractMUSE);
  }

  const payCtx = useContract({
    address: payAddress,
    abi: payAbi,
    signerOrProvider: signer,
  });

  const daiCtx = useContract({
    address: daiAddress,
    abi: daiAbi,
    signerOrProvider: signer,
  });

  const museCtx = useContract({
    address: museAddress,
    abi: museAbi,
    signerOrProvider: signer,
  });

  const userCtx = useContract({
    address: usersAddress,
    abi: usersAbi,
    signerOrProvider: signer,
  });


  const setup = async () => {
    let kp = await generateKeyPairFromSeed(publicProvider, signer);

    kp.publicKey = ethers.utils.base64.encode(kp.publicKey);
    kp.secretKey = ethers.utils.base64.encode(kp.secretKey);

    setKP(JSON.stringify(kp));
    setNeedSetup(false);
  }

  const sendPayment = async () => {
    // get Public Key of address from MecenateUser
    const pubKey = await userCtx?.getUserPublicKey(receiver);

    const stealthResponse = await generateStealthAddress(toUtf8String(pubKey), JSON.parse(kp).secretKey, JSON.parse(kp).publicKey);

    setEncrypted(stealthResponse)

    console.log(stealthResponse)

    return

    // send payment to computedAddress
    const tx = {
      to: stealthResponse.address,
      // Converti l'importo in Ether in Wei
      value: ethers.utils.parseEther(amount)
    };

    await signer.sendTransaction(tx);

    // Invia la transazione
    //const txResponse = await signer.sendTransaction(tx);

    const json_payData_v100 = {
      encryptedData: stealthResponse.encryptedR,
      nonce: stealthResponse.nonce,
      pubKey: JSON.parse(kp).publicKey, // seller public key
    };

    console.log("JSON: " + JSON.stringify(json_payData_v100));

    const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);
    const pinataAuth = await pinata.testAuthentication();

    if (pinataAuth.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    console.log("Saving proof JSON...");

    notification.success("Saving proof JSON...");

    const pin = await pinata.pinJSONToIPFS(json_payData_v100);

    console.log("Pinata Pin Result: " + JSON.stringify(pin));

    const proofHash58 = await MecenateHelper.multihash({
      input: JSON.stringify(json_payData_v100),
      inputType: "raw",
      outputType: "b58",
    });

    if (String(pin.IpfsHash) !== String(proofHash58)) {
      console.log("Error with proof Hash.");
      console.log(pin.IpfsHash);
      console.log(proofHash58);
      return;
    }

    const encoded = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes"], [toUtf8Bytes(pin.IpfsHash), pubKey]);

    runTx(payCtx?.submitHash(encoded, { value: parseEther("0.01") }), signer);

  }

  const receivePayment = async () => {
    console.log(hexlify(toUtf8Bytes(JSON.parse(kp).publicKey)))

    const hash = await payCtx?.getHash(toUtf8Bytes(JSON.parse(kp).publicKey));
    const parsedHash = toUtf8String(hash);
    console.log("Parsed Hash:", parsedHash);

    // fetch from ipfs
    const proof = await axios.get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + parsedHash, {
      headers: {
        Accept: "text/plain",
      },
    });

    // const senderPubKey = proof.data.pubKey;
    // const senderNonce = proof.data.nonce;
    // const senderEncryptedR = proof.data.encryptedData;

    const senderPubKey = JSON.parse(kp).publicKey;
    const senderNonce = encrypted.nonce;
    const senderEncryptedR = encrypted.encryptedR;

    const wallet = await verifyStealthAddress(senderEncryptedR, senderPubKey, JSON.parse(kp).secretKey, JSON.parse(kp).publicKey, senderNonce);

    console.log(wallet)

    const balance = await publicProvider.getBalance(wallet?.address);

    if (balance.gt(0)) {
      const tx = {
        to: receiver,
        // Converti l'importo in Ether in Wei
        value: balance
      };

      runTx(tx, signer);
    } else {
      notification.error("No balance to withdraw");
    }
  }

  return (
    <div className="flex items-center justify-center flex-col flex-grow pt-10 text-black bg-gradient-to-tl from-blue-950 to-slate-950 min-w-fit">
      <h2 className="text-center my-2 text-2xl font-bold text-base-content mx-auto">
        Payment Portal
      </h2>
      {needSetup ? (
        <div className="mt-5">
          <button className="btn btn-primary text-lg" onClick={setup}>
            Initialize Setup
          </button>
        </div>
      ) : (
        <div className="p-4 mt-5 bg-white rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Receiver's Address</label>
            <input id="address" placeholder="Enter Address" className="input input-bordered w-full" type="text" onChange={(e) => { setReceiver(String(e.target.value)) }} />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Send</label>
            <input id="amount" placeholder="Enter Amount" className="input input-bordered w-full" type="text" onChange={(e) => { setAmount(String(e.target.value)) }} />
          </div>
          <button className="btn btn-primary w-full mb-3" onClick={sendPayment}>
            Send Payment
          </button>
          <div className="mb-4">
            <label htmlFor="receiver" className="block text-sm font-medium text-gray-700">Receiver for Payment</label>
            <input id="receiver" placeholder="Receiver" className="input input-bordered w-full" type="text" onChange={(e) => { setReceiver(String(e.target.value)) }} />
          </div>
          <button className="btn btn-primary w-full" onClick={receivePayment}>
            Receive Payment
          </button>
        </div>
      )}
    </div>

  );
};

export default Pay;
