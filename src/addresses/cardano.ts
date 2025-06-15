import { CML } from "@lucid-evolution/lucid";

const toCardanoAddress = (
  ed25519PublicKey: Uint8Array,
  network: "mainnet" | "testnet",
) => {
  const networkId = network === "mainnet" ? 1 : 0;
  const rootKey = CML.PublicKey.from_bytes(ed25519PublicKey);
  const paymentKeyHash = rootKey.hash();
  return CML.EnterpriseAddress.new(
    networkId,
    CML.Credential.new_pub_key(paymentKeyHash),
  )
    .to_address()
    .to_bech32(undefined);
};

export { toCardanoAddress };
