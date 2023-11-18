import type { NextPage } from 'next';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useProvider, useNetwork, useSigner, useContract } from 'wagmi';
import { getDeployedContract } from '../components/scaffold-eth/Contract/utilsContract';
import { Contract, ContractInterface, Signer, ethers } from 'ethers';
import {
  formatEther,
  hexlify,
  keccak256,
  parseEther,
  toUtf8Bytes,
  toUtf8String,
} from 'ethers/lib/utils.js';
import { useScaffoldContractWrite, useTransactor } from '~~/hooks/scaffold-eth';
import { notification } from '~~/utils/scaffold-eth';
import axios from 'axios';
import { useAppStore } from '~~/services/store/store';
import pinataSDK from '@pinata/sdk';
import MecenateHelper from '@scobru/crypto-ipfs';

import generateStealthAddress from '~~/utils/stealthAddress';
import {
  verifyStealthAddress,
  generateKeyPairFromSeed,
} from '~~/utils/stealthAddress';
import { run } from 'node:test';
import { ZERO_ADDRESS } from '@ethereum-attestation-service/eas-sdk';

const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;

const Send: NextPage = () => {
  const deployedContractBay = getDeployedContract(
    String(process.env.NEXT_PUBLIC_CHAIN_ID),
    'MecenateSend',
  );
  const deployedContractUsers = getDeployedContract(
    String(process.env.NEXT_PUBLIC_CHAIN_ID),
    'MecenateUsers',
  );
  const deployedContractDai = getDeployedContract(
    String(process.env.NEXT_PUBLIC_CHAIN_ID),
    'MockDai',
  );
  const deployedContractMUSE = getDeployedContract(
    String(process.env.NEXT_PUBLIC_CHAIN_ID),
    'MUSE',
  );

  const [receiver, setReceiver] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [decryptedWallet, setDecryptedWallet] = React.useState<any>(null);
  const [needSetup, setNeedSetup] = React.useState<boolean>(true);

  const [kp, setKP] = React.useState<string>('');
  const publicProvider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL,
  );
  const runTx = useTransactor();

  const { signer } = useAppStore();

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

  /* useEffect(() => {
    if (signer) {
      setNeedSetup(true);
    }
  }, [signer]); */

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
  };

  const sendPayment = async () => {
    const id = notification.loading('Sending payment...');

    // get Public Key of address from MecenateUser
    const receiverPubKey = toUtf8String(
      await userCtx?.getUserPublicKey(receiver),
    );
    const senderPubKey = JSON.parse(kp).publicKey;
    const senderSecretKey = JSON.parse(kp).secretKey;

    console.log('Sender Public Key', senderPubKey);
    console.log('Receiver Public Key', receiverPubKey);
    console.log('Sender Secret Key', senderSecretKey);

    const stealthResponse = await generateStealthAddress(
      receiverPubKey,
      senderSecretKey,
      senderPubKey,
    );
    console.log('Wallet Address', stealthResponse.address);

    const json_payData_v100 = {
      encryptedR: stealthResponse.encryptedR,
      nonce: stealthResponse.nonce,
      ephemeralPubKey: stealthResponse.ephemeralPubKey,
    };

    const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);
    const pinataAuth = await pinata.testAuthentication();

    if (pinataAuth.authenticated !== true) {
      console.log('Pinata Authentication Failed.');
      return;
    }

    const pin = await pinata.pinJSONToIPFS(json_payData_v100);
    console.log('Pinata Pin Result: ' + JSON.stringify(pin));

    const proofHash58 = await MecenateHelper.multihash({
      input: JSON.stringify(json_payData_v100),
      inputType: 'raw',
      outputType: 'b58',
    });

    if (String(pin.IpfsHash) !== String(proofHash58)) {
      console.log('Error with proof Hash.');
      console.log(pin.IpfsHash);
      console.log(proofHash58);
      return;
    }

    const encoded = ethers.utils.defaultAbiCoder.encode(
      ['bytes', 'bytes', 'address', 'address', 'uint256'],
      [
        toUtf8Bytes(String(pin.IpfsHash)),
        await userCtx?.getUserPublicKey(receiver),
        stealthResponse.address,
        ZERO_ADDRESS,
        parseEther(amount),
      ],
    );

    const fee =
      (Number(parseEther(amount)) * (await sendCtx?.globalFee())) / 10000;

    const msgValue = Number(formatEther(fee)) + Number(amount);

    notification.remove(id);

    runTx(
      sendCtx?.submitHash(encoded, { value: parseEther(String(msgValue)) }),
      signer,
    );
  };

  const receivePayment = async () => {
    const id = notification.loading('Receiving payment...');

    const receiverSecretKey = JSON.parse(kp).secretKey;
    const receiverPubKey = JSON.parse(kp).publicKey;

    const hash = await sendCtx?.getHash(toUtf8Bytes(receiverPubKey));
    const parsedHash = toUtf8String(hash);
    console.log('Parsed Hash:', parsedHash);

    // fetch from ipfs
    const proof = await axios.get(
      'https://sapphire-financial-fish-885.mypinata.cloud/ipfs/' + parsedHash,
      {
        headers: {
          Accept: 'text/plain',
        },
      },
    );

    const ephemeralPubKey = proof.data.ephemeralPubKey;
    const nonce = proof.data.nonce;
    const encryptedR = proof.data.encryptedR;

    console.log(proof.data);

    notification.info('Verifying Sthealth Address...');

    const wallet = await verifyStealthAddress(
      encryptedR,
      nonce,
      ephemeralPubKey,
      receiverPubKey,
      receiverSecretKey,
    );
    setDecryptedWallet(wallet);

    console.log('Wallet Address', wallet.address);
    const balance = await publicProvider.getBalance(wallet?.address);
    console.log('Balance', ethers.utils.formatEther(balance));

    // calculate network gas fee
    const gasPrice = await publicProvider.getGasPrice();
    console.log('Gas Price', ethers.utils.formatEther(gasPrice));

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

    notification.remove(id);

    // Calcola il saldo da inviare sottraendo il costo del gas stimato dal saldo totale
    let balanceToSend = balance.sub(estimatedGasCost);
    console.log('Balance to send', ethers.utils.formatEther(balanceToSend));
    console.log(
      'Estimated Network Fee',
      ethers.utils.formatEther(estimatedGasCost),
    );

    const id2 = notification.loading('Retrieving balance...');

    if (balance.gt(estimatedGasCost)) {
      notification.remove(id2);

      // Set the value of the transaction to the balance to send
      tx.value = balanceToSend;

      wallet
        .connect(publicProvider)
        .sendTransaction(tx)
        .then(tx2 => {
          console.log(tx2);
        });
      notification.success('Payment received');
    } else {
      notification.remove(id2);

      notification.error('No balance to withdraw');
    }
  };

  const getTransactionHistory = async () => {
    const fromBlockInput = document.getElementById(
      'fromBlockInput',
    ) as HTMLInputElement;
    const toBlockInput = document.getElementById(
      'toBlockInput',
    ) as HTMLInputElement;
    const transactionsBox = document.getElementById(
      'transactionsBox',
    ) as HTMLDivElement;

    const fromBlock = Number(fromBlockInput.value) || 0;
    const toBlock =
      toBlockInput.value === 'latest' ? 'latest' : Number(toBlockInput.value);

    // listen for evnet HashSubmitted
    const filter = sendCtx?.filters.HashSubmitted();

    const logs = await publicProvider.getLogs({
      ...filter,
      fromBlock,
      toBlock,
    });

    const transactions = logs.map(log => {
      const decodedLog = sendCtx?.interface.parseLog(log);
      return {
        receiver: decodedLog?.args.receiver,
        token:
          decodedLog?.args.token === ZERO_ADDRESS
            ? 'ETH'
            : decodedLog?.args.token,
        amount: formatEther(decodedLog?.args.amount.toString()),
        link: `https://goerli.basescan.org/tx/${log.transactionHash}`, // Modifica questo URL in base al tuo block explorer
      };
    });

    transactionsBox.innerHTML = ''; // Pulisci il box prima di aggiungere nuovi dati

    // Crea la tabella
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Crea l'intestazione della tabella
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    ['Receiver', 'Token', 'Amount', 'Link'].forEach(header => {
      const th = document.createElement('th');
      th.style.border = '0px solid #000';
      th.style.padding = '5px';

      th.textContent = header;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    // Crea il corpo della tabella
    const tbody = document.createElement('tbody');
    transactions.forEach(transaction => {
      const tr = document.createElement('tr');
      Object.values(transaction).forEach(value => {
        const td = document.createElement('td');
        td.style.border = '0px solid #000';
        td.style.padding = '5px';
        if (typeof value === 'string' && value.startsWith('https://')) {
          const a = document.createElement('a');
          a.href = value;
          a.textContent = 'tx';
          a.target = '_blank';
          td.appendChild(a);
        } else {
          td.textContent = value;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    transactionsBox?.appendChild(table);

    return transactions;
  };

  return (
    <div className="flex items-center text-slate-300 justify-center flex-col flex-grow pt-10  bg-gradient-to-tl from-blue-950 to-slate-950 min-w-fit mx-5">
      <h1 className="text-4xl mb-3 font-light text-white">
        SEND STEALTH PAYMENT
      </h1>
      <h1 className="text-lg  mb-8  font-light text-white">
        Only the sender and recipient know who received funds
      </h1>
      {needSetup ? (
        <div className="w-min mx-auto mt-5">
          <button className="btn btn-custom text-lg" onClick={setup}>
            Setup
          </button>
        </div>
      ) : signer ? (
        <div>
          <div className="p-10 text-slate-300 mt-10 mb-10 bg-gradient-to-br from-blue-950  to-slate-800   rounded-lg shadow-lg text-center justify-normal ">
            <h2 className="font-semibold text-5xl mb-10 text-center ">
              TUTORIAL
            </h2>
            <div className="mb-10">
              <h3 className="font-light text-2xl mb-4 underline decoration-purple-500">
                Receiving Funds
              </h3>
              <ul className="list-disc list-inside pl-6 mb-4 text-lg text-left">
                <li>
                  Configure your account using the <strong>Identity</strong>{' '}
                  page
                </li>
                <li>
                  Withdraw funds from the <strong>Scan</strong> box and send it
                  to the receiver address
                </li>
              </ul>
              <p className="text-xl font-extrabold mt-10"> ⚠️ WARNING⚠️</p>
              <p className="underline text-lg font-medium">
                {' '}
                Use a different address to receive the funds if you want to
                maintain anonymity.
              </p>
            </div>

            <div>
              <h3 className="font-light text-2xl mb-5 underline decoration-purple-500">
                Sending Funds
              </h3>
              <ul className="list-disc list-inside pl-6 text-lg text-left">
                <li>Acquire the recipient's address, ENS, or CNS name</li>
                <li>
                  Fill out the form on the <strong>Send</strong> box to transfer
                  funds
                </li>
              </ul>
            </div>
          </div>
          <div className="p-10 text-slate-300 mt-5 bg-gradient-to-br from-blue-950 to-slate-800 rounded-lg shadow-md mb-10">
            <div className="font-light text-2xl text-white mb-5">Send</div>
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-500 my-2"
              >
                Receiver's Address
              </label>
              <input
                id="address"
                placeholder="Enter Address"
                className="input input-text w-full text-black"
                type="text"
                onChange={e => {
                  setReceiver(String(e.target.value));
                }}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-500 my-2"
              >
                Amount to Send
              </label>
              <input
                id="amount"
                placeholder="Enter Amount"
                className="input input-text w-full"
                type="text"
                onChange={e => {
                  setAmount(String(e.target.value));
                }}
              />
            </div>
            <button
              className="btn btn-custom w-full mb-3  hover:bg-secondary"
              onClick={sendPayment}
              disabled={!receiver}
            >
              Send
            </button>
          </div>
          <div className="p-10 text-slate-300 mt-5 bg-gradient-to-br from-blue-950 to-slate-800 rounded-lg shadow-md mb-10">
            <div className="font-light text-2xl text-white mb-5">Scan</div>
            <div className="mb-4">
              <label
                htmlFor="receiver"
                className="block text-sm font-medium text-gray-500 my-2"
              >
                Receiver for Payment
              </label>
              <input
                id="receiver"
                placeholder="Receiver"
                className="input input-text w-full"
                type="text"
                onChange={e => {
                  setReceiver(String(e.target.value));
                }}
              />
            </div>
            <button
              className="btn btn-custom w-full hover:bg-secondary"
              onClick={receivePayment}
              disabled={!receiver}
            >
              Receive
            </button>
            <div className="mb-4 text-white font-light">
              <div className="mb-4 text-white font-light">Stealth Address</div>

              {decryptedWallet && (
                <pre className="text-white">
                  Address: {decryptedWallet.address}
                  <br />
                  PrivateKey: {decryptedWallet.privateKey}
                </pre>
              )}
            </div>
          </div>
          <div className="p-10 mt-5 bg-gradient-to-br from-blue-950  to-slate-800 text-slate-300 mb-4 rounded-lg shadow-lg text-center justify-normal break-all">
            <h2 className="font-semibold text-5xl mb-5 text-center ">
              TXS HISTORY
            </h2>

            <p className="text-gray-500">
              Specifica l'intervallo di blocchi e ottieni la cronologia delle
              transazioni.
            </p>
            <input
              id="fromBlockInput"
              type="number"
              placeholder="From Block"
              className="input input-text w-full my-2"
            />
            <input
              id="toBlockInput"
              type="text"
              placeholder="To Block"
              className="input input-text w-full my-2"
            />
            <button className="btn btn-custom" onClick={getTransactionHistory}>
              Load
            </button>
            <div id="transactionsBox" className="mt-3 p-3  rounded" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Send;
