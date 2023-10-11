import db from "../../db";

export default async function handler(
  req: { method: string; body: { encryptedPrivateKey: any; contractAddress: any }; query: { contractAddress: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error?: string; message?: string; encryptedPrivateKey?: any }): void; new (): any };
      end: { (): void; new (): any };
    };
  },
) {
  if (req.method === "POST") {
    const { encryptedPrivateKey, contractAddress } = req.body;

    console.log("encryptedPrivateKey:", encryptedPrivateKey);

    console.log("Contract address:", contractAddress);

    db.run(
      `INSERT OR REPLACE INTO userKeys (contractAddress, encryptedPrivateKey) VALUES (?, ?)`,
      [contractAddress, encryptedPrivateKey],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: "Key stored successfully", encryptedPrivateKey: encryptedPrivateKey });
      },
    );
  } else if (req.method === "GET") {
    const { contractAddress } = req.query;

    db.get(`SELECT encryptedPrivateKey FROM userKeys WHERE contractAddress = ?`, [contractAddress], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(200).json({ encryptedPrivateKey: (row as any).encryptedPrivateKey });
      return res.status(404).json({ message: "No private key found for this contract address" });
    });
  } else if (req.method === "GET" && !req.query.contractAddress) {
    db.all("SELECT * FROM userKeys", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: rows });
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
