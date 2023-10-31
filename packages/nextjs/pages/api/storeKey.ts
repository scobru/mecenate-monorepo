import db from "../../db";
import fs from "fs";
import axios from "axios"

import PinataSDK from '@pinata/sdk';

// Crea un client Pinata
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

interface IExistingData {
  [key: string]: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
  previousCid?: any;
}

 const fetchFromIpfs = async (cid: string): Promise<any> => {
  try {
    const url = `https://sapphire-financial-fish-885.mypinata.cloud/ipfs/${cid}`;
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch from IPFS via Pinata');
    }
  } catch (err) {
    console.error(`Error fetching from IPFS via Pinata: ${err}`);
    throw err;
  }
};

export default async function handler(
  req: { method: string; body: { wallet: any; salt: any; iv: any; ciphertext: any }; query: { wallet: any } },
  res: {
    status: (arg0: any) => {
      (): any;
      new(): any;
      json: { (arg0: IResponse): void; new(): any }; // Usa IResponse qui
      end: { (): void; new(): any };
    };
  },
) {
  if (req.method === 'POST') {
    const { wallet, salt, iv, ciphertext } = req.body;

    // Step 1: Leggi il CID esistente da userKeys.json
    let existingData: IExistingData = {};

    let previousCid = null;

    if (fs.existsSync('./userKeys.json')) {
      const rawData = fs.readFileSync('./userKeys.json', 'utf8');
      existingData = JSON.parse(rawData);
      previousCid = existingData.previousCid;
    }

    console.log("Previous Cid", previousCid)

    // Step 2: Scarica il contenuto utilizzando quel CID
    if (previousCid) {
      const existingIpfsData = await fetchFromIpfs(previousCid); // Supponiamo che fetchFromIpfs sia una funzione che ritorna dati da IPFS
      existingData = { ...existingIpfsData };
    }

    // Step 3: Aggiorna i dati
    existingData[wallet] = { salt, iv, ciphertext };

    // Step 4: Nuovo pin su IPFS
    const newCid = await pinJsonToIpfs(existingData);

    console.log("New Cid", newCid)

    // Step 5: Aggiorna userKeys.json con il nuovo CID
    existingData.previousCid = newCid;

    fs.writeFileSync('./userKeys.json', JSON.stringify(existingData));

    // Rimuovi il vecchio pin (unpin)
    if (previousCid) {
      await pinata.unpin(previousCid);
    }

    res.status(200).json({ message: 'Key stored and pinned to IPFS via Pinata successfully', data: newCid });
  }

  // GET Section
  if (req.method === 'GET') {
    const { wallet } = req.query;
    let existingData: IExistingData = {};

    // Step 1: Leggi il CID da userKeys.json
    if (fs.existsSync('./userKeys.json')) {
      const rawData = fs.readFileSync('./userKeys.json', 'utf8');
      existingData = JSON.parse(rawData);
    }

    const cid = existingData.previousCid;

    // Step 2: Scarica il contenuto utilizzando quel CID
    if (cid) {
      const dataFromIpfs = await fetchFromIpfs(cid); // Supponiamo che fetchFromIpfs sia una funzione che ritorna dati da IPFS
      existingData = { ...dataFromIpfs };
    }

    // Step 3: Utilizza i dati per la richiesta GET
    if (existingData[wallet]) {
      res.status(200).json({ data: existingData[wallet] });
    } else {
      res.status(404).json({ message: 'No private key found for this contract address' });
    }
  }

 

  /* if (req.method === "POST") {
    const { wallet, salt, iv, ciphertext } = req.body; // Usa req.query invece di req.body

    db.run(
      `INSERT OR REPLACE INTO userKeys (wallet, salt, iv, ciphertext) VALUES (?, ?, ?, ?)`,
      [wallet, salt, iv, ciphertext],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: "Key stored successfully", data: { wallet, salt, iv, ciphertext } });
      },
    );
  } else if (req.method === "GET") {
    const { wallet } = req.query;

    db.get(`SELECT * FROM userKeys WHERE wallet = ?`, [wallet], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row)
        return res.status(200).json({
          data: {
            wallet: (row as any).wallet,
            salt: (row as any).salt,
            iv: (row as any).iv,
            ciphertext: (row as any).ciphertext,
          },
        });
      return res.status(404).json({ message: "No private key found for this contract address" });
    });
  } else if (req.method === "GET" && !req.query.wallet) {
    db.all("SELECT * FROM userKeys", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: rows });
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  } */
}
