import { readFileSync } from "fs";
import { type } from "arktype";
import { parse } from "yaml";

const Tokens = type({
  mainnet: {
    mnt: "string[]",
    usd: "string[]",
  },
  testnet: {
    mnt: "string[]",
    usd: "string[]",
  },
});

const $load = () => {
  const path = new URL("./tokens.yml", import.meta.url);
  const contents = readFileSync(path, "utf8");
  return Tokens.assert(parse(contents));
};

const tokens = $load();

const get = (network: "mainnet" | "testnet") => tokens[network];

export default get;
