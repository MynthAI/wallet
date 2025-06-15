import { getAddressDetails, walletFromSeed } from "@lucid-evolution/lucid";
import { entropyToMnemonic } from "bip39";

const toPublicKey = (privateKey: string) => {
  const seed = entropyToMnemonic(privateKey);
  const { address } = walletFromSeed(seed);
  const details = getAddressDetails(address);
  return details.paymentCredential!.hash;
};

export { toPublicKey };
