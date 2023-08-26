import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import Dropzone from "react-dropzone";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
import { formatEther, keccak256, parseEther, toUtf8Bytes } from "ethers/lib/utils.js";
import { utils } from "ethers";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, CLAIMS, SIGNATURE_REQUEST, AuthType, ClaimType } from "./../sismo.config";
import { sign } from "crypto";
import { useAppStore } from "~~/services/store/store";
import { get } from "http";

const crypto = require("asymmetric-crypto");

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
// const projectGateway = process.env.IPFS_GATEWAY;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const DEBUG = true;

type nftMetadata = {
  name: string;
  image: string;
  description: string;
  owner: string;
};

type ImageProps = {
  cid: string;
};

function readibleHex(userId: string, startLength = 6, endLength = 4, separator = "...") {
  if (!userId?.startsWith("0x")) {
    return userId; // Return the original string if it doesn't start with "0x"
  }
  return userId.substring(0, startLength) + separator + userId.substring(userId.length - endLength);
}

function getProofDataForAuth(sismoConnectResponse: SismoConnectResponse, authType: AuthType): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.auths) {
      for (const auth of proof.auths) {
        if (auth.authType === authType) {
          return proof.proofData;
        }
      }
    }
  }

  return null; // returns null if no matching authType is found
}

function getProofDataForClaim(
  sismoConnectResponse: SismoConnectResponse,
  claimType: number,
  groupId: string,
  value: number,
): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.claims) {
      for (const claim of proof.claims) {
        if (claim.claimType === claimType && claim.groupId === groupId && claim.value === value) {
          return proof.proofData;
        }
      }
    }
  }

  return null; // returns null if no matching claimType, groupId and value are found
}

