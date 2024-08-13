import test from "ava";
import { invariant } from "./assert";
import { Transaction } from "@anastasia-labs/cardano-multiplatform-lib-nodejs";
import wallet, { host } from "./wallet";
import send from "../send";

const destination =
  "addr_test1qrj95m8q2mpxzdsqwr7gtm8nluhps2df80r43pvua4pazv8efa2cy6pyrzjv0ayd9fefhcw4nl4gv0u3ujnafgyslrfsv4ap85";

test("can send message", async (t) => {
  const result = await send(
    wallet(),
    destination,
    1,
    "myusd",
    { message: "hello" },
    host,
  );
  invariant(result.ok, t);
  t.is(result.data.toHash().length, 64);
  t.true(Transaction.from_cbor_hex(result.data.toCBOR()).is_valid());
});
