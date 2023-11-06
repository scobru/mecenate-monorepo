import fs from "fs";
import axios from "axios";

import PinataSDK from "@pinata/sdk";
import { Mogu } from "@scobru/mogu";
import { EncryptedNode } from "@scobru/mogu/dist/db/db";

const mogu = new Mogu(
  undefined,
  process.env.NEXT_PUBLIC_APP_KEY,
  process.env.NEXT_PUBLIC_APP_NONCE,
  process.env.NEXT_PUBLIC_PINATA_API_KEY,
  process.env.NEXT_PUBLIC_PINATA_API_SECRET,
);
const pinata = new PinataSDK(process.env.NEXT_PUBLIC_PINATA_API_KEY, process.env.NEXT_PUBLIC_PINATA_API_SECRET);

// La funzione per aggiungere un file JSON a IPFS tramite Pinata
const pinJsonToIpfs = async (data: any) => {
  try {
    const result = await pinata.pinJSONToIPFS(data);
    console.log("Pinata Result: ", result); // Log per debug
    return result.IpfsHash;
  } catch (error) {
    console.log("Pinata Error: ", error); // Log per debug
    throw error;
  }
};

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
      new (): any;
      json: { (arg0: IResponse): void; new (): any }; // Usa IResponse qui
      end: { (): void; new (): any };
    };
  },
) {
  if (req.method === "POST") {
    let { wallet, salt, iv, ciphertext } = req.body;
    let state;

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
    console.log("Hash");
    fs.writeFileSync("./cids.json", JSON.stringify(hash));
    res.status(200).json({
      message: "Key stored and pinned to IPFS via Pinata successfully",
      data: hash,
    });
  }

  // GET Section
  if (req.method === "GET") {
    const { wallet } = req.query;
    let data;
    let state;

    if (fs.existsSync("./cids.json")) {
      const rawData = fs.readFileSync("./cids.json", "utf8");
      data = JSON.parse(rawData);
    }
    console.log("IPFS hash", data);

    try {
      state = await mogu.load(String(data));
      console.log(state)
      state = await mogu.queryByName(wallet);
      console.log("State:", state);
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
