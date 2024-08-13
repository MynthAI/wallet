import got from "got";
import { type } from "arktype";
import { handle } from "./errors.js";
import { getLucid, TxSigned, WalletMaker } from "./wallet.js";
import { Err, isProblem, Ok, Result } from "ts-handling";

const send = async (
  wallet: WalletMaker,
  destination: string,
  amount: number,
  token: string,
  encrypt: object,
  host: string,
): Promise<Result<TxSigned, string>> => {
  const lucid = (await getLucid(wallet)).unwrap();
  if (isProblem(lucid)) return Err(lucid.error);
  const address = await lucid.wallet().address();

  const response = await handle(() =>
    got
      .post(`${host}/api/intents/send`, {
        json: {
          address,
          amount,
          destination,
          encrypt,
          token,
        },
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

export default send;
