import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContract, useProvider, useNetwork, useSigner } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { BigNumber, ContractInterface, FixedNumber, Signer, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { useRouter } from "next/router";
import {
  formatEther,
  hexDataSlice,
  hexStripZeros,
  hexValue,
  keccak256,
  parseEther,
  toUtf8Bytes,
  toUtf8String,
} from "ethers/lib/utils";
import pinataSDK from "@pinata/sdk";
import axios from "axios";
import Dropzone from "react-dropzone";
import { saveAs } from "file-saver";
import Spinner from "~~/components/Spinner";
import {
  ScaleIcon,
  MegaphoneIcon,
  DocumentCheckIcon,
  PaperAirplaneIcon,
  ChatBubbleBottomCenterIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/20/solid";
import crypto from "crypto";
import { useTransactor } from "~~/hooks/scaffold-eth";

const ViewFeed: NextPage = () => {
  const { data: signer } = useSigner();
  const provider = useProvider();
  const router = useRouter();
  const txData = useTransactor(signer as Signer);
  const AbiCoder = new ethers.utils.AbiCoder();
  const customProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const ErasureHelper = require("@erasure/crypto-ipfs");
  const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const customWallet = new ethers.Wallet(String(process.env.NEXT_PUBLIC_RELAYER_KEY), provider);
  const [nonce, setNonce] = React.useState<string>("0");
  const [withdrawalAddress, setWithdrawalAddress] = React.useState<string>("");
  const [tokenId, setTokenId] = React.useState<string>("");

  const { chain } = useNetwork();

  const { addr } = router?.query;
  const [ethWallet, setEthWallet] = useState<any>(null);
  const [customSigner, setCustomSigner] = useState<any>(null);
  const [postType, setPostType] = useState<any>([]);
  const [postDuration, setPostDuration] = useState<any>([]);
  const [postStake, setPostStake] = useState<any>([]);
  const [postRawData, setPostRawData] = useState<any>([]);
  const [postPayment, setPostPayment] = useState<any>([]);
  const [symmetricKey, setSymmetricKey] = useState<any>([]);
  const [valid, setValid] = useState<boolean>(false);
  const [punishment, setPunishment] = useState<any>(0);
  const [buyerPayment, setBuyerPayment] = useState<any>("");
  const [stakeAmount, setStakeAmount] = useState<any>(0);
  const [buyer, setBuyer] = useState<any>("");
  const [imageFile, setImageFile] = React.useState<any>("");
  const [image, setImage] = React.useState("");
  const [postCount, setPostCount] = useState<any>("");
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [sismoResponse, setSismoResponse] = React.useState<any>(null);
  const [yourStake, setYourStake] = useState<any>(0);
  const [hashedVaultId, setHashedVaultId] = useState<any>([]);
  const [secretMessage, setSecretMessage] = useState<any>("");
  const [message, setMessage] = useState<any>("");
  const [userName, setUserName] = useState<any>("");
  const [feedData, setFeedData] = useState<any>([]);
  const deployedContractFeed = getDeployedContract(chain?.id.toString(), "MecenateFeed");
  const deployedContractUsers = getDeployedContract(chain?.id.toString(), "MecenateUsers");
  const deployedContractVault = getDeployedContract(chain?.id.toString(), "MecenateVault");

  const [receiver, setReceiver] = useState<any>("");
  const allStatuses = ["Waiting for Creator", "Proposed", "Accepted", "Submitted", "Finalized", "Punished", "Revealed"];

  let feedAddress!: string;
  let feedAbi: ContractInterface[] = [];

  let usersAddress!: string;
  let usersAbi: ContractInterface[] = [];

  if (deployedContractUsers) {
    ({ address: usersAddress, abi: usersAbi } = deployedContractUsers);
  }

  if (deployedContractFeed) {
    ({ address: feedAddress, abi: feedAbi } = deployedContractFeed);
  }

  let vaultAddress!: string;
  let vaultAbi: ContractInterface[] = [];

  if (deployedContractVault) {
    ({ address: vaultAddress, abi: vaultAbi } = deployedContractVault);
  }

  const handleApproveTokenSeller = async () => {
    let _tokenAddress;
    if (tokenId == "1") {
      _tokenAddress = process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE;
    } else if (tokenId == "2") {
      _tokenAddress = process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE;
    }
    const iface = new ethers.utils.Interface(deployedContractVault?.abi as any[]);
    const data = iface.encodeFunctionData("approveTokenToFeed", [
      _tokenAddress,
      parseEther(postStake),
      feedCtx?.address,
      keccak256(sismoData.auths[0].userId),
    ]);
    txData(vaultCtx?.execute(vaultCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
  };

  const handleApproveTokenBuyer = async () => {
    let _tokenAddress;
    if (feedData.postdata.settings.tokenId == 1) {
      _tokenAddress = process.env.NEXT_PUBLIC_MUSE_ADDRESS_BASE;
    } else if (feedData.postdata.settings.tokenId == 2) {
      _tokenAddress = process.env.NEXT_PUBLIC_DAI_ADDRESS_BASE;
    }
    const iface = new ethers.utils.Interface(deployedContractVault?.abi as any[]);
    const data = iface.encodeFunctionData("approveTokenToFeed", [
      _tokenAddress,
      feedData.postdata.escrow.stake,
      feedCtx?.address,
      keccak256(sismoData.auths[0].userId),
    ]);
    txData(vaultCtx?.execute(vaultCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
  };

  const vaultCtx = useContract({
    address: vaultAddress,
    abi: vaultAbi,
    signerOrProvider: customWallet,
  });

  const feedCtx = useContract({
    address: addr as string,
    abi: feedAbi,
    signerOrProvider: customWallet,
  });

  //******************** Messenger *********************//

  const sendTelegramMessage = async () => {
    if (
      feedData.postdata.settings.status != 0 &&
      feedData.postdata.settings.status != 1 &&
      feedData.postdata.settings.status != 2
    ) {
      const telegramIds = await feedCtx?.getTelegramIds(keccak256(sismoData.auths[0].userId));
      const buyerID = telegramIds[0].toHexString().slice(33);
      const sellerID = telegramIds[1].toHexString().slice(33);

      const isBuyer = buyerID == sismoData.auths[3].userId;

      const url = `https://api.telegram.org/bot${String(process.env.NEXT_PUBLIC_TELEGRAM_TOKEN)}/sendMessage`;

      if (isBuyer) {
        const message = {
          feed: "https://mecenate.vercel.app/viewFeed?addr=" + addr,
          username: userName,
          message: secretMessage,
        };

        const formattedText = `<b>🔏 Private Message</b>\n\n<b>➡️ feed: </b> <a href="${message.feed}">${message.feed}</a>\n<b>📨 message: </b> ${message.message}`;

        try {
          const response = await axios.post(url, {
            chat_id: sellerID,
            text: formattedText,
            parse_mode: "HTML",
          });

          console.log("Message sent:", response.data);
        } catch (error) {
          console.error("Error sending message:", error);
        }
        notification.success("Message sent successfully");
      } else {
        const message = {
          feed: "https://mecenate.vercel.app/viewFeed?addr=" + addr,
          message: secretMessage,
        };

        const formattedText = `<b>🔏 Private Message</b><b>🔡</b> <a href="${message.feed}">${message.feed}</a>\n<b>📨</b> ${message.message}`;

        try {
          const response = await axios.post(url, {
            chat_id: buyerID,
            text: formattedText,
            parse_mode: "HTML",
          });

          console.log("Message sent:", response.data);
        } catch (error) {
          console.error("Error sending message:", error);
        }
        notification.success("Message sent successfully");
      }
    }
  };

  const sendSecretMessage = async () => {
    const encryptedMessage = encryptMessage(keccak256(sismoData.auths[0].userId), secretMessage);

    const tx = await feedCtx?.write(keccak256(sismoData.auths[0].userId), toUtf8Bytes(encryptedMessage));
    await tx?.wait();
    notification.success("Message sent successfully");
  };

  const getSecretMessage = async () => {
    // postStatus != 0
    if (
      feedData.postdata.settings.status != 0 &&
      feedData.postdata.settings.status != 1 &&
      feedData.postdata.settings.status != 2
    ) {
      const _secretMessage = await feedCtx?.getMessage(sismoResponse, withdrawalAddress, nonce);

      console.log("Secret Message: ", _secretMessage);

      const encryptedVaultId = await getHashedVaultId(sismoResponse, withdrawalAddress, nonce);
      console.log("Encrypted Vault Id: ", encryptedVaultId);

      const decryptedMessage = decryptMessage(encryptedVaultId, toUtf8String(_secretMessage));
      console.log("Decrypted Message: ", decryptedMessage);
      return decryptedMessage;
    }
  };

  //******************** Feed Operation *********************//

  async function storePrivateKey(privateKey: any, contractAddress: any, sismoData: any) {
    try {
      const encryptedKey = await encryptMessage(String(sismoData?.auths[0]?.userId), String(privateKey));
      console.log("Encrypted Key: ", encryptedKey);
      console.log("Contract Address: ", contractAddress);
      const response = await fetch("/api/storeKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedPrivateKey: encryptedKey,
          contractAddress: contractAddress,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        return data;
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        throw new Error("Failed to store the private key");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
    } finally {
      console.log("Store private key operation completed.");
    }
  }

  const createPost = async function createPost() {
    await fetchData();

    const dataSaved = await savePost(postRawData);

    /* notification.warning(
      <div
        id="alert-additional-content-3"
        className="p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
        role="alert"
      >
        <div className="flex items-center">
          <svg
            aria-hidden="true"
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Info</span>
          <h3 className="text-lg font-medium">Save Symmetic Key!</h3>
        </div>
        <div className="flex">
          <button
            type="button"
            className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={async () => {
              navigator.clipboard.writeText(JSON.stringify(dataSaved?.symmetricKey));
              notification.success("Symmetric key copied to clipboard");
            }}
          >
            <svg
              aria-hidden="true"
              className="-ml-0.5 mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Copy to clipboard
          </button>
        </div>
      </div>,
    );

    downloadFile({
      data: JSON.stringify(dataSaved),
      fileName: String(postCount) + "_" + feedCtx?.address + "_sellData.json",
      fileType: "text/json",
    }); */

    const response = await storePrivateKey(dataSaved?.symmetricKey, feedCtx?.address, sismoData);

    if (response.message == "Key stored successfully") {
      notification.success("Symmetric key saved successfully");
    } else {
      notification.error("Symmetric key failed to save");
      return;
    }

    const proofOfHashEncode = await ErasureHelper.multihash({
      input: dataSaved?.proofhash,
      inputType: "b58",
      outputType: "digest",
    });

    console.log("ProofHash", proofOfHashEncode);
    console.log("Start Tx...");
    console.log("Signer Address: ", signer?.getAddress());

    let _buyer;

    if (buyer == "") {
      _buyer = ethers.constants.AddressZero;
    } else {
      _buyer = buyer;
    }

    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);

    const data = iface.encodeFunctionData("createPost", [
      proofOfHashEncode,
      Number(postType),
      Number(postDuration),
      parseEther(await buyerPayment),
      parseEther(postStake),
      Number(tokenId),
      sismoResponse,
      localStorage.getItem("withdrawalAddress"),
      localStorage.getItem("nonce"),
    ]);
    txData(
      vaultCtx?.execute(
        feedCtx?.address,
        data,
        tokenId == "0" ? parseEther(postStake) : 0,
        keccak256(sismoData?.auths[0]?.userId),
      ),
    );
  };

  async function acceptPost() {
    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
    const data = iface.encodeFunctionData("acceptPost", [
      sismoResponse,
      withdrawalAddress,
      nonce,
      feedData?.postdata?.settings?.tokenId,
      parseEther(postPayment),
    ]);
    txData(vaultCtx?.execute(feedCtx?.address, data, parseEther(postPayment), keccak256(sismoData.auths[0].userId)));
  }

  async function createPostData(RawData: any) {
    console.log("Creating Data...");
    try {
      const symmetricKey = ErasureHelper.crypto.symmetric.generateKey();
      const encryptedFile = ErasureHelper.crypto.symmetric.encryptMessage(symmetricKey, RawData);

      const symmetricKeyHash = await ErasureHelper.multihash({
        input: symmetricKey,
        inputType: "raw",
        outputType: "hex",
      });

      // datahash sha256(rawdata)

      const dataHash = await ErasureHelper.multihash({
        input: RawData,
        inputType: "raw",
        outputType: "hex",
      });

      // encryptedDatahash = sha256(encryptedData)

      // This hash will match the IPFS pin hash
      const encryptedDataHash = await ErasureHelper.multihash({
        input: JSON.stringify({ encryptedData: encryptedFile }),
        inputType: "raw",
        outputType: "b58",
      });

      // jsonblob_v1_2_0 = JSON(multihashformat(datahash), multihashformat(keyhash), multihashformat(encryptedDatahash))
      const jsonblob_v1_2_0 = {
        datahash: dataHash,
        encryptedDatahash: encryptedDataHash, // This allows the encrypted data to be located on IPFS or 3Box
        keyhash: symmetricKeyHash,
      };

      // proofhash = sha256(jsonblob_v1_2_0)
      // This hash will match the IPFS pin hash. It should be saved to the users feed contract.
      const proofHash58 = await ErasureHelper.multihash({
        input: JSON.stringify(jsonblob_v1_2_0),
        inputType: "raw",
        outputType: "b58",
      });

      console.log("RawData", RawData);
      console.log("Encrypted File", encryptedFile);
      console.log("Symmetric Key", symmetricKey);
      console.log("Key Hash", symmetricKeyHash);
      console.log("Datahash", dataHash);
      console.log("Encrypted DataHash", encryptedDataHash);
      console.log("ProofHash", proofHash58);

      return {
        proofJson: jsonblob_v1_2_0,
        proofhash: proofHash58,
        symmetricKey: symmetricKey,
        encryptedData: encryptedFile,
      };
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchPrivateKey(contractAddress: string | undefined) {
    if (!contractAddress) {
      console.error("Contract address is undefined");
      return;
    }

    try {
      const response = await fetch(`/api/storeKey?contractAddress=${contractAddress}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        return data.encryptedPrivateKey;
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to fetch the private key: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
    } finally {
      console.log("Fetch private key operation completed.");
    }
  }

  async function submitData() {
    const abiCoder = new ethers.utils.AbiCoder();
    const proofhash = abiCoder.decode(["bytes32"], feedData[1][2].encryptedData);
    const encryptedSymKeyStored = await fetchPrivateKey(feedCtx?.address);

    if (encryptedSymKeyStored == undefined) {
      notification.error("Symmetric key not found");
      return;
    }

    console.log("Encrypted Symmetric Key Stored: ", encryptedSymKeyStored);
    const symKey = await decryptMessage(String(sismoData?.auths[0].userId), String(encryptedSymKeyStored));

    /* const symmetricKeyHash = await ErasureHelper.multihash({
      input: symmetricKey,
      inputType: "raw",
      outputType: "hex",
    }); */

    /*  const encryptedSymKey_Buyer = {
      ciphertext: encrypted,
      ephemPubKey: sellerPubKeyDecoded,
      nonce: 0,
      version: "v1.0.0",
    }; */

    const json_selldata_v120 = {
      esp_version: "v1.2.0",
      proofhash: proofhash,
      sender: signer?.getAddress(),
      encryptedSymKey: await symKey,
    };

    const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);
    const pinataAuth = await pinata.testAuthentication();

    if (pinataAuth.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    console.log("Saving proof JSON...");
    notification.success("Saving proof JSON...");

    const pin = await pinata.pinJSONToIPFS(json_selldata_v120);
    const proofHash58 = await ErasureHelper.multihash({
      input: JSON.stringify(json_selldata_v120),
      inputType: "raw",
      outputType: "b58",
    });

    const proofHash58Digest = await ErasureHelper.multihash({
      input: proofHash58,
      inputType: "b58",
      outputType: "digest",
    });

    if (pin.IpfsHash !== proofHash58) {
      console.log("Error with proof Hash.");
      console.log(pin.IpfsHash);
      console.log(proofHash58);
      return;
    }

    console.log("Data Saved.");
    notification.success("Data Saved.");

    //CHeck Fetch data
    const responseIPFS = await axios.get("https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + pin.IpfsHash, {
      headers: {
        Accept: "text/plain",
      },
    });

    // check response is ipfs valid content
    if (responseIPFS.data.esp_version !== "v1.2.0") {
      console.log("Error with proof Hash.");
      console.log(responseIPFS.data.esp_version);
      console.log("v1.2.0");
      return;
    }

    console.log("Data Retrieved.");
    console.log("Proof Hash Digest: ", proofHash58Digest);

    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
    const data = iface.encodeFunctionData("submitHash", [proofHash58Digest, sismoResponse, withdrawalAddress, nonce]);
    txData(vaultCtx?.execute(feedCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));

    return {
      proofJson: json_selldata_v120,
      proofHash58: proofHash58,
      proofHash58Decode: proofHash58Digest,
    };
  }

  async function retrievePost() {
    console.log("Retrieving Data...");

    const id = notification.loading("Retrieving Data...");
    await fetchData();

    const decodeHash = await ErasureHelper.multihash({
      input: feedData[1][2].encryptedKey,
      inputType: "sha2-256",
      outputType: "b58",
    });

    console.log("Decoded Hash: ", decodeHash);

    //#endregion
    const responseDecodeHash = await axios.get(
      "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + decodeHash,
      {
        headers: {
          Accept: "text/plain",
        },
      },
    );

    const responseDecodeHahJSON = await JSON.parse(JSON.stringify(responseDecodeHash.data));
    console.log("Response Decode Hash: ", responseDecodeHahJSON);

    const encryptedSymKey = await JSON.parse(JSON.stringify(responseDecodeHahJSON.encryptedSymKey));
    console.log("Encrypted Symmetric Key: ", encryptedSymKey);

    /* const decrypted = crypto.decrypt(
      encryptedSymKey.ciphertext,
      encryptedSymKey.nonce,
      encryptedSymKey.ephemPubKey,
      secretKey,
    ); */

    const _decodeHash = await ErasureHelper.multihash({
      input: responseDecodeHahJSON.proofhash.toString(),
      inputType: "sha2-256",
      outputType: "b58",
    });

    const url = "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + _decodeHash;

    console.log(url);

    const responseProofHash = await axios.get(url, {
      headers: {
        Accept: "text/plain",
      },
    });

    console.log(responseProofHash);

    const responseProofHashJSON = JSON.parse(JSON.stringify(responseProofHash.data));

    console.log(responseProofHashJSON);

    const response_Encrypteddatahash = await axios.get(
      "https://sapphire-financial-fish-885.mypinata.cloud/ipfs/" + responseProofHashJSON.encryptedDatahash,
      {
        headers: {
          Accept: "text/plain",
        },
      },
    );

    const response_Encrypteddatahash_JSON = JSON.parse(JSON.stringify(response_Encrypteddatahash.data));

    const decryptFile = ErasureHelper.crypto.symmetric.decryptMessage(
      encryptedSymKey,
      response_Encrypteddatahash_JSON.encryptedData,
    );

    if (decryptFile) {
      // wait 10 seconds
      console.log("Decrypted Data: ", decryptFile);

      const dataHash = await ErasureHelper.multihash({
        input: decryptFile,
        inputType: "raw",
        outputType: "hex",
      });

      const hashCheck = responseProofHashJSON.datahash === dataHash;

      if (
        feedData[1][0].postType == 1 ||
        feedData[1][0].postType == 2 ||
        feedData[1][0].postType == 3 ||
        feedData[1][0].postType == 4
      ) {
        const mimeType: any = base64Mime(decryptFile);

        // Repair malformed base64 data
        const file = convertBase64ToFile(
          decryptFile,
          String(postCount) + feedCtx?.address + "_decryptedData" + "." + mimeType?.split("/")[1],
        );

        saveAs(file, String(postCount) + feedCtx?.address + "_decryptedData" + "." + mimeType?.split("/")[1]);
      } else {
        notification.remove(id);
        notification.success(decryptFile);
      }

      await fetchData();

      return {
        rawData: encryptedSymKey,
        hashCheck: hashCheck,
      };
    } else {
      console.log("Error decrypting message.");
      return null;
    }
  }

  async function revealPost() {
    const symKeyHash = await ErasureHelper.multihash({
      input: JSON.stringify({ symmetricKey: symmetricKey }),
      inputType: "raw",
      outputType: "b58",
    });

    const rawDataHash = await ErasureHelper.multihash({
      input: JSON.stringify({ rawData: postRawData }),
      inputType: "raw",
      outputType: "b58",
    });

    // IPFS needs Pinata account credentials.
    if (pinataApiKey === undefined || pinataApiSecret === undefined) {
      console.log("Please call with Pinata Account Credentials");
      return;
    }

    // Make sure Pinata is authenticating.
    const pinata = await new pinataSDK(pinataApiKey, pinataApiSecret);
    const pinataAuth = await pinata.testAuthentication();
    if (pinataAuth.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    // Saves the SymKey to IPFS.

    let pin = await pinata.pinJSONToIPFS({ symmetricKey: symmetricKey });

    // Saves the data to IPFS.

    pin = await pinata.pinJSONToIPFS({ rawData: postRawData });

    console.log("Data Saved.");

    const AbiCoder = new ethers.utils.AbiCoder();
    const dataEncoded = AbiCoder.encode(["string", "string"], [symKeyHash, rawDataHash]);

    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
    const data = iface.encodeFunctionData("revealData", [dataEncoded, keccak256(sismoData.auths[0].userId)]);
    txData(vaultCtx?.execute(feedCtx?.address, data, 0, sismoResponse));

    await fetchData();
  }

  async function finalizePost() {
    console.log("Finalizing Data...");
    if (valid == true) {
      const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
      const data = iface.encodeFunctionData("finalizePost", [
        valid,
        parseEther("0"),
        keccak256(sismoData.auths[0].userId),
      ]);
      txData(vaultCtx?.execute(feedCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
    } else {
      const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
      const data = iface.encodeFunctionData("finalizePost", [
        valid,
        parseEther(punishment),
        keccak256(sismoData.auths[0].userId),
      ]);
      txData(vaultCtx?.execute(feedCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
    }

    await fetchData();
  }

  async function renounce() {
    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
    const data = iface.encodeFunctionData("renouncePost", [sismoResponse, withdrawalAddress, nonce]);
    txData(vaultCtx?.execute(feedCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
    notification.success("Refund successful");
  }

  //******************** Staking *********************//

  async function addStake() {
    console.log("Adding Stake...");
    txData(feedCtx?.addStake(sismoResponse, { value: parseEther(stakeAmount) }));
    await fetchData();
  }

  async function takeAll() {
    console.log("Take All Stake...");
    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);

    const data = iface.encodeFunctionData("takeFullStake", [
      feedData?.postdata?.settings?.tokenId,
      sismoResponse,
      withdrawalAddress,
      nonce,
    ]);

    txData(vaultCtx?.execute(feedCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));
    await fetchData();
  }

  async function takeStake() {
    console.log("Take Stake...");
    const iface = new ethers.utils.Interface(deployedContractFeed?.abi as any[]);
    const data = iface.encodeFunctionData("takeStake", [
      feedData?.postdata?.settings?.tokenId,
      parseEther(stakeAmount),
      sismoResponse,
      withdrawalAddress,
      nonce,
    ]);

    txData(vaultCtx?.execute(feedCtx?.address, data, 0, keccak256(sismoData.auths[0].userId)));

    await fetchData();
  }

  //******************** Helpers *********************//

  const fetchData = async function fetchData() {
    if (feedCtx && signer && provider) {
      const data = await feedCtx?.post();

      setFeedData(data);
      setPostCount(await feedCtx?.postCount());
    }
  };

  const convertBase64ToFile = (base64String: string, fileName: string) => {
    const arr: any = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const uint8Array = new Uint8Array(n);
    while (n--) {
      uint8Array[n] = bstr.charCodeAt(n);
    }
    const file = new File([uint8Array], fileName, { type: mime });
    return file;
  };

  const downloadFile = ({ data, fileName, fileType }: { data: BlobPart; fileName: string; fileType: string }): void => {
    if (!data || !fileName || !fileType) {
      throw new Error("Invalid inputs");
    }

    const blob = new Blob([data], { type: fileType });
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);

    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const getHashedVaultId = async () => {
    const _hashedVaultId = await feedCtx?.getHashedVaultId(keccak256(sismoData.auths[0].userId));
    setHashedVaultId(_hashedVaultId);
    return _hashedVaultId;
  };

  function encryptMessage(secretKey: string, message: string): string {
    const algorithm = "aes-256-cbc"; // Algoritmo di cifratura
    const key = crypto.createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta
    const iv = crypto.randomBytes(16); // Vettore di inizializzazione casuale

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Concatenare il vettore di inizializzazione e il messaggio cifrato
    return iv.toString("hex") + encrypted;
  }

  function decryptMessage(secretKey: string, encryptedMessage: string): string {
    const algorithm = "aes-256-cbc"; // Algoritmo di cifratura
    const key = crypto.createHash("sha256").update(secretKey).digest(); // Creare una chiave utilizzando la parola segreta

    // Separare il vettore di inizializzazione dal messaggio cifrato
    const iv = Buffer.from(encryptedMessage.slice(0, 32), "hex");
    const encrypted = encryptedMessage.slice(32);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  function getStatusText(status: any) {
    switch (status) {
      case 6:
        return "Revealed";
      case 5:
        return "Punished";
      case 4:
        return "Finalized";
      case 3:
        return "Submitted";
      case 2:
        return "Accepted";
      case 1:
        return "Proposed";
      default:
        return "Waiting for Creator";
    }
  }

  async function decodeData() {
    if (feedData[1][2].decryptedData != "0x30783030") {
      const decryptedData = AbiCoder.decode(["string", "string"], feedData[1][2].decryptedData);

      const encryptedData = await ErasureHelper.multihash({
        input: feedData[1][2].encryptedData,
        inputType: "sha2-256",
        outputType: "b58",
      });

      const encryptedKey = await ErasureHelper.multihash({
        input: feedData[1][2].encryptedKey,
        inputType: "sha2-256",
        outputType: "b58",
      });

      notification.success(
        <div>
          {" "}
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${decryptedData[0]}`} target="_blank">
              <p>Decrypted Data[0]: {decryptedData[0]}</p>
            </a>
          </p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${decryptedData[1]}`} target="_blank">
              <p>Decrypted Data[1]: {decryptedData[1]}</p>
            </a>
          </p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${encryptedData}`} target="_blank">
              <p>Encrypted Data: {encryptedData}</p>
            </a>
          </p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${encryptedKey}`} target="_blank">
              <p>Encrypted Key: {encryptedKey}</p>
            </a>
          </p>{" "}
        </div>,
      );
    } else {
      const encryptedData = await ErasureHelper.multihash({
        input: feedData[1][2].encryptedData,
        inputType: "sha2-256",
        outputType: "b58",
      });

      notification.info(
        <div>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${encryptedData}`} target="_blank">
              <p>Encrypted Data: {encryptedData}</p>
            </a>
          </p>
        </div>,
      );
    }
  }

  const handleImageDrop = (acceptedFiles: React.SetStateAction<any>[]) => {
    setImageFile(acceptedFiles[0]);
    uploadJsonToIpfs(acceptedFiles[0]);
  };

  //******************** IPFS *********************//

  const uploadImageToIpfs = async (file: Blob | any) => {
    try {
      if (!file) {
        throw new Error("No file specified");
      }
      console.log(file);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // zip file
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setPostRawData(reader.result);
        };
        reader.onerror = event => {
          reject(event);
        };
        notification.success("File uploaded to IPFS");
        setImage(String(reader.result));
      });
    } catch (error) {
      notification.error('Error uploading file: "${error}');
    }
  };

  const uploadJsonToIpfs = async (imageFile: any) => {
    try {
      await uploadImageToIpfs(imageFile);
    } catch (error) {
      notification.error('Error uploading file: "${error}');
    }
  };

  async function savePost(RawData: string): Promise<any | void> {
    console.log("Saving Data...");

    // Check Pinata credentials.
    if (!pinataApiKey || !pinataApiSecret) {
      console.log("Please call with Pinata Account Credentials");
      return;
    }

    // Authenticate with Pinata.
    const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);
    const pinataAuth = await pinata.testAuthentication();
    if (pinataAuth?.authenticated !== true) {
      console.log("Pinata Authentication Failed.");
      return;
    }

    // Create post data.
    const postData = await createPostData(RawData);

    if (!postData) {
      console.log("Error creating post data.");
      return;
    }

    // Save encrypted data to IPFS.
    try {
      let pin = await pinata.pinJSONToIPFS({ encryptedData: postData.encryptedData });
      if (pin?.IpfsHash !== postData.proofJson.encryptedDatahash) {
        console.log("Error with Encrypted Data Hash.");
        return;
      }

      // Save proof JSON to IPFS.
      pin = await pinata.pinJSONToIPFS(postData.proofJson);
      if (pin.IpfsHash !== postData.proofhash) {
        console.log("Error with proof Hash.");
        return;
      }

      console.log("Data Saved.");
      return postData;
    } catch (err) {
      console.log("Error saving data to IPFS:", err);
    }
  }

  //******************** useEffects *********************//

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        console.log("Fetching Data...");
        await fetchData();
        setSismoData(JSON.parse(String(localStorage.getItem("sismoData"))));
        setVerified(localStorage.getItem("verified"));
        setSismoResponse(localStorage.getItem("sismoResponse"));
        setNonce(String(localStorage.getItem("nonce")));
        setWithdrawalAddress(String(localStorage.getItem("withdrawalAddress")));

        if (sismoData) {
          const _message = await getSecretMessage();
          console.log("Message: ", _message);
          setMessage(_message);
        }
        console.log(feedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(() => {
      if (signer && provider && feedCtx && router.isReady) {
        fetchDataAsync();
      }
    }, Number(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL));

    // Cleanup function
    return () => clearInterval(interval);
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const run = async () => {
      const yourStake = await feedCtx?.getStake(
        feedData?.postdata?.settings?.tokenId,
        keccak256(sismoData.auths[0].userId),
      );
      setYourStake(yourStake);
    };
    if (sismoData) {
      run();
    }
  }, [feedCtx]);

  type ModalProps = {
    title: string;
    modalId: string;
    children: React.ReactNode;
  };

  const handleSelectToken = async (e: any) => {
    const token = e;
    if (token === "ETH") {
      setTokenId("0");
    } else if (token === "MUSE") {
      setTokenId("1");
    } else if (token === "DAI") {
      setTokenId("2");
    }
    console.log("Token ID: ", tokenId);
  };

  return (
    <div className="flex flex-col items-center pt-2 p-2 w-10/12 mx-auto ">
      {feedData[0] != null ? (
        <div className="flex flex-col text-left bg-primary rounded-lg">
          <div className="flex flex-col mb-5  min-w-fit items-left justify-center w-full">
            <div className="flex flex-row gap-5 mx-10 my-5">
              <div className="dropdown dropdown-bottom">
                <label tabIndex={0} className="hover:bg-secondary-focus btn btn-ghost bg-inherit">
                  <DocumentCheckIcon className="h-8 w-8 mx-2" /> Seller
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    {" "}
                    <label htmlFor="modal-create" className="feedData.postData font-semibold">
                      Create
                    </label>
                  </li>
                  <li>
                    <label htmlFor="modal-submit" className="feedData.postData font-semibold ">
                      Submit
                    </label>
                  </li>
                  <li>
                    <label htmlFor="modal-reveal" className="feedData.postData font-semibold ">
                      Reveal
                    </label>
                  </li>
                  <li>
                    <label
                      className="feedData.postData font-semibold "
                      onClick={async () => {
                        await renounce();
                      }}
                    >
                      Renounce
                    </label>
                  </li>
                </ul>
              </div>
              <div className="dropdown dropdown-bottom">
                <label tabIndex={0} className="hover:bg-secondary-focus btn btn-ghost bg-inherit">
                  <MegaphoneIcon className="h-8 w-8 mx-2" /> Buyer
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    {" "}
                    <label htmlFor="modal-accept" className=" font-semibold">
                      Accept
                    </label>
                  </li>
                  <li>
                    <label htmlFor="modal-retrieve" className="font-semibold">
                      Retrieve
                    </label>
                  </li>
                  <li>
                    <label htmlFor="modal-finalize" className="font-semibold">
                      Finalize
                    </label>
                  </li>
                </ul>
              </div>
              <div className="dropdown dropdown-bottom">
                <label tabIndex={0} className="hover:bg-secondary-focus btn btn-ghost bg-inherit">
                  <ScaleIcon className="h-8 w-8 mx-2" /> Stake
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    {" "}
                    <label htmlFor="modal-stake" className="feedData.postData font-semibold">
                      Stake
                    </label>
                  </li>
                  <li>
                    <label
                      className="feedData.postData font-semibold"
                      onClick={() => {
                        decodeData();
                      }}
                    >
                      Decode
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap text-xl mb-5 mx-10 font-bold hover:text-success animate-pulse">
            {feedData.postdata.settings.status === 6
              ? "Waiting for Seller"
              : feedData.postdata.settings.status === 5
              ? "Waiting for Seller"
              : feedData.postdata.settings.status === 4
              ? "Waiting for Seller"
              : feedData.postdata.settings.status === 3
              ? "Waiting for buyer validate the data"
              : feedData.postdata.settings.status === 2
              ? "Waiting for submission from seller"
              : feedData.postdata.settings.status === 1
              ? "Waiting for Acceptance from a buyer"
              : "Waiting for Seller"}
          </div>
          <div className="mx-10  font-base text-lg">
            Smart Contract address is <strong>{addr}</strong>{" "}
          </div>
          <div className="mx-10  mb-5 font-base text-lg">
            Your current deposit is <strong>{formatEther(yourStake)} ETH</strong>
          </div>
          <div className="flex flex-col  mb-16  min-w-fit items-left justify-center w-full">
            <ul className="steps">
              {allStatuses.map((statusText, index) => {
                const currentStatus = feedData?.postdata?.settings?.status;
                const currentStatusText = getStatusText(currentStatus);

                return (
                  <li className={`step ${statusText === currentStatusText ? "step-info" : ""}`} key={index}>
                    {statusText}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col mt-5 mb-16 min-w-fit items-left justify-center w-full border-2 p-10 border-primary-focus rounded-xl">
            <div className="text-2xl font-bold mx-10">Messenger</div>
            <div className="text-base font-light mx-10">Comunicate with buyer/seller or mecenate community</div>s
            <a href="https://t.me/mecenate_message_bot" className="link-hover mx-10">
              Telegram Bot
            </a>
            <a href="https://t.me/mecenate_message_bot" className="link-hover mx-10">
              Telegram Channel
            </a>
            <div className="mx-10  font-base text-lg">
              <input
                type="text"
                className="input w-full mt-8"
                placeholder="Message to send"
                onChange={e => setSecretMessage(e.target.value)}
              />{" "}
              <button
                className="btn btn-primary mt-8"
                onClick={() => {
                  sendSecretMessage();
                }}
              >
                <PaperAirplaneIcon className="h-8 w-8 mx-2" /> Send On-Chain
              </button>
              {sismoData && sismoData.auths[2] && sismoData.auths[2].userId ? (
                <div>
                  <button
                    className="btn btn-primary mt-8 "
                    onClick={() => {
                      sendTelegramMessage();
                    }}
                    disabled={!sismoData.auths[2].userId}
                  >
                    <PaperAirplaneIcon className="h-8 w-8 mx-2" /> Send Private on Telegram
                  </button>
                </div>
              ) : (
                <div></div>
              )}
              <div className="flex flex-row my-10">
                <InboxArrowDownIcon className="h-8 w-8 mx-5 " />
                <div className="flex flex-col">
                  <span className="text-xs mb-2">Last On-Chain Message Received</span>
                  {message && message != "" ? (
                    <div className="font-base text-lg">{message}</div>
                  ) : (
                    <div className="font-base text-lg">No Message</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <input type="checkbox" id="modal-create" className="modal-toggle " />
            <div className="modal">
              <div className="modal-box rounded-lg shadow-xl">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Create Post</div>
                  <label htmlFor="modal-create" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body w-auto space-y-6 text-left">
                  <label className="block text-base-500">Duration</label>
                  <select
                    key={5}
                    className="form-select w-full mb-8"
                    value={postDuration}
                    onChange={e => setPostDuration(e.target.value)}
                  >
                    <option>Select Duration</option>
                    <option value="0">1 Days</option>
                    <option value="1">3 Days</option>
                    <option value="2">1 Week</option>
                    <option value="3">2 Weeks</option>
                    <option value="4">1 Month</option>
                  </select>
                  <label className="block text-base-500 mt-8">Stake</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Amount"
                    value={postStake}
                    onChange={e => setPostStake(e.target.value)}
                  />

                  <select
                    className="select select-text bg-transparent my-4"
                    name="tokens"
                    id="tokens"
                    onChange={e => handleSelectToken(e.target.value)}
                  >
                    <option value="Nan">Select Token</option>
                    <option value="ETH">ETH</option>
                    <option value="MUSE">MUSE</option>
                    <option value="DAI">DAI</option>
                  </select>

                  {tokenId == "1" || tokenId == "2" ? (
                    <div>
                      <button
                        className="btn btn-primary w-full mt-4"
                        onClick={async () => {
                          await handleApproveTokenSeller();
                        }}
                      >
                        Approve
                      </button>
                    </div>
                  ) : null}
                  <label className="block text-base-500 mt-8">Buyer Payment </label>

                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Put 0 to allow buyer decide the payment"
                    value={buyerPayment}
                    onChange={e => setBuyerPayment(e.target.value)}
                  />

                  <label className="block text-base-500">Type</label>
                  <select className="form-select w-full" value={postType} onChange={e => setPostType(e.target.value)}>
                    <option>Select Type</option>
                    <option value="0">Text</option>
                    <option value="1">Image</option>
                    <option value="2">Video</option>
                    <option value="3">Audio</option>
                    <option value="4">File</option>
                  </select>
                  {postType == 0 ? (
                    <div>
                      <label className="block text-base-500">Message</label>
                      <input
                        type="text"
                        className="input w-full my-4"
                        placeholder="Data"
                        value={postRawData}
                        onChange={e => setPostRawData(e.target.value)}
                      />
                    </div>
                  ) : postType == 1 || 2 || 3 || 4 ? (
                    <div>
                      <Dropzone onDrop={handleImageDrop}>
                        {({ getRootProps, getInputProps }) => (
                          <div
                            {...getRootProps()}
                            className="flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer"
                          >
                            <input {...getInputProps()} />
                            {imageFile ? (
                              <p>{imageFile?.name}</p>
                            ) : (
                              <p>Drag &apos;n&apos; drop an image here, or click to select a file</p>
                            )}
                          </div>
                        )}
                      </Dropzone>
                    </div>
                  ) : null}
                  <button
                    className="btn btn-primary w-full mt-4"
                    onClick={async () => {
                      createPost();
                    }}
                  >
                    Create Post
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-create" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
            <input type="checkbox" id="modal-submit" className="modal-toggle " />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Submit encrypted key</div>
                  <label htmlFor="modal-submit" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <input
                    type="password"
                    className="input w-full"
                    placeholder="Symmetric Key"
                    value={symmetricKey}
                    onChange={e => setSymmetricKey(e.target.value)}
                  />
                  <br />
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      const postData = await submitData();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-submit" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
            <input type="checkbox" id="modal-reveal" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Reveal Post</div>
                  <label htmlFor="modal-reveal" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <br />
                  <input
                    type="password"
                    className="input w-full"
                    placeholder="Symmetric Key"
                    value={symmetricKey}
                    onChange={e => setSymmetricKey(e.target.value)}
                  />
                  <br />
                  <label className="block text-base-500">Type</label>
                  <select
                    key={5}
                    className="form-select w-full"
                    value={postType}
                    onChange={e => setPostType(e.target.value)}
                  >
                    <option value="0">Text</option>
                    <option value="1">Image</option>
                    <option value="2">Video</option>
                    <option value="3">Audio</option>
                    <option value="4">File</option>
                  </select>
                  {postType == 0 ? (
                    <div>
                      <label className="block text-base-500">Message</label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="Data"
                        value={postRawData}
                        onChange={e => setPostRawData(e.target.value)}
                      />
                    </div>
                  ) : postType == 1 || 2 || 3 || 4 ? (
                    <div>
                      <Dropzone onDrop={handleImageDrop}>
                        {({ getRootProps, getInputProps }) => (
                          <div
                            {...getRootProps()}
                            className="flex items-center justify-center w-full h-32 rounded-md border-2 border-gray-300 border-dashed cursor-pointer"
                          >
                            <input {...getInputProps()} />
                            {imageFile ? (
                              <p>{imageFile?.name}</p>
                            ) : (
                              <p>Drag &apos;n&apos; drop an image here, or click to select a file</p>
                            )}
                          </div>
                        )}
                      </Dropzone>
                    </div>
                  ) : null}
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      const postData = await revealPost();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-reveal" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
            <input type="checkbox" id="modal-accept" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Accept Post</div>
                  <label htmlFor="modal-accept" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                {feedData.postdata.settings.tokenId == 1 || feedData.postdata.settings.tokenId == 2 ? (
                  <div>
                    <button
                      className="btn btn-primary w-full mt-4 my-2"
                      onClick={async () => {
                        await handleApproveTokenBuyer();
                      }}
                    >
                      Approve
                    </button>
                  </div>
                ) : null}
                <div className="modal-body space-y-4 text-left">
                  Amount to Pay for Data {""}
                  <input
                    type="text"
                    className="input w-full mt-8"
                    placeholder="Amount"
                    value={postPayment}
                    onChange={e => setPostPayment(e.target.value)}
                  />
                  <br />
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      await acceptPost();
                    }}
                  >
                    Accept Post
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-accept" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
            <input type="checkbox" id="modal-retrieve" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Retrieve Post</div>
                  <label htmlFor="modal-retrieve" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      const postData = await retrievePost();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-retrieve" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
            <input type="checkbox" id="modal-finalize" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Finalize Post</div>
                </div>

                <div className="modal-body space-y-4 text-left">
                  <br />
                  ETH to destroy from seller stake if your data is not valid
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Punishment"
                    disabled={valid}
                    value={punishment}
                    onChange={e => setPunishment(e.target.value)}
                  />
                  <span className="divider my-5"></span>
                  Validate and send your payment to seller
                  <br />
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={valid}
                    onChange={e => {
                      setValid(e.target.checked);
                    }}
                  />
                  <label className="ml-2">Valid</label>
                  <br />
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      const postData = await finalizePost();
                      console.log(postData);
                    }}
                  >
                    Submit
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-finalize" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
            <input type="checkbox" id="modal-stake" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <div className="modal-header">
                  <div className="modal-title text-2xl font-bold">Stake</div>
                  <label htmlFor="modal-stake" className="btn btn-ghost">
                    <i className="fas fa-times"></i>
                  </label>
                </div>
                <div className="modal-body space-y-4 text-left">
                  <br />
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Stake Amount"
                    value={stakeAmount}
                    onChange={e => setStakeAmount(e.target.value)}
                  />

                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      addStake();
                    }}
                  >
                    Add Stake
                  </button>
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      takeStake();
                    }}
                  >
                    Take Stake
                  </button>
                  <button
                    className="btn  w-full"
                    onClick={async () => {
                      takeAll();
                    }}
                  >
                    Take All
                  </button>
                </div>
                <div className="modal-action space-x-2 mt-4">
                  <label htmlFor="modal-stake" className="btn">
                    Close
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mb-16  min-w-fit items-left justify-center w-full border-2 p-10 rounded-xl border-primary-focus">
            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-2xl font-bold">Feed Info</h2>
                <div className="mt-2">
                  <p className="text-base">
                    <span className="font-bold">Post Status</span> <br />
                    {feedData.postdata.settings.status === 6
                      ? "Revealed"
                      : feedData.postdata.settings.status === 5
                      ? "Punished"
                      : feedData.postdata.settings.status === 4
                      ? "Finalized"
                      : feedData.postdata.settings.status === 3
                      ? "Submitted"
                      : feedData.postdata.settings.status === 2
                      ? "Accepted"
                      : feedData.postdata.settings.status === 1
                      ? "Proposed"
                      : "Waiting for Creator"}
                  </p>
                  <div className="w-fit">
                    <p className="text-base">
                      <span className="font-bold">Stake</span> <br /> {formatEther(feedData[1][1].stake.toString())} ETH
                    </p>
                  </div>
                  <div className="w-fit">
                    <p className="text-base">
                      <span className="font-bold">Reward</span> <br />
                      {formatEther(feedData[1][1].payment.toString())} ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="card w-full md:w-fit">
              <div className="card-body">
                <h2 className="text-2xl font-bold">Post Settings</h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Creation</span> <br />
                    {new Date(Number(feedData[1][0].creationTimeStamp) * 1000).toUTCString()}
                  </p>
                  <p>
                    <span className="font-bold">Expire</span>
                    <br />
                    {new Date(Number(feedData[1][0].endTimeStamp) * 1000).toString()}
                  </p>
                  <p>
                    <span className="font-bold">Duration</span> <br />
                    {Number(feedData[1][0].duration.toString() * 1000) / 86400000} days{" "}
                  </p>
                  <p>
                    <span className="font-bold">File Type</span> <br />
                    {feedData[1][0].postType.toString() == 0
                      ? "Text"
                      : feedData[1][0].postType.toString() == 1
                      ? "Image"
                      : feedData[1][0].postType.toString() == 2
                      ? "Video"
                      : feedData[1][0].postType.toString() == 3
                      ? "Audio"
                      : feedData[1][0].postType.toString() == 4
                      ? "File"
                      : null}
                  </p>
                  <p>
                    <span className="font-bold">Status</span>
                    <br />
                    {feedData[1][0].status.toString() == 0
                      ? "Waiting"
                      : feedData[1][0].status.toString() == 1
                      ? "Proposed"
                      : feedData[1][0].status.toString() == 2
                      ? "Accepted"
                      : feedData[1][0].status.toString() == 3
                      ? "Submitted"
                      : feedData[1][0].status.toString() == 4
                      ? "Finalized"
                      : feedData[1][0].status.toString() == 5
                      ? "Punished"
                      : feedData[1][0].status.toString() == 6
                      ? "Revealed"
                      : null}
                  </p>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-2xl font-bold">Punishment</h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Buyer Penalty</span> <br />{" "}
                    {formatEther(feedData[1][1].penalty.toString())}
                  </p>
                  <p>
                    <span className="font-bold">Seller Punishment</span> <br />{" "}
                    {formatEther(feedData[1][1].punishment.toString())}
                  </p>
                  <p>
                    <span className="font-bold">Seller Stake</span> <br />{" "}
                    {formatEther(feedData[1][1].stake.toString())}
                  </p>
                  <p>
                    <span className="font-bold">Buyer Payment</span> <br />{" "}
                    {formatEther(feedData[1][1].payment.toString())}
                  </p>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="card w-fit">
              <div className="card-body">
                <h2 className="text-2xl font-bold">Data</h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Encrypted Data</span> <br />{" "}
                    <span className="break-all">{feedData[1][2].encryptedData.toString()}</span>
                  </p>
                  <p>
                    <span className="font-bold">Encrypted Key</span> <br />{" "}
                    <span className="break-all"> {feedData[1][2].encryptedKey.toString()}</span>
                  </p>

                  <p>
                    <span className="font-bold">Decrypted Data IPFS Hash</span> <br />
                    <span className="break-all"> {feedData[1][2].decryptedData.toString()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

function base64Mime(encoded: string) {
  let result = null;

  if (typeof encoded !== "string") {
    return result;
  }

  const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
}

export default ViewFeed;
