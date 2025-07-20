import { password } from "@inquirer/prompts";
import { type } from "arktype";
import { decrypt, ECIES_CONFIG, encrypt, PrivateKey } from "eciesjs";
import { mayFail } from "ts-handling";
import { decode } from "../encoding.js";
import { exit, program } from "./cli.js";

ECIES_CONFIG.ellipticCurve = "x25519";

const isHex = (value: string) =>
  value.length % 2 === 0 && /^[0-9a-f]+$/.test(value);

const Data = type("string > 0").pipe(
  (v) => new Uint8Array(Buffer.from(v, isHex(v) ? "hex" : "utf8")),
);
const Key = type(/^[a-f0-9]{64}$/).pipe((v) => Buffer.from(v, "hex"));

const Hex = type(/^[a-f0-9]+$/)
  .narrow((v, ctx) => v.length % 2 === 0 || ctx.mustBe("even length"))
  .pipe((v) => Buffer.from(v, "hex"));

const blind = program.command("blind").description("Blind and unblind data");

blind
  .command("key")
  .description("Creates a new blind key pair")
  .action(() => {
    const sk = new PrivateKey(undefined, "x25519");
    console.log("Public:", sk.publicKey.toHex());
    console.log("Private:", sk.toHex());
  });

blind
  .command("encode")
  .description("Blinds data")
  .argument("data", "The data to blind")
  .argument("blinding", "The x25519 public key to use to blind the data")
  .action(($data: string, $blinding: string) => {
    const data = Data($data);
    if (data instanceof type.errors) return exit(`data ${data.summary}`);

    const blinding = Key($blinding);
    if (blinding instanceof type.errors)
      return exit(`blinding ${blinding.summary}`);

    console.log(encrypt(blinding, data).toString("hex"));
  });

blind
  .command("decode")
  .description("Unblinds data")
  .argument("encoded", "The encoded data to unblind")
  .action(async ($encoded: string) => {
    const encoded = Hex($encoded);
    if (encoded instanceof type.errors)
      return exit(`encoded ${encoded.summary}`);

    const $privateKey = await password({ message: "Enter your private key" });
    if (!$privateKey) return exit("No private key provided");
    const privateKey = Key($privateKey);
    if (privateKey instanceof type.errors)
      return exit(`private key ${privateKey.summary}`);

    const decrypted = mayFail(() => decrypt(privateKey, encoded));
    if (!decrypted.ok) return exit("wrong private key");

    console.log(decode(decrypted.data));
  });
