import { Wallet, ethers } from "ethers";
import { hexlify, isHexString, sha256, toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import MecenateHelper from "@scobru/crypto-ipfs";

const nacl = require('tweetnacl');

import {
    getSharedSecret as nobleGetSharedSecret,
    utils as nobleUtils,
    getPublicKey,
    Point,
    CURVE,
} from '@noble/secp256k1';

export const lengths = {
    address: 42, // 20 bytes + 0x prefix
    txHash: 66, // 32 bytes + 0x prefix
    privateKey: 66, // 32 bytes + 0x prefix
    publicKey: 132, // 64 bytes + 0x04 prefix
};


export default async function generateStealthAddress(receiverPublicKey: string, senderSecretKey: string, senderPublicKey: string) {

    const theirPublicKey = Buffer.from(receiverPublicKey, "base64")
    const theirPublicKeyR32 = theirPublicKey.slice(0, 32)
    const mySecretKey = Buffer.from(senderSecretKey, "base64").slice(0, 32)

    const r = nacl.randomBytes(32); // Numero casuale
    const r32 = new Uint8Array(r).slice(0, 32);

    const pk = hexlify(nacl.scalarMult(theirPublicKeyR32, r32));
    const nonce = new Uint8Array(nacl.randomBytes(24));

    const newWallet = new Wallet(pk);
    const encryptedR = MecenateHelper.crypto.asymmetric.encryptMessage(r32, nonce, theirPublicKey, mySecretKey)
    const encryptedRBase64 = Buffer.from(encryptedR, "base64")

    return {
        encryptedR: encryptedRBase64,
        nonce: nonce,
        address: newWallet.address
    };
}

export async function verifyStealthAddress(encryptedR: string, senderPublicKey: string, receiverSecretKey: string, receiverPublicKey: string, nonce: Uint8Array) {
    const theirPublicKey = Buffer.from(senderPublicKey, "base64");
    const mySecretKey = Buffer.from(receiverSecretKey, "base64").slice(0, 32)

    const decryptedR = MecenateHelper.crypto.asymmetric.decryptMessage(encryptedR, nonce, theirPublicKey, mySecretKey)

    const myPubKey32 = Buffer.from(receiverPublicKey, "base64").slice(0, 32);

    const decryptedRBytes = decryptedR.split(',').map(Number);
    const r32 = new Uint8Array(decryptedRBytes);

    const pk = hexlify(nacl.scalarMult(myPubKey32, r32));
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


