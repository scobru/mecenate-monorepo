import * as fernet from "fernet";
import * as tweetnacl from "tweetnacl";
import * as pbkdf2 from "pbkdf2";
import * as getRandomValues from "get-random-values";
import * as multihash from "multihashes";
import * as sha256_cid from "ipfs-only-hash";
import * as ethers from "ethers";

const crypto = require("asymmetric-crypto");

const MAX_UINT32 = Math.pow(2, 32) - 1;
const MAX_UINT8 = Math.pow(2, 8) - 1;
const FERNET_SECRET_LENGTH = 32;
const NONCE_LENGTH = 24;

const randomNumber = (): number => {
  if (typeof window === "undefined") {
    return getRandomValues(new Uint8Array(1))[0] / MAX_UINT8;
  }
  return getRandomValues(new Uint32Array(1))[0] / MAX_UINT32;
};

const randomString = (): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < FERNET_SECRET_LENGTH; i++) {
    result += characters.charAt(Math.floor(randomNumber() * charactersLength));
  }
  return result;
};

const downloadFile = ({
  data,
  fileName,
  fileType,
}: {
  data: BlobPart;
  fileName: string;
  fileType: string;
}): void => {
  if (!data || !fileName || !fileType) {
    throw new Error("Invalid inputs");
  }

  const blob = new Blob([data], { type: fileType });
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);

  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  a.dispatchEvent(clickEvt);
  a.remove();
};

const createPair = (): string => {
  const kp = crypto.keyPair();
  console.log("Generating Key Pair...", kp);

  downloadFile({
    data: JSON.stringify(kp),
    fileName: "MecenatekeyPair.json",
    fileType: "text/json",
  });

  return JSON.stringify(kp);
};

/// Convert multihash from input of specified type to multihash buffer object
/// Valid input types:
/// - 'raw': raw data of any form - will caculate chunked ipld content id using sha2-256
/// - 'sha2-256': hex encoded sha2-256 hash - will append multihash prefix
/// - 'hex': hex encoded multihash
/// - 'b58': base58 encoded multihash
async function multihashFrom(
  input: string,
  inputType: string
): Promise<Buffer> {
  const inputTypes = ["raw", "sha2-256", "hex", "b58"];
  let contentid;
  if (inputType === "raw") {
    contentid = multihash.fromB58String(
      await sha256_cid.of(Buffer.from(input))
    );
  } else if (inputType === "sha2-256") {
    input = input.slice(0, 2) === "0x" ? input.slice(2) : input;
    contentid = multihash.fromHexString("1220" + input);
  } else if (inputType === "hex") {
    input = input.slice(0, 2) === "0x" ? input.slice(2) : input;
    contentid = multihash.fromHexString(input);
  } else if (inputType === "b58") {
    contentid = multihash.fromB58String(input);
  } else {
    throw new Error(
      `Invalid inputType: ${inputType} should be one of [${inputTypes}]`
    );
  }

  multihash.validate(contentid);

  return contentid;
}

/// Convert multihash from buffer object to output of specified type
/// Valid output types:
/// - 'prefix': hex encoded multihash prefix
/// - 'digest': hex encoded hash
/// - 'hex': hex encoded multihash
/// - 'b58': base58 encoded multihash
async function multihashTo(
  contentid: Buffer,
  outputType: string
): Promise<string> {
  const outputTypes = ["prefix", "digest", "hex", "b58"];
  if (outputType === "prefix") {
    return "0x" + multihash.prefix(contentid).toString("hex");
  } else if (outputType === "digest") {
    return "0x" + multihash.toHexString(multihash.decode(contentid).digest);
  } else if (outputType === "hex") {
    return "0x" + multihash.toHexString(contentid);
  } else if (outputType === "b58") {
    return multihash.toB58String(contentid);
  } else {
    throw new Error(
      `Invalid outputType: ${outputType} should be one of [${outputTypes}]`
    );
  }
}

const MecenateClient = {
  multihash: async ({
    input,
    inputType,
    outputType,
  }: {
    input: string;
    inputType: string;
    outputType: string;
  }): Promise<string> =>
    multihashTo(await multihashFrom(input, inputType), outputType),
  constants: {
    TOKEN_TYPES: {
      NaN: 0,
      MUSE: 1,
      DAI: 2,
    },
  },
  encodeCreateCall: (templateABI: any, abiValues: any): string => {
    const interface = new ethers.utils.Interface(templateABI);
    const calldata = interface.functions.initialize.encode(abiValues);
    return calldata;
  },
  crypto: {
    symmetric: {
      generateKey: (): string => {
        let key = Buffer.from(randomString()).toString("base64");
        let secret = fernet.decode64toHex(key);
        while (secret.length !== fernet.hexBits(256)) {
          key = Buffer.from(randomString()).toString("base64");
          secret = fernet.decode64toHex(key);
        }
        return key;
      },
      encryptMessage: (secretKey: string, msg: string): string => {
        const secret = new fernet.Secret(secretKey);
        const token = new fernet.Token({ secret, ttl: 0 });
        return token.encode(msg);
      },
      decryptMessage: (secretKey: string, encryptedMessage: string): string => {
        const secret = new fernet.Secret(secretKey);
        const token = new fernet.Token({
          secret,
          ttl: 0,
          token: encryptedMessage,
        });
        return token.decode();
      },
    },
    asymmetric: {
      generateKeyPair: (sig: string, salt: string): tweetnacl.BoxKeyPair =>
        tweetnacl.box.keyPair.fromSecretKey(
          pbkdf2.pbkdf2Sync(sig, salt, 1000, 32)
        ),
      generateNonce: (): Uint8Array => tweetnacl.randomBytes(NONCE_LENGTH),
      encryptMessage: (
        msg: string,
        nonce: Uint8Array,
        publicKey: Uint8Array,
        secretKey: Uint8Array
      ): Uint8Array => {
        const encoder = new TextEncoder();
        const encodedMessage = encoder.encode(msg);
        return tweetnacl.box(encodedMessage, nonce, publicKey, secretKey);
      },
      decryptMessage: (
        box: Uint8Array,
        nonce: Uint8Array,
        publicKey: Uint8Array,
        secretKey: Uint8Array
      ): string => {
        const decoder = new TextDecoder();
        const encodedMessage = tweetnacl.box.open(
          box,
          nonce,
          publicKey,
          secretKey
        );
        if (!encodedMessage) {
          throw new Error(
            "Asymmetric decryption failed. Make sure the public key belongs to the sender and the private key belongs to the receiver"
          );
        }
        return decoder.decode(encodedMessage);
      },
      secretBox: {
        encryptMessage: (
          msg: string,
          nonce: Uint8Array,
          secretKey: Uint8Array
        ): Uint8Array => {
          const encoder = new TextEncoder();
          const encodedMessage = encoder.encode(msg);
          return tweetnacl.secretbox(encodedMessage, nonce, secretKey);
        },
        decryptMessage: (
          box: Uint8Array,
          nonce: Uint8Array,
          secretKey: Uint8Array
        ): string => {
          const decoder = new TextDecoder();
          const encodedMessage = tweetnacl.secretbox.open(
            box,
            nonce,
            secretKey
          );
          return decoder.decode(encodedMessage);
        },
      },
    },
  },
};

export default MecenateClient;
