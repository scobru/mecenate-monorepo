import dotenv from "dotenv"; // Load environment variables from .env file
import crypto from "asymmetric-crypto";

dotenv.config();

async function createKeyPair() {
  console.log("Generating Key Pair...");
  const kp = crypto.keyPair();

  // encode the keypair as a JSON string
  const keypairJSON = JSON.stringify({
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
  });

  // store keypair
  return keypairJSON;
}

export { createKeyPair };
