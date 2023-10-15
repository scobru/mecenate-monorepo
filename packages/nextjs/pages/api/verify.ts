import { SismoConnect, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-server";
import { AUTHS, CONFIG, SIGNATURE_REQUEST } from "../../sismo.config";
import { keccak256 } from "ethers/lib/utils.js";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ethers } from "ethers";
import contracts from "~~/generated/hardhat_contracts.json";

const sismoConnect = SismoConnect({ config: CONFIG });
const TIMEOUT_DURATION = 150000; // 9 seconds
const chainId = 84531;

const vaultAddress = contracts[84531][0].contracts.MecenateVault.address;

// Promise that resolves after a set time
const timeout = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

const signMessage = () => {
  // encode parameters with ethers encode
  return ethers.utils.defaultAbiCoder.encode(["bytes32"], [keccak256(String(vaultAddress)) as `0x${string}`]);
};

export default async function verify(
  req: { method: string; body: any },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      end: { (): any; new (): any };
      json: { (arg0: { error: any }): any; new (): any };
    };
    json: (arg0: SismoConnectVerifiedResult) => any;
  },
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const sismoConnectResponse = req.body;

  // Retrieve withdrawalAddress from request body
  const withdrawalAddress = req.body.address;
  const forwarderAddress = req.body.address2;

  const signMessage = () => {
    return ethers.utils.defaultAbiCoder.encode(
      ["address", "address"],
      [String(withdrawalAddress), String(forwarderAddress)],
    );
  };

  console.log("Received POST request.");

  try {
    console.log("SismoConnectResponse:", JSON.stringify(sismoConnectResponse));

    const result: SismoConnectVerifiedResult = await Promise.race([
      sismoConnect.verify(sismoConnectResponse, {
        auths: AUTHS,
        signature: { message: signMessage() }, // Use withdrawalAddress here
      }),
      timeout(TIMEOUT_DURATION).then(() => {
        throw new Error("Timeout");
      }),
    ]);

    console.log("Verification result:", JSON.stringify(result));

    return res.json(result);
  } catch (e: any) {
    console.error("Error in verify function: ", e);

    if (e.message === "Timeout") {
      console.error("Error during verification:", e);
      return res.status(408).json({ error: "Request timed out" });
    }

    return res.status(500).json({ error: e.message });
  }
}
