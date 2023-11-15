import { Wallet, ethers } from "ethers";
import { hexlify, isHexString, toUtf8Bytes, toUtf8String } from "ethers/lib/utils.js";
import MecenateHelper from "@scobru/crypto-ipfs";

const memoize = require('fast-memoize')
const ed2curve = require('ed2curve')
const naclUtil = require('tweetnacl-util')



const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

export default async function generateStealthAddress(receiverPublicKey: string, senderSecretKey: string) {
    // Funzioni helper per convertire le chiavi
    const receiverPubKey = Buffer.from(receiverPublicKey, "base64");    

    // Mittente (Alice) genera un numero casuale r e calcola l'indirizzo stealth
    const r = nacl.randomBytes(32); // Numero casuale
    const r32 = new Uint8Array(r.slice(0, 32));
    const pk = hexlify(nacl.scalarMult(receiverPubKey.slice(0, 32), r32));
    const nonce = nacl.randomBytes(24);

    const newWallet = new Wallet(pk);

    const theirPublicKey = memoize(ed2curve.naclUtil.decodeBase64(receiverPublicKey))
    
    const mySecretKey =  memoize(ed2curve.naclUtil.decodeBase64(senderSecretKey))

    const encryptedR = MecenateHelper.crypto.asymmetric.encryptMessage(r32,nonce,theirPublicKey, mySecretKey)

    //const encryptedR = nacl.box((new Uint8Array(r.slice(0, 32))), nonce, receiverPubKey.slice(0, 32), senderPrivateKey.slice(0, 32));

    console.log("encryptedR", encryptedR)

    return {
        encryptedR: encryptedR.data,
        nonce: encryptedR.nonce,
        address: newWallet.address
    };
}

export async function verifyStealthAddress(encryptedR: string, senderPublicKey: string, receiverSecretKey: string, receiverPublicKey: string, nonce: Uint8Array) {
    
    const receiverPubKey =  Buffer.from(receiverPublicKey, "base64");

    //const decryptedR = nacl.box.open(encryptedArray, nonceArray, senderPubKey.slice(0, 32), receiverPrivateKey.slice(0, 32));
    // const decryptedR = MecenateHelper.crypto.asymmetric.decryptMessage(encryptedArray, nonceArray, senderPubKey, receiverPrivateKey.slice(0, 32))
    const decryptedR = MecenateHelper.crypto.asymmetric.decrypt(encryptedR,nonce, senderPublicKey, receiverSecretKey)

    console.log("decryptedR", decryptedR)

    const pk = hexlify(nacl.scalarMult(receiverPubKey.slice(0, 32), (new Uint8Array(decryptedR.slice(0, 32)))));
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


