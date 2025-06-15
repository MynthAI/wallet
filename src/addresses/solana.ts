import bs58 from "bs58";

const toSolanaAddress = (ed25519PublicKey: Uint8Array) =>
  bs58.encode(ed25519PublicKey);

export { toSolanaAddress };
