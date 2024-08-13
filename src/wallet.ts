import { Network, Provider } from "@lucid-evolution/core-types";
import { Lucid, TxSignBuilder } from "@lucid-evolution/lucid";
import { Err, Ok } from "ts-handling";
import {
  BaseAddress,
  Credential,
  PrivateKey,
  Transaction,
  TransactionWitnessSet,
} from "@anastasia-labs/cardano-multiplatform-lib-nodejs";

type TxSigned = Awaited<ReturnType<TxSignBuilder["complete"]>>;
type PrivateKeys = [string, string];

type WalletMaker = {
  network: Network;
  privateKeys: PrivateKeys;
  provider: Provider;
};

const getAddress = (privateKeys: PrivateKeys, network: Network) => {
  const networkId = network === "Mainnet" ? 1 : 0;
  const paymentKey = PrivateKey.from_bech32(privateKeys[0]);
  const paymentKeyHash = paymentKey.to_public().hash();
  const stakeKey = PrivateKey.from_bech32(privateKeys[1]);
  const stakeKeyHash = stakeKey.to_public().hash();
  return BaseAddress.new(
    networkId,
    Credential.new_pub_key(paymentKeyHash),
    Credential.new_pub_key(stakeKeyHash),
  )
    .to_address()
    .to_bech32(undefined);
};

const getLucid = async (maker: WalletMaker) => {
  const { network, privateKeys, provider } = maker;
  const lucid = await Lucid(provider, network);
  const address = getAddress(privateKeys, network);
  const utxos = await lucid.utxosAt(address);

  if (!utxos.length)
    return Err(`Wallet balance is empty. Send funds to: ${address}`);

  lucid.selectWallet.fromAddress(address, utxos);

  lucid.wallet().signTx = async (tx: Transaction) => {
    const witness = await lucid
      .fromTx(tx.to_cbor_hex())
      .partialSign.withPrivateKey(privateKeys[0]);
    return TransactionWitnessSet.from_cbor_hex(witness);
  };

  return Ok(lucid);
};

export { getLucid, TxSigned, WalletMaker };
