import { scope, type } from "arktype";
import { Decimal as $Decimal } from "decimal.js";
import ky from "ky";
import groups from "./tokens.js";

type Network = "mainnet" | "testnet";
type Params = { address: string } | { address: string; network: string };

const coins = ["ADA", "ETH", "SOL", "SUI", "TRX"];

const Decimal = type("string.numeric | number")
  .pipe((v) => $Decimal(v))
  .narrow((v, ctx) => v.gte(0) || ctx.mustBe("positive"));
type Decimal = $Decimal;

const Tokens = scope({
  Token: "string",
  Decimal,
  Tokens: "Record<string, Decimal>",
}).export().Tokens;

const Balance = type({
  contents: {
    coin: Decimal,
    tokens: Tokens,
  },
}).pipe((v) => v.contents);

const endpoint = {
  mainnet: "https://www.mynth.ai/api/address/balance",
  testnet: "https://preview.mynth.ai/api/address/balance",
};

const getBalance = async (
  address: string,
  network: Network,
  coin: string,
  blockchain?: string,
): Promise<Record<string, Decimal>> => {
  const searchParams: Params = blockchain
    ? { address, network: blockchain }
    : { address };
  const json = await ky.get(endpoint[network], { searchParams }).json();
  const balance = Balance.assert(json);
  return { ...balance.tokens, [coin]: balance.coin };
};

const getBalances = async (
  cardano: string,
  ethereum: string,
  solana: string,
  sui: string,
  tron: string,
  network: Network,
) => {
  const group = groups(network);
  const balances = await Promise.all([
    getBalance(cardano, network, "ADA"),
    getBalance(ethereum, network, "ETH", "base"),
    getBalance(solana, network, "SOL"),
    getBalance(sui, network, "SUI"),
    getBalance(tron, network, "TRX"),
  ]);
  return balances.reduce((balances, balance) => {
    Object.entries(balance).forEach(([token, amount]) => {
      if (amount.isZero()) return;
      if (group.mnt.includes(token))
        balances.MNT = (balances.MNT || Decimal(0)).add(amount);
      if (group.usd.includes(token))
        balances.USD = (balances.USD || Decimal(0)).add(amount);
      if (coins.includes(token))
        balances[token] = (balances[token] || Decimal(0)).add(amount);
    });
    return balances;
  }, {});
};

export { getBalances };
