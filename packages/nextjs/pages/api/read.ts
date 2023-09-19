import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// Initialize db as null initially
let db: Database | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    if (!db) {
      db = await open({
        filename: "./collection.db",
        driver: sqlite3.Database,
      });
    }

    // Perform a query to retrieve all items from the 'wallets' table
    const items = await db.all("SELECT * FROM wallets");

    return res.status(200).json(items);
  } catch (error) {
    console.error("Error accessing database:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
