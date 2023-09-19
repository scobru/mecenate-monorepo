import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let db: Database | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.method); // Add this line for debugging

  // Initialize the database if it's not already initialized
  if (!db) {
    db = await open({
      filename: "./collection.db",
      driver: sqlite3.Database,
    });

    // Check if 'wallets' table exists, create if not
    await db.exec(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vaultId TEXT,
        address TEXT,
        encryptedPK TEXT
      )
    `);
  }

  // Check if it's a POST request
  if (req.method === "POST") {
    const { vaultId, address, encryptedPK } = req.body;

    // Check if vaultId, address, and encryptedPK exist in the request body
    if (!vaultId || !address || !encryptedPK) {
      return res.status(400).json({ error: "vaultId, Address, and EncryptedPK are required" });
    }

    try {
      // Insert the new wallet into the 'wallets' table
      const result = await db.run("INSERT INTO wallets (vaultId, address, encryptedPK) VALUES (?, ?, ?)", [
        vaultId,
        address,
        encryptedPK,
      ]);

      // Return success response
      return res.status(201).json({ success: true, id: result.lastID });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
