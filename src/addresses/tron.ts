import { createHash } from "crypto";
import base58 from "bs58";
import sha3 from "js-sha3";

const keccak256 = sha3.keccak256;

const toTronAddress = (secp256k1PublicKey: [bigint, bigint]) => {
  const uncompressedKey = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(secp256k1PublicKey[0].toString(16).padStart(64, "0"), "hex"),
    Buffer.from(secp256k1PublicKey[1].toString(16).padStart(64, "0"), "hex"),
  ]);
  const rawAddress = Buffer.from(
    keccak256.arrayBuffer(uncompressedKey.subarray(1)),
  ).subarray(-20);
  const tronAddressHex = "41" + rawAddress.toString("hex");
  const tronAddressBytes = Buffer.from(tronAddressHex, "hex");
  const checksum = sha256(sha256(tronAddressBytes)).subarray(0, 4);
  const tronAddressWithChecksum = Buffer.concat([tronAddressBytes, checksum]);
  return base58.encode(tronAddressWithChecksum);
};

const sha256 = (data: Buffer): Buffer =>
  createHash("sha256").update(data).digest();

export { toTronAddress };
