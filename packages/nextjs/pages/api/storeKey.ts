import db from "../../db";
interface IResponse {
  error?: string;
  message?: string;
  data?: any;
}

export default async function handler(
  req: { method: string; body: { wallet: any; salt: any; iv: any; ciphertext: any }; query: { wallet: any } },
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
  }
}
