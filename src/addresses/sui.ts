import { Secp256k1PublicKey } from "@mysten/sui/keypairs/secp256k1";

const toSuiAddress = (secp256k1PublicKey: [bigint, bigint]) => {
  const [x, y] = secp256k1PublicKey;
  const xHex = toHex32(x);
  const prefix = y % 2n === 0n ? "02" : "03";
  const compressedHex = prefix + xHex;
  const compressedBytes = Uint8Array.from(Buffer.from(compressedHex, "hex"));
  const pubkey = new Secp256k1PublicKey(compressedBytes);
  return pubkey.toSuiAddress();
};

const toHex32 = (bi: bigint) => {
  const h = bi.toString(16);
  return h.length % 2 === 1 ? "0" + h : h.padStart(64, "0");
};

export { toSuiAddress };
