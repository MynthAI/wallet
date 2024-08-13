import {
  Blockfrost,
  getAddressDetails,
  Network,
  Provider,
} from "@lucid-evolution/lucid";
import { type } from "arktype";
import { Command } from "commander";
import { isProblem, mayFail, mayFailAsync } from "ts-handling";
import {
  getPrivateKeys,
  getSavedSeed,
  saveNewSeed,
  saveRandomSeed,
} from "./seed.js";
import { mint } from "./pubkey.js";
import readInput from "./input.js";
import send from "./send.js";
import decrypt from "./encryption.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { confirm } from "@inquirer/prompts";

const { name, description } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"),
    "utf-8",
  ),
);
const program = new Command().name(name).description(description);

const Arguments = {
  blockfrost: {
    flags: "-b, --blockfrost <string>",
    description:
      "The Blockfrost API key to use for querying the Cardano blockchain. Defaults to BLOCKFROST_API_KEY environment variable if omitted.",
  },
  submit: {
    flags: "-s, --submit",
    description:
      "Set flag to submit the transaction to the blockchain. If flag isn't provided, a dry-run will occur.",
  },
  stdin: {
    flags: "-r,--stdin",
    description: "Set flag to read from stdin.",
  },
};

program
  .command("new")
  .description("Creates a new wallet")
  .action(async () => {
    const seed = getSavedSeed();

    if (seed) {
      const proceed = await confirm({
        message:
          "This will delete the current seed and create a new wallet. MAKE SURE YOU HAVE BACKED UP YOUR CURRENT SEED PHRASE. Press enter to delete your current seed phrase.",
        default: true,
      });
      if (!proceed) return;
    }

    saveRandomSeed();
    if (seed) console.log("Deleted seed phrase");
    console.log("Created new wallet. Don't forget to create a backup!");
  });

program
  .command("restore")
  .description("Restores a new wallet from a seed phrase")
  .action(async () => {
    const result = await saveNewSeed();
    if (!result.ok) return exit(result.error);

    console.log("Restored wallet from seed phrase");
  });

program
  .command("backup")
  .description("Outputs the saved seed phrase")
  .action(async () => {
    const seed = getSavedSeed();
    if (!seed) return exit("No seed phrase saved. Create a new wallet first.");

    console.log(seed);
  });

program
  .command("mint")
  .description(
    "Mints a pubkey token, allowing the wallet to receive encrypted messages",
  )
  .option(Arguments.blockfrost.flags, Arguments.blockfrost.description)
  .option(Arguments.submit.flags, Arguments.submit.description)
  .action(async ($options: object) => {
    const options = Options($options);
    if (options instanceof type.errors) return exit(options.summary);
    if (!(await validateProvider(options.provider))) return;
    const keys = (await getPrivateKeys()).unwrap();
    if (isProblem(keys)) return exit(keys.error);

    const result = await mint(options.maker(keys), options.host);
    if (!result.ok) return exit(result.error);

    if (!options.submit) {
      console.log("Transaction building was successful (not submitted)");
      return;
    }

    await result.data.submit();
    console.log("pubkey was successfully minted");
  });

program
  .command("send")
  .description("Sends an encrypted transaction to a destination")
  .argument(
    "destination",
    "The Cardano address that will receive the encrypted message",
  )
  .option(Arguments.blockfrost.flags, Arguments.blockfrost.description)
  .option(Arguments.stdin.flags, Arguments.stdin.description)
  .option(Arguments.submit.flags, Arguments.submit.description)
  .action(async ($destination: string, $options: object) => {
    const options = Options($options);
    if (options instanceof type.errors) return exit(options.summary);
    const destination = Address(options.network)($destination);
    if (destination instanceof type.errors) return exit(destination.summary);
    if (!(await validateProvider(options.provider))) return;
    const keys = (await getPrivateKeys()).unwrap();
    if (isProblem(keys)) return exit(keys.error);

    const message = (
      await readInput(
        options.stdin,
        "Copy and paste the JSON message you want to send",
      )
    ).unwrap();
    if (isProblem(message)) return exit(message.error);

    const result = await send(
      options.maker(keys),
      destination,
      1,
      "myusd",
      message,
      options.host,
    );
    if (!result.ok) return exit(result.error);

    if (!options.submit) {
      console.log("Transaction building was successful (not submitted)");
      return;
    }

    const txId = await result.data.submit();
    console.log("message was successfully sent");
    console.log(txId);
  });

program
  .command("decrypt")
  .description("Decrypts a message embedded within a Cardano transaction")
  .argument(
    "hash",
    "The ID of the transaction containing the message to decrypt",
  )
  .option(Arguments.blockfrost.flags, Arguments.blockfrost.description)
  .action(async ($hash: string, $options: object) => {
    const hash = TxHash($hash);
    if (hash instanceof type.errors) return exit(hash.summary);
    const options = Options($options);
    if (options instanceof type.errors) return exit(options.summary);
    if (!(await validateProvider(options.provider))) return;
    const keys = (await getPrivateKeys()).unwrap();
    if (isProblem(keys)) return exit(keys.error);

    const message = await decrypt(options.maker(keys), hash, options.host);
    if (!message.ok) return exit(message.error);

    console.log(message.data);
  });

const validateProvider = async (provider: Provider) => {
  const params = await mayFailAsync(() => provider.getProtocolParameters());
  if (params.ok) return true;

  exit("Unable to connect to provider using given credentials");
  return false;
};

const exit = (message: string) => {
  console.error(message);
  process.exitCode = 1;
};

const Address = (network: Network) =>
  type("string").narrow((v, ctx) => {
    const details = mayFail(() => getAddressDetails(v)).unwrap();
    if (isProblem(details)) return ctx.mustBe("valid Cardano wallet address");
    if (!details.paymentCredential) return ctx.mustBe("a payment address");
    if (!details.stakeCredential)
      return ctx.mustBe("a payment address with stake credential");

    const expectedNetworkId = network === "Mainnet" ? 1 : 0;
    if (details.networkId !== expectedNetworkId)
      return ctx.mustBe(`${network.toLowerCase()} network`);

    return true;
  });

const TxHash = type(/^[a-fA-F0-9]{64}$/).pipe((v) => v.toLowerCase());
type TxHash = typeof TxHash.infer;

const Options = type({
  "blockfrost?": "string>7",
  "stdin?": "true",
  "submit?": "true",
}).pipe((options, ctx) => {
  const blockfrost = options.blockfrost || process.env["BLOCKFROST_API_KEY"];
  if (!blockfrost) return ctx.error("set with Blockfrost API key");
  const $network = blockfrost.substring(0, 7);

  if (!["mainnet", "preview", "preprod"].includes($network))
    return ctx.error("set with valid Blockfrost API key");

  const provider: Provider = new Blockfrost(
    `https://cardano-${$network.toLowerCase()}.blockfrost.io/api/v0`,
    blockfrost,
  );

  const host =
    $network === "mainnet"
      ? "https://www.mynth.ai"
      : "https://preview.mynth.ai";
  const network = ($network.substring(0, 1).toUpperCase() +
    $network.substring(1)) as Network;

  const stdin = options.stdin !== undefined;
  const submit = options.submit !== undefined;

  const maker = (privateKeys: [string, string]) => {
    return {
      network,
      privateKeys,
      provider,
    };
  };

  return {
    host,
    maker,
    network,
    provider,
    stdin,
    submit,
  };
});
type Options = typeof Options.infer;

export default program;
