import { toCardanoAddress } from "./cardano.js";
import { toEthereumAddress } from "./ethereum.js";
import { toSolanaAddress } from "./solana.js";
import { toSuiAddress } from "./sui.js";
import { toTronAddress } from "./tron.js";
import { PrivateKey } from "../private-key.js";
import { type } from "arktype";
import { Err, Ok, Result } from "ts-handling";
import {
  deriveCompressedEd25519PublicKey,
  deriveSecp256k1PublicKey,
} from "../ecc/index.js";
import { toPublicKey } from "./public-key.js";

type Network = "mainnet" | "testnet";

const converters = {
  cardano: (scalar: bigint, network: Network) =>
    toCardanoAddress(deriveCompressedEd25519PublicKey(scalar), network),
  ethereum: (scalar: bigint) =>
    toEthereumAddress(deriveSecp256k1PublicKey(scalar)),
  solana: (scalar: bigint) =>
    toSolanaAddress(deriveCompressedEd25519PublicKey(scalar)),
  sui: (scalar: bigint) => toSuiAddress(deriveSecp256k1PublicKey(scalar)),
  tron: (scalar: bigint) => toTronAddress(deriveSecp256k1PublicKey(scalar)),
};

type Blockchain = keyof typeof converters;

const toAddress = (
  $privateKey: PrivateKey,
  blockchain: Blockchain,
  network: Network,
): Result<string, string> => {
  const privateKey = PrivateKey($privateKey);
  if (privateKey instanceof type.errors)
    return Err(`privateKey ${privateKey.summary}`);
  const address = converters[blockchain](BigInt(`0x${privateKey}`), network);
  return Ok(address);
};

const toAddresses = (
  $privateKey: PrivateKey,
  network: Network,
): Result<Record<Blockchain | "public", string>, string> => {
  const privateKey = PrivateKey($privateKey);
  if (privateKey instanceof type.errors)
    return Err(`privateKey ${privateKey.summary}`);

  const scalar = BigInt(`0x${privateKey}`);
  const addresses = Object.fromEntries(
    Object.keys(converters).map((blockchain) => [
      blockchain,
      converters[blockchain as Blockchain](scalar, network),
    ]),
  ) as Record<Blockchain, string>;
  const pkh = toPublicKey(privateKey);
  return Ok({ public: pkh, ...addresses });
};

export { toAddress, toAddresses };