const Identity: NextPage = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] = React.useState<SismoConnectVerifiedResult>();
  const [sismoConnectResponse, setSismoConnectResponse] = React.useState<SismoConnectResponse>();
  const [pageState, setPageState] = React.useState<string>("init");
  const [error, setError] = React.useState<string>();
  const [fee, setFee] = React.useState(0);
  const [identityFee, setIdentityFee] = React.useState(0);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File>();
  const [image, setImage] = React.useState("");
  const [nftBalance, setNftBalance] = React.useState(0);
  const [nftMetadata, setNftMetadata] = React.useState<{ [key: string]: any[] }>({});
  const [pubKey, setPubKey] = React.useState<string>("");
  const [alreadyUser, setAlreadyUser] = React.useState(false);
  const [responseBytes, setResponseBytes] = React.useState<string>();
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");
  const deployedContractUser = getDeployedContract(chain?.id.toString(), "MecenateUsers");
  const deployedContractTreasury = getDeployedContract(chain?.id.toString(), "MecenateTreasury");
  const deployedContractWallet = getDeployedContract(chain?.id.toString(), "MecenateWallet");
  const [signature, setSignature] = React.useState<string>();
  const store = useAppStore();
  const [amount, setAmount] = React.useState(0);
  const [depositedBalance, setDepositedBalance] = React.useState(0);

  /* Create an instance of the client */
  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  let UsersAddress!: string;
  let UsersAbi: ContractInterface[] = [];

  type UserData = {
    mecenateID: number;
    wallet: string;
    publicKey: string;
  };

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  let treasuryAddress!: string;
  let treasuryAbi: ContractInterface[] = [];

  let walletAddress!: string;
  let walletAbi: ContractInterface[] = [];

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractUser) {
    ({ address: UsersAddress, abi: UsersAbi } = deployedContractUser);
  }

  if (deployedContractTreasury) {
    ({ address: treasuryAddress, abi: treasuryAbi } = deployedContractTreasury);
  }

  if (deployedContractWallet) {
    ({ address: walletAddress, abi: walletAbi } = deployedContractWallet);
  }

  const usersCtx = useContract({
    address: UsersAddress,
    abi: UsersAbi,
    signerOrProvider: signer || provider,
  });

  const identity = useContract({
    address: identityAddress,
    abi: identityAbi,
    signerOrProvider: signer || provider,
  });

  const wallet = useContract({
    address: walletAddress,
    abi: walletAbi,
    signerOrProvider: signer || provider,
  });

  const checkIfUserIsRegistered = async () => {
    const address = await signer?.getAddress();
    const user = await usersCtx?.checkifUserExist(address);
    if (user) {
      setAlreadyUser(true);
    }
  };

  const treasury = useContract({
    address: treasuryAddress,
    abi: treasuryAbi,
    signerOrProvider: signer || provider,
  });

  const uploadImageToIpfs = async (file: Blob | null) => {
    try {
      if (!file) {
        throw new Error("No file specified");
      }

      const added = await client.add({ content: file });
      const cid = added.cid.toString();

      DEBUG && console.log("added", added);
      DEBUG && console.log("cid", cid);
      DEBUG && console.log("path", added.path);

      const url = `https://scobru.infura-ipfs.io/ipfs/${added.cid}`;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          resolve(url);
        };
        reader.onerror = event => {
          reject(event);
        };
        console.log(url);
        notification.info(String(url));
        notification.success("Image uploaded to IPFS");
        setImage(url);
      });
    } catch (error) {
      notification.error("Error uploading image to IPFS");
    }
  };

  const fetchNFTBalance = async () => {
    try {
      const address = await signer?.getAddress();
      const balance = await identity?.balanceOf(address);
      const id = await identity?.identityByAddress(address);
      const metadata = await identity?.tokenURI(Number(id));
      const response = await fetch(metadata);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      DEBUG && console.log("id", Number(id));
      DEBUG && console.log("balance", balance);
      DEBUG && console.log("metadata", metadata);
      DEBUG && console.log("data", data);
      setNftMetadata(data);
      setNftBalance(balance);
    } catch (error) {
      console.error(error);
      // handle error
    }
  };

  const uploadJsonToIpfs = async (identityData: { name: any; description: any }, imageFile: any) => {
    try {
      await uploadImageToIpfs(imageFile);
    } catch (error) {
      notification.error("Error uploading image to IPFS");
    }
  };

  const createIdentity = async (identityData: { name: any; description: any }) => {
    const creator = await signer?.getAddress();

    const nftMetadataWrite = {
      name: identityData.name,
      image: image,
      description: identityData.description,
      owner: creator,
    };
    DEBUG && console.log(nftMetadataWrite);

    try {
      const payload = {
        values: nftMetadataWrite,
        chainId: chain?.id.toString(),
      };

      const errors = {
        name: "",
        description: "",
        image: "",
      };

      const urlRegex = /^(http|https):\/\/[^ "]+$/;

      if (!nftMetadataWrite.name) errors.name = "Name is required";
      if (!nftMetadataWrite.description) errors.description = "Message is required";
      if (nftMetadataWrite.image && !urlRegex.test(nftMetadataWrite.image)) errors.image = "URL is invalid";

      if (errors.name || errors.description || errors.image) {
        return notification.error("Error creating identity");
      }

      const response = await fetch("/api/create_id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Allow-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        notification.success(<span className="font-bold">Submission received! 🎉</span>);
      } else {
        notification.error(
          <>
            <span className="font-bold">Server Error.</span>
            <br />
            Something went wrong. Please try again
          </>,
        );
      }
    } catch (error) {
      console.error(error);
      notification.error(
        <>
          <span className="font-bold">Server Error.</span>
          <br />
          Something went wrong. Please try again
        </>,
      );
    }

    const tx = await identity?.mint(nftMetadataWrite, {
      value: identityFee,
    });

    if (tx?.hash) {
      notification.success("Identity minted successfully!");
    }
    fetchNFTBalance();
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

  async function signIn() {
    // await createPair();
    const seller = await signer?.getAddress();
    if (seller) {
      /*  try {
        const payload = {
          values: sismoConnectVerifiedResult?.auths[1].userId,
          chainId: chain?.id.toString(),
        };
        const response = await fetch("/api/create_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Allow-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(payload),
        });
        if (response.status === 200) {
          notification.success(<span className="font-bold">Submission received! 🎉</span>);
        } else {
          notification.error(
            <>
              <span className="font-bold">Server Error.</span>
              <br />
              Something went wrong. Please try again
            </>,
          );
        }
      } catch (error) {
        console.error(error);
        notification.error(
          <>
            <span className="font-bold">Server Error.</span>
            <br />
            Something went wrong. Please try again
          </>,
        );
      } */

      const tx = await usersCtx?.registerUser(responseBytes);

      notification.success("User registered");
      notification.info("Transaction hash: " + tx.hash);
    }
  }

  const handleNameChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setDescription(event.target.value);
  };

  const handleImageDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles != null && acceptedFiles.length > 0) {
      setImageFile(() => acceptedFiles[0]);
      if (acceptedFiles[0]) {
        uploadJsonToIpfs({ name: name, description: description }, acceptedFiles[0]);
      }
    }
  };

  const handleFormSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const identityData = { name, description };
    await createIdentity(identityData);
    alert("Identity minted successfully!");
  };

  const getContractData = async function getContractData() {
    if (identity && signer) {
      const fee = await treasury?.fixedFee();
      const _identityFee = await treasury?.fixedFee();
      console.log(_identityFee);
      await fetchNFTBalance();
      await checkIfUserIsRegistered();
      setFee(fee);
      setIdentityFee(_identityFee);
    }
  };

  useEffect(() => {
    getContractData();
    getDeposit();
  }, [signer]);

  const deposit = async () => {
    const tx = await wallet?.deposit(responseBytes, {
      value: parseEther(String(amount)),
    });
    if (tx?.hash) {
      notification.success("Deposit successful!");
    }
  };

  const withdraw = async () => {
    const tx = await wallet?.withdraw(responseBytes, parseEther(String(amount)));
    if (tx?.hash) {
      notification.success("Deposit successful!");
    }
  };

  const getDeposit = async () => {
    const tx = await wallet?.getDeposit(responseBytes);
    setDepositedBalance(Number(formatEther(tx)));
  };

  return (
    <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content p-4 m-4 ">
      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col min-w-fit mx-auto items-center mb-20">
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold mb-8">Identity</h1>
            <p className="text-xl  mb-20">Mint your NFT. Become a member of the community.</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800">
            {pageState == "init" ? (
              <>
                <div className="text-center">
                  <SismoConnectButton
                    config={CONFIG}
                    // Auths = Data Source Ownership Requests. (e.g Wallets, Github, Twitter, Github)
                    auths={AUTHS}
                    // Claims = prove group membership of a Data Source in a specific Data Group.
                    // (e.g ENS DAO Voter, Minter of specific NFT, etc.)
                    // Data Groups = [{[dataSource1]: value1}, {[dataSource1]: value1}, .. {[dataSource]: value}]
                    // Existing Data Groups and how to create one: https://factory.sismo.io/groups-explorer
                    // claims={CLAIMS}
                    // Signature = user can sign a message embedded in their zk proof
                    // encode the signature with abi.encode
                    signature={SIGNATURE_REQUEST}
                    text="Join With Sismo"
                    // Triggered when received Sismo Connect response from user data vault
                    onResponse={async (response: SismoConnectResponse) => {
                      setSismoConnectResponse(await response);
                      setPageState("verifying");
                      const verifiedResult = await fetch("/api/verify", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json", // Add this line
                        },
                        body: JSON.stringify(response),
                      });

                      const data = await verifiedResult.json();
                      if (verifiedResult.ok) {
                        setSismoConnectVerifiedResult(data);
                        store.setSismoData(data);
                        setPageState("verified");
                      } else {
                        setPageState("error");
                        setError(data);
                      }
                    }}
                    onResponseBytes={(responseBytes: string) => {
                      setResponseBytes(responseBytes);
                      store.setSismoResponse(responseBytes);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <button
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    {" "}
                    RESET{" "}
                  </button>
                </div>
                <br></br>
                <div className="status-wrapper">
                  {pageState == "verifying" ? (
                    <span className="text-blue-500">Verifying ZK Proofs...</span>
                  ) : (
                    <>
                      {Boolean(error) ? (
                        <span className="text-red-500">Error verifying ZK Proofs: {error.message}</span>
                      ) : (
                        <span className="text-green-500">ZK Proofs verified!</span>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Table of the Sismo Connect requests and verified result */}
            <div className="card bordered">
              <div className="card-body">
                {" "}
                {/* Table for Verified Auths */}
                {sismoConnectVerifiedResult && (
                  <>
                    <h3>Verified Auths</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>AuthType</th>
                          <th>Verified UserId</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sismoConnectVerifiedResult.auths.map((auth, index) => (
                          <tr key={index}>
                            <td>{AuthType[auth.authType]}</td>
                            <td>{auth.userId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                <br />
                {/* Table for Verified Claims */}
                {sismoConnectVerifiedResult && (
                  <>
                    <h3>Verified Claims</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>groupId</th>
                          <th>ClaimType</th>
                          <th>Verified Value</th>
                        </tr>
                      </thead>
                      {/*   <tbody>
                    {sismoConnectVerifiedResult.claims.map((claim, index) => (
                      <tr key={index}>
                        <td>
                          <a target="_blank" href={"https://factory.sismo.io/groups-explorer?search=" + claim.groupId}>
                            {claim.groupId}
                          </a>
                        </td>
                        <td>{ClaimType[claim.claimType!]}</td>
                        <td>{claim.value}</td>
                      </tr>
                    ))}
                  </tbody> */}
                    </table>
                  </>
                )}
              </div>
              {/* Table of the Auths requests*/}
              <h3>Auths requested</h3>
              <table>
                <thead>
                  <tr>
                    <th>AuthType</th>
                    <th>Requested UserId</th>
                    <th>Optional?</th>
                    <th>ZK proof</th>
                  </tr>
                </thead>
                <tbody>
                  {AUTHS.map((auth, index) => (
                    <tr key={index}>
                      {console.log(auth)}
                      <td>{AuthType[auth.authType]}</td>
                      <td>{readibleHex(auth.vaultId || "No userId requested")}</td>
                      <td>{auth.isOptional ? "optional" : "required"}</td>
                      {sismoConnectResponse ? (
                        <td>{readibleHex(getProofDataForAuth(sismoConnectResponse, auth.authType)!)}</td>
                      ) : (
                        <td> ZK proof not generated yet </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <br />

              {/* Table of the Claims requests*/}
              <h3>Claims requested</h3>
              <table>
                <thead>
                  <tr>
                    <th>GroupId</th>
                    <th>ClaimType</th>
                    <th>Requested Value</th>
                    <th>Can User Select Value?</th>
                    <th>Optional?</th>
                    <th>ZK proof</th>
                  </tr>
                </thead>
                {/* <tbody>
                {CLAIMS.map((claim, index) => (
                  <tr key={index}>
                    <td>
                      <a target="_blank" href={"https://factory.sismo.io/groups-explorer?search=" + claim.groupId}>
                        {claim.groupId}
                      </a>
                    </td>
                    <td>{ClaimType[claim.claimType || 0]}</td>
                    <td>{claim.value ? claim.value : "1"}</td>
                    <td>{claim.isSelectableByUser ? "yes" : "no"}</td>
                    <td>{claim.isOptional ? "optional" : "required"}</td>
                    {sismoConnectResponse ? (
                      <td>
                        {readibleHex(
                          getProofDataForClaim(
                            sismoConnectResponse,
                            claim.claimType || 0,
                            claim.groupId!,
                            claim.value || 1,
                          )!,
                        )}
                      </td>
                    ) : (
                      <td> ZK proof not generated yet </td>
                    )}
                  </tr>
                ))}
              </tbody> */}
              </table>

              {/* Table of the Signature request and its result */}
              <h3>Signature requested and verified</h3>
              <table>
                <thead>
                  <tr>
                    <th>Message Requested</th>
                    <th>Can User Modify message?</th>
                    <th>Verified Signed Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{SIGNATURE_REQUEST.message}</td>
                    <td>{SIGNATURE_REQUEST.isSelectableByUser ? "yes" : "no"}</td>
                    <td>
                      {sismoConnectVerifiedResult
                        ? sismoConnectVerifiedResult.signedMessage
                        : "ZK proof not verified yet"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="max-w-lg">
            <div className="max-w-3xl text-center my-20  text-base-content">
              <h1 className="text-6xl font-bold mb-8">Generate your KeyPair.</h1>
              <p className="text-xl  mb-8">
                Once you create your identity, you will be able to generate your own personal public and private key
                that will allow you to interact with the protocol. You can encrypt and decrypt the information you want
                to share with other users in a completely anonymous and decentralized manner.
              </p>
            </div>
            <div className="my-5 ">
              <button
                className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500  hover:bg-primary-700"
                onClick={async () => {
                  await signIn();
                }}
                disabled={sismoConnectResponse != null ? false : true}
              >
                Sign In
              </button>
            </div>

            <div className="my-5 flex-grow">
              <input
                type="text"
                className="input input-bordered"
                placeholder="Amount"
                onChange={e => setAmount(Number(e.target.value))}
              />
              <button
                className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500  hover:bg-primary-700"
                onClick={async () => {
                  await deposit();
                }}
                disabled={sismoConnectResponse != null ? false : true}
              >
                Deposit
              </button>
              <br />
              <br />

              <input
                type="text"
                className="input input-bordered"
                placeholder="Amount"
                onChange={e => setAmount(Number(e.target.value))}
              />
              <button
                className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500  hover:bg-primary-700"
                onClick={async () => {
                  await withdraw();
                }}
                disabled={sismoConnectResponse != null ? false : true}
              >
                Withdraw
              </button>

              {getDeposit && wallet && <p>Deposited Balance: {depositedBalance}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Identity;
