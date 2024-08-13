import Conf from "conf";
import { password } from "@inquirer/prompts";
import { Err, Ok, Result } from "ts-handling";
import { Bip32PrivateKey } from "@anastasia-labs/cardano-multiplatform-lib-nodejs";
import { fromHex } from "@harmoniclabs/uint8array-utils";
import { mnemonicToEntropy } from "bip39";
import { generateSeedPhrase } from "@lucid-evolution/lucid";

type Settings = { seed: string };

// Save seed locally and obscure. This is not designed for security.
// DO NOT SAVE ANY SENSITIVE SEED PHRASE USING THIS APP. Use only seed phrases
// dedicated to testing.
const config = new Conf<Settings>({
  projectName: "encrypt",
  encryptionKey:
    "65cee028e58eac7b391a04790670c863aff3f467fa1f325b37df2be8536ddec0",
});

const getSavedSeed = () => config.get("seed");

const saveRandomSeed = () => {
  const seed = generateSeedPhrase();
  config.set("seed", seed);
};

const saveNewSeed = async () => {
  const seed = await password({ message: "Enter your seed phrase" });
  if (!seed) return Err("No seed phrase provided");

  config.set("seed", seed);
  return Ok(seed);
};

const getSeed = async () => {
  const savedSeed = config.get("seed");
  if (savedSeed) return Ok(savedSeed);

  return saveNewSeed();
};

const getAccountKeyFromSeed = (seed: string) =>
  Bip32PrivateKey.from_bip39_entropy(
    fromHex(mnemonicToEntropy(seed)),
    new Uint8Array(),
  )
    .derive(2147485500)
    .derive(2147485463)
    .derive(2147483648);

const getPrivateKeysFromSeed = (seed: string): [string, string] => {
  const accountKey = getAccountKeyFromSeed(seed);
  return [
    accountKey.derive(0).derive(0).to_raw_key().to_bech32(),
    accountKey.derive(2).derive(0).to_raw_key().to_bech32(),
  ];
};

const getPrivateKeys = async (): Promise<Result<[string, string], string>> => {
  const seed = await getSeed();
  if (!seed.ok) return Err(seed.error);

  return Ok(getPrivateKeysFromSeed(seed.data));
};

export {
  getPrivateKeys,
  getPrivateKeysFromSeed,
  getSavedSeed,
  saveNewSeed,
  saveRandomSeed,
};
