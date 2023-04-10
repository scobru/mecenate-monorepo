// pages/api/submissions.ts
import { getDeployedContract } from "../components/scaffold-eth/Contract/utilsContract";
import { useProvider, useNetwork, useSigner, useContract } from "wagmi";
import { ContractInterface, ethers } from "ethers";


const approveERC20: any = () => {
    const provider = useProvider();

    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    // Get your Notion secret integration key on https://www.notion.so/my-integrations
    // More info about integrations: https://developers.notion.com/docs/create-a-notion-integration
    const deployedContractMuse = getDeployedContract(chain?.id.toString(), "MUSE");
    const deployedContractDai = getDeployedContract(chain?.id.toString(), "MockDAI");


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

    const museCtx = useContract({
        address: museAddress,
        abi: museAbi,
        signerOrProvider: signer || provider,
    });

    const daiCtx = useContract({
        address: daiAddress,
        abi: daiAbi,
        signerOrProvider: signer || provider,
    });

    async function approve(tokenType: string, amount: string, address: string) {
        if (tokenType === "1") {
            const approve = await museCtx?.approve(address, amount);
            return approve;
        } else if (tokenType === "2") {
            const approve = await daiCtx?.approve(address, amount);
            return approve;
        }
    }
}

export default approveERC20;
