import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
const crypto = require("asymmetric-crypto");
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { Contract, ContractInterface, ethers, utils } from "ethers";
const DEBUG = true;

const CreateUser: NextPage = () => {
  const network = useNetwork();
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const deployedContractUser = getDeployedContract(chain?.id.toString(), "MecenateUsers");
  const deployedContractIdentity = getDeployedContract(chain?.id.toString(), "MecenateIdentity");

  const [pubKey, setPubKey] = React.useState<string>("");

  let UsersAddress!: string;
  let UsersAbi: ContractInterface[] = [];

  type UserData = {
    mecenateID: Number;
    wallet: String;
    publicKey: String;
  };

  let identityAddress!: string;
  let identityAbi: ContractInterface[] = [];

  if (deployedContractIdentity) {
    ({ address: identityAddress, abi: identityAbi } = deployedContractIdentity);
  }

  if (deployedContractUser) {
    ({ address: UsersAddress, abi: UsersAbi } = deployedContractUser);
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

  async function create() {
    console.log("Generating Key Pair...");
    const kp = crypto.keyPair();
    const keypairJSON = JSON.stringify({
      publicKey: kp.publicKey,
      secretKey: kp.secretKey,
    });
    console.log(keypairJSON);
    setPubKey(kp.publicKey.toString());
    notification.success("Key pair created");
    notification.warning("Save your key pair");
    notification.info(
      <div>
        <p>
          PUBLIC KEY : <br /> {kp.publicKey.toString()}
        </p>
        <p>
          SECRET KEY : <br /> {kp.secretKey.toString()}
        </p>
      </div>,
    );
  }

  async function signIn() {
    const abicoder = new utils.AbiCoder();
    const publicKey = abicoder.encode(["string"], [pubKey]);
    const seller = await signer?.getAddress();
    const mecenateID = await identity?.identityByAddress(seller);
    console.log(publicKey);
    console.log(seller);
    console.log(mecenateID);

    if (seller) {
      const user: UserData = {
        mecenateID: mecenateID,
        wallet: seller,
        publicKey: publicKey,
      };
      const tx = await usersCtx?.registerUser(user);

      notification.success("User registered");

      notification.info("Transaction hash: " + tx.hash);
    }
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10 text-black">
      <button
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700 my-2"
        onClick={create}
      >
        Create Key Pair
      </button>
      <button
        className="btn w-1/2 p-2 border rounded-md shadow-sm bg-primary-500 text-white hover:bg-primary-700"
        onClick={async () => {
          await signIn();
        }}
      >
        Sign In
      </button>
    </div>
  );
};

export default CreateUser;
