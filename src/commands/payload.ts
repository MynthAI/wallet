import {
  getAddressDetails,
  signData,
  verifyData,
  walletFromSeed,
} from "@lucid-evolution/lucid";
import { blake3Hash } from "@webbuf/blake3";
import { WebBuf } from "@webbuf/webbuf";
import { type } from "arktype";
import { entropyToMnemonic } from "bip39";
import { getSavedSeed } from "../seed.js";
import { exit, program } from "./cli.js";

const Payload = type("string > 0").pipe((payload) => {
  if (/^[a-fA-F0-9]{64}$/.test(payload)) return payload.toLowerCase();
  return blake3Hash(WebBuf.fromString(payload)).buf.toString("hex");
});

const payload = program
  .command("payload")
  .description("Sign and verify payloads (e.g. intents)");

payload
  .command("sign")
  .description("Sign a payload")
  .argument("payload", "The payload to sign")
  .action(($payload: string) => {
    const seed = getSavedSeed();
    if (!seed) return exit("No seed saved. Create a new wallet first.");

    const payload = Payload($payload);
    if (payload instanceof type.errors)
      return exit(`payload ${payload.summary}`);

    const mnemonic = entropyToMnemonic(seed);
    const { address, paymentKey } = walletFromSeed(mnemonic);
    const details = getAddressDetails(address);
    const addressHex = details.address.hex;
    const signature = signData(addressHex, payload, paymentKey);
    const verified = verifyData(
      addressHex,
      details.paymentCredential!.hash,
      payload,
      signature,
    );
    if (!verified) throw new Error("Invalid signing logic");
    console.log(addressHex + signature.key + signature.signature);
  });
