import test from "ava";
import { invariant } from "./assert";
import wallet, { host } from "./wallet";
import decrypt from "../encryption";

const tx = "d28a89bc9c7b5faa6150f67a561d037650f4444ed426ec05cc019777429426f1";

test("can decrypt message", async (t) => {
  const result = await decrypt(wallet(), tx, host);
  invariant(result.ok, t);
  t.deepEqual(result.data, {
    city: "San Mateo",
    country: "USA",
    state: "CA",
    street: "4873 Oakridge Drive",
    zip: 94402,
  });
});
