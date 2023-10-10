import { Contract, Signer, ethers, providers } from "ethers";
import dotenv from "dotenv";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";
import SismoABI from "./SismoPKP.json";
import { AuthType, SignatureRequest, AuthRequest, SismoConnectConfig } from "@sismo-core/sismo-connect-client";

dotenv.config();

const contractAddress = "0x718cb06CE76829556f93Dc634d7fC29c50D6e930"; // goerliBase

class SismoPKP {
  private contractAddress: string;
  private externalProvider: providers.JsonRpcProvider | Signer;
  private contract: Contract;
  private appId: string;

  constructor(externalProvider: providers.JsonRpcProvider | Signer, appId: string) {
    this.contractAddress = contractAddress;
    this.externalProvider = externalProvider;
    this.contract = new Contract(this.contractAddress, SismoABI.abi, this.externalProvider);
    this.appId = appId;
  }

  async createPassKey(sismoConnectResponse: string, appId: string, otp: string) {
    const signer = this.externalProvider;

    const sismoPKPContract = new Contract(this.contractAddress, SismoABI.abi, signer);

    const tx = await sismoPKPContract.createPassKey(sismoConnectResponse, appId, otp);

    const receipt = await tx.wait();

    return receipt;
  }

  async getPassKey(sismoConnectResponse: string, appId: string, otp: string) {
    const signer = this.externalProvider;
    const sismoPKPContract = new Contract(this.contractAddress, SismoABI.abi, signer);
    const passKey = await sismoPKPContract.getPassKey(sismoConnectResponse, appId, otp);
    return passKey;
  }

  async createPKP(sismoConnectResponse: string, vaultId: string, appId: string, otp: string) {
    const newPassKey = await this.createPassKey(sismoConnectResponse, appId, otp);

    const passKey = await this.getPassKey(sismoConnectResponse, appId, otp);

    console.log("passKey", passKey);

    newPassKey.wait();

    const signer = this.externalProvider;
    console.log("signer", signer);

    const contractWithSigner = this.contract.connect(signer);
    console.log("contractWithSigner", contractWithSigner);

    const wallet = ethers.Wallet.createRandom();
    console.log("wallet.address", wallet.address);

    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;
    console.log("publicKey", publicKey);

    const encryptedPK = await this.encrypt(privateKey, passKey);
    console.log("encryptedPK", encryptedPK);

    const encryptedPKJson = JSON.stringify(encryptedPK);
    console.log("Encrypted PK JSON:", encryptedPKJson);

    const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);
    console.log("Encrypted PK Bytes:", encryptedPKBytes);

    const tx = await contractWithSigner.setWalletInfo(keccak256(vaultId), keccak256(this.appId), encryptedPKBytes);
    await tx.wait();

    console.log("Transaction mined!", tx.hash);

    return encryptedPK;
  }

  async getPKP(sismoConnectResponse: string, vaultId: string, appId: string, otp: string) {
    const signer = this.externalProvider;
    const passKey = await this.getPassKey(sismoConnectResponse, appId, otp);

    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(keccak256(vaultId), keccak256(this.appId));

    console.log("Retrieved Encrypted PK Bytes:", encryptedPKBytes);

    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);
    console.log("Retrieved Encrypted PK JSON:", encryptedPKJson);

    return this.decrypt(JSON.parse(encryptedPKJson), passKey);
  }

  async encrypt(
    privateKey: ethers.utils.BytesLike | ExternallyOwnedAccount | ethers.utils.SigningKey,
    password: string | ethers.utils.Bytes,
  ) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.encrypt(password);
  }

  async decrypt(encryptedWallet: string, password: string | ethers.utils.Bytes) {
    return ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, password);
  }

  async prepareSismoConnect(_appId: string) {
    const CONFIG: SismoConnectConfig = {
      appId: _appId,
    };

    const AUTHS: AuthRequest[] = [{ authType: AuthType.VAULT }];

    const nonce = keccak256(ethers.utils.randomBytes(32));

    const SIGNATURE_REQUEST: SignatureRequest = {
      message: String(ethers.utils.defaultAbiCoder.encode(["bytes32"], [nonce])),
    };

    const message = await this.signMessage(nonce);

    return {
      CONFIG,
      AUTHS,
      SIGNATURE_REQUEST,
    };
  }

  async signMessage(_nonce: any) {
    return ethers.utils.defaultAbiCoder.encode(["bytes32"], [String(_nonce)]);
  }
}

export default SismoPKP;
