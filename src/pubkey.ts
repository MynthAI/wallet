import { getPublic } from "@vinarmani/eccrypto-js";
import { type } from "arktype";
import { createHash } from "crypto";
import got from "got";
import { Err, isProblem, Ok, Result } from "ts-handling";
import { handle } from "./errors.js";
import { getLucid, TxSigned, WalletMaker } from "./wallet.js";

const hexToBuffer = (hex: string) => Buffer.from(hex, "hex");
const hash = (key: string) => createHash("sha256").update(key).digest("hex");

const getPublicKey = (privateKey: string) => {
  const publicKey = getPublic(hexToBuffer(hash(privateKey)));
  const x = publicKey.subarray(1, 33);
  const prefix = publicKey[64] % 2 === 0 ? 0x02 : 0x03;
  return Buffer.concat([Buffer.from([prefix]), x]).toString("hex");
};

const mint = async (
  wallet: WalletMaker,
  host: string,
): Promise<Result<TxSigned, string>> => {
  const lucid = (await getLucid(wallet)).unwrap();
  if (isProblem(lucid)) return Err(lucid.error);
  const address = await lucid.wallet().address();
  const utxos = await lucid.utxosAt(address);
  if (!utxos.length)
    return Err(`Wallet balance is empty. Send funds to: ${address}`);

  const pubkey = getPublicKey(wallet.privateKeys[0]);
  const response = await handle(() =>
    got
      .post(`${host}/api/intents/encryption/mint`, {
        json: { address, pubkey },
      })
      .json(),
  );
  if (!response.ok) return Err(response.error);

  const tx = TxResponse(response.data);
  if (tx instanceof type.errors) return Err(tx.summary);

  const signed = await lucid.fromTx(tx).sign.withWallet().complete();
  return Ok(signed);
};

const TxResponse = type({
  contents: {
    tx: "string",
  },
}).pipe((v) => v.contents.tx);

export { getPublicKey, mint };
