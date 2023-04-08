// pages/api/submissions.ts
import { Client } from "@notionhq/client";
import { NextApiRequest, NextApiResponse } from "next";

// Get your Notion secret integration key on https://www.notion.so/my-integrations
// More info about integrations: https://developers.notion.com/docs/create-a-notion-integration
const notion = new Client({ auth: process.env.NOTION_SECRET_INTEGRATION_TOKEN });
// Get your database ID from the notion page(database) and connect your integration to it
// https://developers.notion.com/docs/create-a-notion-integration#step-3-save-the-database-id
const databaseId = process.env.NOTION_DATABASE_ID_USERS ?? "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    console.error("Not a POST request");
    res.status(400).json({ message: "Not a POST request" });
  }

  const { values, chainId } = req.body;

  console.log(values);

  // Make sure the props have the exact same name as the ones in your Notion database (name, message, url, etc.)
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      mecenateID: { title: [{ type: "text", text: { content: values.mecenateID.toString() } }] },
      wallet: { rich_text: [{ type: "text", text: { content: values.wallet } }] },
      pubKey: { rich_text: [{ type: "text", text: { content: String(values.publicKey) } }] },
      date: { date: { start: new Date().toISOString() } },
      network: { rich_text: [{ type: "text", text: { content: chainId } }] },
    },
  });

  res.status(200).json({ message: "User successfully saved" });
}
