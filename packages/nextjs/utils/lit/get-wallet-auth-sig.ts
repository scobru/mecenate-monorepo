import { ethers } from "ethers";
import { SiweMessage } from "siwe";

interface AuthSigProp {
  privateKey: string;
  chainId: number;
}

export const getWalletAuthSig = async (prop: AuthSigProp) => {
  const { privateKey, chainId } = prop;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const buffer = Buffer.from(privateKey, "hex");
  const wallet = new ethers.Wallet(buffer);
  const origin = "https://localhost:3000";
  const message = `Generate a server auth signature for ${wallet.address} at ${now}`;
  const statement = message;
  const siweMessage = new SiweMessage({
    domain: "node",
    address: wallet.address,
    uri: origin,
    statement,
    version: "1",
    chainId,
  });
  const messageToSign = siweMessage.prepareMessage();
  const signature = await wallet.signMessage(messageToSign);
  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
  const authSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: recoveredAddress,
  };
  return authSig;
};
