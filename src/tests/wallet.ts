import { getPrivateKeysFromSeed } from "../seed";
import { Blockfrost, Network } from "@lucid-evolution/lucid";

const seed =
  "enact clerk shift mobile palm original october problem junior enforce drink bean anchor total measure misery butter tuition hood pear rescue purchase rich zoo";
const privateKeys = getPrivateKeysFromSeed(seed);
const network: Network = "Preview";
const host = "https://preview.mynth.ai";

const getProvider = () => {
  const projectId = process.env["BLOCKFROST_API_KEY"];
  if (!projectId)
    throw new Error("BLOCKFROST_API_KEY environment variable must be set");

  return new Blockfrost(
    "https://cardano-preview.blockfrost.io/api/v0",
    projectId,
  );
};

const wallet = () => {
  return {
    network,
    privateKeys,
    provider: getProvider(),
  };
};

export default wallet;
export { host };
