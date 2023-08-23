// pages/api/verifySismo.js
import { SismoConnect, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-server";
import { AUTHS, CLAIMS, CONFIG, SIGNATURE_REQUEST, AuthType } from "../../sismo.config";

const sismoConnect = SismoConnect({ config: CONFIG });

export default async function verify(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const sismoConnectResponse = req.body; // Use req.body instead of req.json()
  try {
    let result: SismoConnectVerifiedResult = await sismoConnect.verify(sismoConnectResponse, {
      auths: AUTHS,
      claims: CLAIMS,
      signature: SIGNATURE_REQUEST,
    });
    const vaultId = result.getUserId(AuthType.VAULT);
    const userId = result.getUserId(AuthType.USER);
    console.log("VaultId:", vaultId);
    console.log("UserId:", userId);
    result.userId = userId;
    result.vaultId = vaultId;
    console.log(JSON.stringify(result, null, 2));
    return res.json(result); // Use res.json() instead of Response.json()
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
