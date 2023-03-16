import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useContract, useProvider, useNetwork, useSigner, useAccount } from "wagmi";
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
import { formatEther } from "ethers/lib/utils.js";
import { utils } from "ethers";
import { createKeyPair } from "../../client/src/createKeyPair";

/* configure Infura auth settings */
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const projectGateway = process.env.IPFS_GATEWAY;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const DEBUG = true;

const CreateKey: NextPage = () => {
  const network = useNetwork();
  const provider = useProvider();
  const signer = useSigner();

  async function create() {
    const keyPair = await createKeyPair();
    notification.success("Key pair created");
    notification.info(keyPair?.publicKey);
    notification.info(keyPair?.secretkey);
  }

  return (
    <div>
      <button onClick={create}>Create Key Pair</button>
    </div>
  );
};

export default CreateKey;
