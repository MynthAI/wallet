import sha3 from "js-sha3";
import { toChecksumAddress } from "web3-utils";

const keccak256 = sha3.keccak256;

const toEthereumAddress = (secp256k1PublicKey: [bigint, bigint]) => {
  const uncompressedKey = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(secp256k1PublicKey[0].toString(16).padStart(64, "0"), "hex"),
    Buffer.from(secp256k1PublicKey[1].toString(16).padStart(64, "0"), "hex"),
  ]);

  const rawAddress = Buffer.from(
    keccak256.arrayBuffer(uncompressedKey.subarray(1)),
  ).subarray(-20);
  return toChecksumAddress("0x" + rawAddress.toString("hex"));
};

export { toEthereumAddress };
