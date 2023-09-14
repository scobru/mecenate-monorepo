// pages/api/verifySismo.js
import { SismoConnect, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-server";
import { AUTHS, CONFIG, SIGNATURE_REQUEST } from "../../sismo.config";

const sismoConnect = SismoConnect({ config: CONFIG });

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

  const sismoConnectResponse = req.body; // Use req.body instead of req.json()
  try {
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(sismoConnectResponse, {
      auths: AUTHS,
      signature: SIGNATURE_REQUEST,
    });
    console.log(JSON.stringify(result, null, 2));
    return res.json(result); // Use res.json() instead of Response.json()
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
