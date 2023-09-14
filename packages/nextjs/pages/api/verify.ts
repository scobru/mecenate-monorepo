import { SismoConnect, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-server";
import { AUTHS, CONFIG, SIGNATURE_REQUEST } from "../../sismo.config";

const sismoConnect = SismoConnect({ config: CONFIG });
const TIMEOUT_DURATION = 5000; // 5 seconds

// Promise that resolves after a set time
const timeout = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

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

  try {
    // Promise.race will resolve or reject as soon as one of the promises resolves or rejects
    const result = await Promise.race([
      sismoConnect.verify(sismoConnectResponse, {
        auths: AUTHS,
        signature: SIGNATURE_REQUEST,
      }),
      timeout(TIMEOUT_DURATION).then(() => {
        throw new Error("Timeout");
      }),
    ]);

    return res.json(result);
  } catch (e) {
    console.error(e);
    const statusCode = e === "Timeout" ? 408 : 500;
    return res.status(statusCode).json({ error: e });
  }
}
