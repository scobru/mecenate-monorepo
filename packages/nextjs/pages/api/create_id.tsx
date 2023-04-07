// pages/api/submissions.ts
import { Client } from "@notionhq/client";
import { NextApiRequest, NextApiResponse } from "next";

// Get your Notion secret integration key on https://www.notion.so/my-integrations
// More info about integrations: https://developers.notion.com/docs/create-a-notion-integration
const notion = new Client({ auth: process.env.NOTION_SECRET_INTEGRATION_TOKEN });
// Get your database ID from the notion page(database) and connect your integration to it
// https://developers.notion.com/docs/create-a-notion-integration#step-3-save-the-database-id
const databaseId = process.env.NOTION_DATABASE_ID ?? "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    console.error("Not a POST request");
    res.status(400).json({ message: "Not a POST request" });
  }

  const { values } = req.body;

  console.log(values);

  // Make sure the props have the exact same name as the ones in your Notion database (name, message, url, etc.)
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      name: { title: [{ type: "text", text: { content: values.name || null } }] },
      description: { rich_text: [{ type: "text", text: { content: values.description || null } }] },
      image: { url: values.image || null },
      signerAddress: { rich_text: [{ type: "text", text: { content: values.owner } }] },
      date: { date: { start: new Date().toISOString() } },
    },
  });

  res.status(200).json({ message: "Submission successfully saved" });
}
