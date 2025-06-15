import Conf from "conf";
import { password } from "@inquirer/prompts";
import { Err, mayFail, Ok } from "ts-handling";
import { mnemonicToEntropy } from "bip39";
import { randomBytes } from "crypto";
import { type } from "arktype";
import { PrivateKey } from "./private-key.js";
import { blake3Hash } from "@webbuf/blake3";
import { WebBuf } from "@webbuf/webbuf";

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
  const seed = randomBytes(32).toString("hex");
  config.set("seed", seed);
};

const saveNewSeed = async () => {
  const seed = await password({ message: "Enter your seed" });
  if (!seed) return Err("No seed provided");

  const privateKey = PrivateKey(seed);
  if (!(privateKey instanceof type.errors)) {
    config.set("seed", privateKey);
    return Ok(privateKey);
  }

  const entropy = mayFail(() => {
    const entropy = mnemonicToEntropy(seed);
    if (entropy.length != 64)
      return blake3Hash(WebBuf.fromHex(entropy)).toHex();
    return entropy;
  });
  if (!entropy.ok)
    return Err("A valid private key or mnemonic seed must be provided");

  config.set("seed", entropy.data);
  return Ok(entropy.data);
};

export { getSavedSeed, saveNewSeed, saveRandomSeed };
