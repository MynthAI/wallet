import got from "got";
import { handle } from "./errors.js";
import { getLucid, WalletMaker } from "./wallet.js";
import { Err, isProblem, mayFail, mayFailAsync, Ok, Result } from "ts-handling";
import { type } from "arktype";
import { Data, toText } from "@lucid-evolution/lucid";
import { decrypt as eccryptoDecrypt } from "@vinarmani/eccrypto-js";
import { createHash } from "crypto";
import { Parser } from "./input.js";

const hash = (key: string) => createHash("sha256").update(key).digest("hex");
const getPrivateKey = (wallet: WalletMaker) => hash(wallet.privateKeys[0]);

const decrypt = async (
  wallet: WalletMaker,
  txHash: string,
  host: string,
): Promise<Result<object, string>> => {
  const lucid = (await getLucid(wallet)).unwrap();
  if (isProblem(lucid)) return Err(lucid.error);

  const utxos = await lucid.utxosByOutRef([{ txHash, outputIndex: 0 }]);
  const hash = utxos.map((utxo) => utxo.datumHash).find((hash) => !!hash);
  if (!hash) return Err("No valid transaction found");

  const response = await handle(() =>
    got(`${host}/api/intents/encryption/datum`, {
      searchParams: { hash },
    }).json(),
  );
  if (!response.ok) return Err(response.error);

  const datum = DatumResponse(response.data);
  if (datum instanceof type.errors) return Err(datum.summary);

  const key = getPrivateKey(wallet);
  const encryptedMessage = decode(datum);
  const decryptedMessage = await decryptMessage(key, encryptedMessage);
  if (!decryptedMessage.ok) return Err(decryptedMessage.error);
  const message = Parser(decryptedMessage.data);
  if (message instanceof type.errors) return Err(message.summary);

  return Ok(message);
};

const DatumResponse = type({
  contents: {
    datum: "string",
  },
}).pipe((v) => v.contents.datum);

const MessageSchema = Data.Object({
  message: Data.Bytes(),
});
type Message = Data.Static<typeof MessageSchema>;
const Message = MessageSchema as unknown as Message;

const decode = (datum: string) => toText(Data.from(datum, Message).message);

const decryptMessage = async (
  privateKey: string,
  message: string,
): Promise<Result<string, string>> => {
  const [iv, ephemPublicKey, ciphertext, mac] = message.split(":");
  if (!iv || !ephemPublicKey || !ciphertext || !mac)
    return Err("Invalid message");

  const encrypted = mayFail(() => {
    return {
      iv: Buffer.from(iv, "base64"),
      ephemPublicKey: Buffer.from(ephemPublicKey, "base64"),
      ciphertext: Buffer.from(ciphertext, "base64"),
      mac: Buffer.from(mac, "base64"),
    };
  }).unwrap();
  if (isProblem(encrypted)) return Err("Message contains invalid characters");

  const decrypted = (
    await mayFailAsync(() =>
      eccryptoDecrypt(Buffer.from(privateKey, "hex"), encrypted),
    )
  ).unwrap();
  if (isProblem(decrypted)) return Err(decrypted.error);

  return Ok(decrypted.toString());
};

export default decrypt;
