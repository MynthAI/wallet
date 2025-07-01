import { randomBytes } from "crypto";
import { password } from "@inquirer/prompts";
import { blake3Hash } from "@webbuf/blake3";
import { WebBuf } from "@webbuf/webbuf";
import { type } from "arktype";
import { mnemonicToEntropy } from "bip39";
import { Err, mayFail, Ok } from "ts-handling";
import config from "./config.js";
import { PrivateKey } from "./private-key.js";

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
