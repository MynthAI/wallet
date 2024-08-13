import test from "ava";
import { mint } from "../pubkey";
import { invariant } from "./assert";
import { Transaction } from "@anastasia-labs/cardano-multiplatform-lib-nodejs";
import wallet, { host } from "./wallet";

test("can mint pubkey", async (t) => {
  const result = await mint(wallet(), host);
  invariant(result.ok, t);
  t.is(result.data.toHash().length, 64);

  const tx = Transaction.from_cbor_hex(result.data.toCBOR());
  const policies = tx.body().mint()?.keys();
  invariant(policies, t);
  t.is(policies.len(), 1);
  const policy = policies.get(0);
  invariant(policy, t);
  const assets = tx.body().mint()?.get_assets(policy)?.keys();
  invariant(assets, t);
  t.is(assets.len(), 1);
  const asset = assets.get(0).to_cbor_hex();
  t.is(
    asset,
    "5820fcc6a8bae5909ccaae7cac53104ff8042a46c9f0264546b7798194e8e201ee25",
  );
});
