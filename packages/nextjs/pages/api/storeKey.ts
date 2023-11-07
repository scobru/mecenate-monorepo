import axios from "axios";
import fse from "fs-extra"
import { Mogu } from "@scobru/mogu";
import { EncryptedNode } from "@scobru/mogu/dist/db/db";

interface IResponse {
  error?: string;
  message?: string;
  data?: any;
}

const fetchFromIpfs = async (cid: string): Promise<any> => {
  try {
    const url = `https://sapphire-financial-fish-885.mypinata.cloud/ipfs/${cid}`;
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch from IPFS via Pinata");
    }
  } catch (err) {
    console.error(`Error fetching from IPFS via Pinata: ${err}`);
    throw err;
  }
};

export default async function handler(
  req: {
    method: string;
    body: { wallet: any; salt: any; iv: any; ciphertext: any };
    query: { wallet: any };
  },
  res: {
    status: (arg0: any) => {
      (): any;
      new(): any;
      json: { (arg0: IResponse): void; new(): any }; // Usa IResponse qui
      end: { (): void; new(): any };
    };
  },
) {
  if (req.method === "POST") {
    const mogu = new Mogu(
      undefined,
      process.env.NEXT_PUBLIC_APP_KEY,
      process.env.NEXT_PUBLIC_APP_NONCE,
      process.env.NEXT_PUBLIC_PINATA_API_KEY,
      process.env.NEXT_PUBLIC_PINATA_API_SECRET,
    );

    let { wallet, salt, iv, ciphertext } = req.body;
    let state;
    let cid;

    if (fse.existsSync(process.cwd() + "/pages/api/data/cids.json")) {
      const rawData = fse.readFileSync(process.cwd() + "/pages/api/data/cids.json", "utf8");
      cid = JSON.parse(rawData);
    }

    if (cid == null) {
      const node: EncryptedNode = {
        id: String(wallet),
        type: "FILE",
        name: wallet,
        parent: "",
        children: [],
        content: JSON.stringify({ salt, iv, ciphertext }),
      };

      try {
        state = await mogu.addNode(node);
        console.log(state);
      } catch (error) {
        console.log(error);
      }

      const hash = await mogu.store();
      console.log(hash);

      fse.writeFileSync(process.cwd() + "/pages/api/data/cids.json", JSON.stringify(hash));

      return res.status(200).json({
        message: "Key stored and pinned to IPFS via Pinata successfully",
        data: hash,
      });

    } else {
      state = await mogu.load(String(cid));
      console.log("Old CID", cid)
      console.log("State:", state);

      const node: EncryptedNode = {
        id: String(wallet),
        type: "FILE",
        name: wallet,
        parent: "",
        children: [],
        content: JSON.stringify({ salt, iv, ciphertext }),
      };

      try {
        state = mogu.updateNode(node);
        console.log(state);

        const hash = await mogu.store();
        console.log("New CID", hash);

        fse.writeFileSync(process.cwd() + "/pages/api/data/cids.json", JSON.stringify(hash));
        return res.status(200).json({
          message: "Key stored and pinned to IPFS via Pinata successfully",
          data: hash,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  // GET Section
  if (req.method === "GET") {
    const mogu = new Mogu(
      undefined,
      process.env.NEXT_PUBLIC_APP_KEY,
      process.env.NEXT_PUBLIC_APP_NONCE,
      process.env.NEXT_PUBLIC_PINATA_API_KEY,
      process.env.NEXT_PUBLIC_PINATA_API_SECRET,
    );

    const { wallet } = req.query;
    let cid;
    let state;

    if (fse.existsSync(process.cwd() + "/pages/api/data/cids.json")) {
      const rawData = fse.readFileSync(process.cwd() + "/pages/api/data/cids.json", "utf8");
      cid = JSON.parse(rawData);
    }

    console.log("IPFS hash", cid);

    try {
      state = await mogu.load(String(cid));
      state = mogu.queryByName(wallet);
    } catch (error) {
      console.log(error);
    }

    state = JSON.stringify(state);

    if (state) {
      res.status(200).json({ data: state });
    } else {
      res.status(404).json({ message: "No private key found for this contract address" });
    }
  }
}
