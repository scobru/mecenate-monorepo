import { Contract, Signer, ethers, providers } from "ethers";
import dotenv from "dotenv";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";
import SismoABI from "./SismoPKP.json";
import { AuthType, SignatureRequest, AuthRequest, SismoConnectConfig } from "@sismo-core/sismo-connect-client";

dotenv.config();

const contractAddress = "0x97653E925B52d0455f5809cbc74104F594201EDC"; // goerliBase

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

  async createPKP(sismoConnectResponse: string, vaultId: string, appId: string, otp: string) {
    console.log("Creating PKP...");

    await this.createPassKey(sismoConnectResponse, appId, otp);

    const passKey = await this.getPassKey(sismoConnectResponse, appId, otp);
    const signer = this.externalProvider;
    const contractWithSigner = this.contract.connect(signer);
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;

    console.log("Encrypting PK...");
    const encryptedPK = await this.encrypt(privateKey, passKey);
    const encryptedPKJson = JSON.stringify(encryptedPK);
    const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);
    console.log("PK encrypted!");
    const tx = await contractWithSigner.setWalletInfo(keccak256(vaultId), appId, encryptedPKBytes);
    await tx.wait();

    console.log("PKP created!");

    return encryptedPK;
  }

  async createPassKey(sismoConnectResponse: string, appId: string, otp: string) {
    console.log("Creating passkey...");

    const signer = this.externalProvider;
    const sismoPKPContract = new Contract(this.contractAddress, SismoABI.abi, signer);
    const params = {
      sismoConnectResponse: sismoConnectResponse,
      appId: appId,
      otp: ethers.utils.defaultAbiCoder.encode(["bytes32"], [String(otp)]),
    };
    const tx = await sismoPKPContract.createPassKey(params.sismoConnectResponse, params.appId, params.otp);
    const receipt = await tx.wait();

    console.log("Passkey created!");

    return receipt;
  }

  async getPassKey(sismoConnectResponse: string, appId: string, otp: string) {
    console.log("Getting passkey...");
    const signer = this.externalProvider;
    const sismoPKPContract = new Contract(this.contractAddress, SismoABI.abi, signer);
    const passKey = await sismoPKPContract.getPassKey(sismoConnectResponse, appId, otp);
    console.log("Passkey retrieved!");
    return passKey;
  }

  async getPKP(sismoConnectResponse: string, vaultId: string, appId: string, otp: string) {
    const signer = this.externalProvider;
    const passKey = await this.getPassKey(sismoConnectResponse, appId, otp);
    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(keccak256(vaultId), appId);
    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);
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
    const AUTHS: AuthRequest[] = [{ authType: AuthType.VAULT, isSelectableByUser: false }];
    const OTP = keccak256(ethers.utils.randomBytes(32));
    const SIGNATURE_REQUEST: SignatureRequest = {
      message: String(await this.signMessage(OTP)),
    };
    return {
      CONFIG,
      AUTHS,
      SIGNATURE_REQUEST,
      OTP,
    };
  }

  async signMessage(_otp: any) {
    return ethers.utils.defaultAbiCoder.encode(["bytes32"], [String(_otp)]);
  }
}

export default SismoPKP;
