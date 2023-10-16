import nacl from "tweetnacl";
import util from "tweetnacl-util";
import fs from "fs";
import path from "path";
import dotenv from "dotenv"; // Load environment variables from .env file
const crypto = require("asymmetric-crypto");

async function createKeyPair() {
  dotenv.config();

  console.log("Generating Key Pair...");
  const kp = crypto.keyPair();

  // encode the keypair as a JSON string
  const keypairJSON = JSON.stringify({
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
  });

  // store keypair
  const keypairPath = "./keypair/keypair.json";
  // if doesnt exit create folder
  if (!fs.existsSync("./keypair")) {
    fs.mkdirSync("./keypair");
  }

  if (!fs.existsSync(keypairPath)) {
    fs.writeFileSync(keypairPath, keypairJSON);

    const keyPair = keypairJSON;

    console.log(keypairJSON);
    console.log("Keypair created successfully!");
  } else {
    console.log("Keypair already exists!");
  }
}

export { createKeyPair };
