import { Wallet, ethers } from "ethers";
import { hexlify, isHexString, sha256, toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import MecenateHelper from "@scobru/crypto-ipfs";

const nacl = require('tweetnacl');

export const lengths = {
    address: 42, // 20 bytes + 0x prefix
    txHash: 66, // 32 bytes + 0x prefix
    privateKey: 66, // 32 bytes + 0x prefix
    publicKey: 132, // 64 bytes + 0x04 prefix
};


export default async function generateStealthAddress(receiverPublicKey: string, senderSecretKey: string, senderPublicKey: string) {
    const theirPublicKey = Buffer.from(receiverPublicKey, "base64")
    const theirPublicKeyR32 = theirPublicKey.slice(0, 32)

    console.log("Their Public Key", theirPublicKey)

    const mySecretKey = Buffer.from(senderSecretKey, "base64").slice(0, 32)
    const myPublcKey = Buffer.from(senderPublicKey, "base64")

    const r = nacl.randomBytes(32); // Numero casuale
    const r32 = new Uint8Array(r).slice(0, 32);

    const pk = hexlify(nacl.scalarMult(theirPublicKeyR32, r32));
    const newWallet = new Wallet(pk);

    const nonce = new Uint8Array(nacl.randomBytes(24));

    const encryptedR = MecenateHelper.crypto.asymmetric.encryptMessage(r32, nonce, theirPublicKey, mySecretKey)

    const encryptedRBase64 = Buffer.from(encryptedR, "base64")
    const nonceBase64 = Buffer.from(nonce as any, "base64")

    return {
        encryptedR: encryptedRBase64,
        nonce: nonceBase64,
        address: newWallet.address,
        bPubKey: theirPublicKey,
        sPubKey: myPublcKey,
    };
}

export async function verifyStealthAddress(encryptedR: string, senderPublicKey: string, receiverPublicKey: string, receiverSecretKey: string, nonce: string) {
    const mySecretKey = Buffer.from(receiverSecretKey, "base64").slice(0, 32)
    const myPubKey32 = Buffer.from(receiverPublicKey, "base64").slice(0, 32);

    // new uint8array from buffer
    const nonceArray = Buffer.from(nonce, "base64");
    const encryptedArray = Buffer.from(encryptedR, "base64");
    const theirPublicKey = Buffer.from(senderPublicKey, "base64")

    console.log(nonce, encryptedR, senderPublicKey)
    console.log(encryptedArray, nonceArray, theirPublicKey, mySecretKey)

    const decryptedR = MecenateHelper.crypto.asymmetric.decryptMessage(encryptedArray, nonceArray, theirPublicKey, mySecretKey)

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


