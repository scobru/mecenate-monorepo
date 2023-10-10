import { SismoConnect, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-server";
const TIMEOUT_DURATION = 150000; // 9 seconds

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

  const sig = req.body.sig;
  const auths = req.body.auths;
  const config = req.body.config;

  console.log("Received POST request.");
  console.log("sig:", sig);

  const sismoConnect = SismoConnect({ config: config });

  try {
    console.log("SismoConnectResponse:", JSON.stringify(sismoConnectResponse));

    const result: SismoConnectVerifiedResult = await Promise.race([
      sismoConnect.verify(sismoConnectResponse, {
        auths: auths,
        signature: sig, // Use withdrawalAddress here
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
