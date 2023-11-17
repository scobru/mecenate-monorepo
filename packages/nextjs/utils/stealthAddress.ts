import { Wallet, ethers } from "ethers";
import { hexlify, isHexString, sha256, toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import MecenateHelper from "@scobru/crypto-ipfs";

const getRandomValues = require("get-random-values");
const nacl = require('tweetnacl');
const crypto = require('asymmetric-crypto')

export const lengths = {
    address: 42, // 20 bytes + 0x prefix
    txHash: 66, // 32 bytes + 0x prefix
    privateKey: 66, // 32 bytes + 0x prefix
    publicKey: 132, // 64 bytes + 0x04 prefix
};

const MAX_UINT32 = Math.pow(2, 32) - 1;
const MAX_UINT8 = Math.pow(2, 8) - 1;
const FERNET_SECRET_LENGTH = 32;


const randomNumber = () => {
    if (typeof window === "undefined") {
        return getRandomValues(new Uint8Array(1))[0] / MAX_UINT8;
    }
    return getRandomValues(new Uint32Array(1))[0] / MAX_UINT32;
};

const randomString = () => {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < FERNET_SECRET_LENGTH; i++) {
        result += characters.charAt(Math.floor(randomNumber() * charactersLength));
    }
    return result;
};


export default async function generateStealthAddress(receiverPublicKey: string, senderSecretKey: string, senderPublicKey: string) {
    const theirPublicKey = Buffer.from(receiverPublicKey, "base64")
    const theirPublicKeyR32 = theirPublicKey.slice(0, 32)

    const r = randomString() as string;
    const rBytes = Buffer.from(r, "utf8");

    const pk = hexlify(nacl.scalarMult(theirPublicKeyR32, rBytes));
    const newWallet = new Wallet(pk);

    const encryptedR = MecenateHelper.crypto.asymmetric.encrypt(r, String(receiverPublicKey), String(senderSecretKey))

    return {
        encryptedR: encryptedR.data,
        nonce: encryptedR.nonce,
        address: newWallet.address,
        ephemeralPubKey: senderPublicKey
    };
}

export async function verifyStealthAddress(encryptedR: string, nonce: string, ephemeralPubKey: string, receiverPublicKey: string, receiverSecretKey: string) {
    const myPubKey32 = Buffer.from(receiverPublicKey, "base64").slice(0, 32);
    const decryptedR = MecenateHelper.crypto.asymmetric.decrypt(encryptedR, nonce, ephemeralPubKey, receiverSecretKey)

    const rBytes = Buffer.from(decryptedR, "utf8");

    const pk = hexlify(nacl.scalarMult(myPubKey32, rBytes));
    const newWallet = new Wallet(pk);

    return newWallet
}

export async function generateKeyPairFromSeed(provider: any, signer: any) {
    const baseMessage = 'Sign this message to access your Mecenate account.\n\nOnly sign this message for a trusted client!';

    // Append chain ID if not mainnet to mitigate replay attacks
    const { chainId } = await provider.getNetwork();

    const message = `${baseMessage}\n\nChain ID: ${chainId}`;

    // Get 65 byte signature from user using personal_sign
    const formattedMessage = hexlify(toUtf8Bytes(message));
    const signature = await signer.signMessage(formattedMessage)

    //const signature = String(await signer.send('personal_sign', [formattedMessage, userAddress.toLowerCase()]));
    // If a user can no longer access funds because their wallet was using eth_sign before this update, stand up a
    // special "fund recovery login page" which uses the commented out code below to sign with eth_sign
    //     const signature = await signer.signMessage(message);

    // Verify signature
    const isValidSignature = (sig: string) => isHexString(sig) && sig.length === 132;

    if (!isValidSignature(signature)) {
        throw new Error(`Invalid signature: ${signature}`);
    }

    const hashed = ethers.utils.keccak256(signature)
    const seed = ethers.utils.arrayify(hashed);

    const kp = MecenateHelper.crypto.asymmetric.generateKeyPairFromSeed(seed)

    return kp
}


