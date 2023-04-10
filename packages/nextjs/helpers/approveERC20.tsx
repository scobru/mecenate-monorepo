// pages/api/submissions.ts
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { ContractInterface, ethers } from "ethers";

export interface Props {
    chainId: number;
    addr: string;
}

export async function approve(tokenType: string, amount: string, address: string, props: Props) {
    // Get your Notion secret integration key on https://www.notion.so/my-integrations
    // More info about integrations: https://developers.notion.com/docs/create-a-notion-integration
    const deployedContractMuse = getDeployedContract(props.chainId.toString() || "", "MUSE");
    const deployedContractDai = getDeployedContract(props.chainId.toString() || "", "MockDAI");

    let museAddress = "";
    let museAbi: ContractInterface[] = [];

    let daiAddress = "";
    let daiAbi: ContractInterface[] = [];

    if (deployedContractMuse) {
        ({ address: museAddress, abi: museAbi } = deployedContractMuse);
    }

    if (deployedContractDai) {
        ({ address: daiAddress, abi: daiAbi } = deployedContractDai);
    }

    if (tokenType === "1") {
        const museContract = new ethers.Contract(museAddress, museAbi[0], props.addr);
        const approve = await museContract?.approve(address, amount);
        return approve;
    } else if (tokenType === "2") {
        const daiContract = new ethers.Contract(daiAddress, daiAbi[0], props.addr);
        const approve = await daiContract?.approve(address, amount);
        return approve;
    }
}
