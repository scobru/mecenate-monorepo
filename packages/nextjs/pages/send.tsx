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
import { ZERO_ADDRESS } from "@ethereum-attestation-service/eas-sdk";

const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;

const Send: NextPage = () => {
  const deployedContractBay = getDeployedContract(String(process.env.NEXT_PUBLIC_CHAIN_ID), "MecenateSend");
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

  const { data: legacySigner } = useSigner();
  type BayRequest = {
    encryptedData: string;
    pubKey: string;
  };

  let sendAddress!: string;
  let sendAbi: ContractInterface[] = [];

  let usersAddress!: string;
  let usersAbi: ContractInterface[] = [];

  if (deployedContractBay) {
    ({ address: sendAddress, abi: sendAbi } = deployedContractBay);
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

  useEffect(() => {
    if (signer) {
      setNeedSetup(true);
    }
  }, [signer]);

  const sendCtx = useContract({
    address: sendAddress,
    abi: sendAbi,
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
    const _kp = await generateKeyPairFromSeed(publicProvider, signer);
    _kp.publicKey = ethers.utils.base64.encode(_kp.publicKey);
    _kp.secretKey = ethers.utils.base64.encode(_kp.secretKey);
    setKP(JSON.stringify(_kp));
    setNeedSetup(false);
  }

  const sendPayment = async () => {
    // get Public Key of address from MecenateUser
    const receiverPubKey = toUtf8String(await userCtx?.getUserPublicKey(receiver));
    console.log("Receiver Public Key", toUtf8Bytes(receiverPubKey));

    const senderPubKey = JSON.parse(kp).publicKey
    const senderSecretKey = JSON.parse(kp).secretKey
    console.log("Sender Public Key", senderPubKey);

    const stealthResponse = await generateStealthAddress(receiverPubKey, senderSecretKey, senderPubKey);
    console.log("Wallet Address", stealthResponse.address);

    const json_payData_v100 = {
      encryptedR: stealthResponse.encryptedR,
      nonce: stealthResponse.nonce,
      sPubKey: stealthResponse.sPubKey,
      bPubKey: stealthResponse.bPubKey,
    };

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

    const encoded = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes", "address", "address", "uint256"],
      [
        toUtf8Bytes(pin.IpfsHash),
        toUtf8Bytes(receiverPubKey),
        stealthResponse.address,
        ZERO_ADDRESS,
        parseEther(amount)
      ]);

    const msgValue = Number(formatEther(await sendCtx?.fixedFee())) + Number(amount);


    console.log(Buffer.from(senderPubKey, "base64"), Buffer.from(toUtf8String(receiverPubKey), "base64"), Buffer.from(senderSecretKey, "base64"), Buffer.from(stealthResponse.encryptedR as any, "base64"), Buffer.from(stealthResponse.nonce as any, "base64"))
    runTx(sendCtx?.submitHash(encoded, { value: parseEther(String(msgValue)) }), signer);
  }

  const receivePayment = async () => {
    notification.info("Fetching proof JSON...")

    const receiverSecretKey = JSON.parse(kp).secretKey
    const receiverPubKey = JSON.parse(kp).publicKey

    const hash = await sendCtx?.getHash(toUtf8Bytes(receiverPubKey));
    const parsedHash = toUtf8String(hash);
    console.log("Parsed Hash:", parsedHash);

    // fetch from ipfs
    const proof = await axios.get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + parsedHash, {
      headers: {
        Accept: "text/plain",
      },
    });

    const receiverPubKeyArray = proof.data.rPubKey
    const senderPubKey = proof.data.sPubKey;
    const nonce = proof.data.nonce;
    const encryptedR = proof.data.encryptedR;

    notification.info("Verifying Sthealth Address...")

    const wallet = await verifyStealthAddress(encryptedR, senderPubKey, receiverPubKeyArray, receiverSecretKey, nonce);

    console.log("Wallet Address", wallet.address);
    const balance = await publicProvider.getBalance(wallet?.address);
    console.log("Balance", ethers.utils.formatEther(balance))

    // calculate network gas fee
    const gasPrice = await publicProvider.getGasPrice();
    console.log("Gas Price", ethers.utils.formatEther(gasPrice))

    // Prepara la transazione senza inviarla
    const tx = {
      to: receiver,
      value: balance,
      gasPrice: gasPrice,
    };

    // Stima il gas per la transazione
    const estimatedGas = await signer.estimateGas(tx);
    const adjustedGas = estimatedGas.mul(ethers.BigNumber.from(11)).div(10);

    // Calcola il costo del gas stimato
    const estimatedGasCost = adjustedGas.mul(gasPrice);

    // Calcola il saldo da inviare sottraendo il costo del gas stimato dal saldo totale
    let balanceToSend = balance.sub(estimatedGasCost);
    console.log("Balance to send", ethers.utils.formatEther(balanceToSend))
    console.log("Estimated Network Fee", ethers.utils.formatEther(estimatedGasCost))
    notification.info("Retrieving balance...")

    if (balance.gt(estimatedGasCost)) {
      // Set the value of the transaction to the balance to send
      tx.value = balanceToSend;

      wallet.connect(publicProvider).sendTransaction(tx).then((tx2) => {
        console.log(tx2);
      });
      notification.success("Payment received")
    } else {
      notification.error("No balance to withdraw");
    }
  }

  return (
    <div className="flex items-center justify-center flex-col flex-grow pt-10 text-black bg-gradient-to-tl from-blue-950 to-slate-950 min-w-fit">
      {needSetup ? (
        <div className="mt-5">
          <button className="btn btn-primary text-lg" onClick={setup}>
            Initialize Setup
          </button>
        </div>
      ) : signer ? (
        <div className="p-4 mt-5 bg-gradient-to-br from-blue-950 to-slate-800 rounded-lg shadow-md">
          <div className="font-light text-2xl text-white mb-2">
            Send
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-500 my-2">Receiver's Address</label>
            <input id="address" placeholder="Enter Address" className="input input-text w-full text-black" type="text" onChange={(e) => { setReceiver(String(e.target.value)) }} />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-500 my-2">Amount to Send</label>
            <input id="amount" placeholder="Enter Amount" className="input input-text w-full" type="text" onChange={(e) => { setAmount(String(e.target.value)) }} />
          </div>

          <button className="btn btn-custom w-full mb-3  hover:bg-secondary" onClick={sendPayment} disabled={!receiver}>
            Send
          </button>
          <div className="divider" />
          <div className="font-light text-2xl text-white mb-2">
            Scan
          </div>


          <div className="mb-4">
            <label htmlFor="receiver" className="block text-sm font-medium text-gray-500 my-2">Receiver for Payment</label>
            <input id="receiver" placeholder="Receiver" className="input input-text w-full" type="text" onChange={(e) => { setReceiver(String(e.target.value)) }} />
          </div>
          <button className="btn btn-custom w-full hover:bg-secondary" onClick={receivePayment} disabled={!receiver}>
            Receive
          </button>
        </div>
      ) : null}
    </div>

  );
};

export default Send;
