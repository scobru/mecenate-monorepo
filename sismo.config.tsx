import {
  ClaimType,
  AuthType,
  SignatureRequest,
  AuthRequest,
  ClaimRequest,
  SismoConnectConfig,
} from "@sismo-core/sismo-connect-client";

export { ClaimType, AuthType };
export const CONFIG: SismoConnectConfig = {
  appId: "0x6c434d2de6efa3e7169bc58843b74d74",
};
export const AUTHS: AuthRequest[] = [
  // vaultId = hash(vaultSecret, appId).
  // full docs: https://docs.sismo.io/sismo-docs/build-with-sismo-connect/technical-documentation/vault-and-proof-identifiers
  { authType: AuthType.VAULT },
  { authType: AuthType.EVM_ACCOUNT },
  { authType: AuthType.TWITTER },
  { authType: AuthType.TELEGRAM, isOptional: true, isSelectableByUser: true },
];
export const SIGNATURE_REQUEST: SignatureRequest = {
  message: "I love Sismo!",
};
