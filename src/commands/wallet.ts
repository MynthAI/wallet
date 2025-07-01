import { confirm } from "@inquirer/prompts";
import { entropyToMnemonic } from "bip39";
import { toAddresses } from "../addresses/index.js";
import { getSavedSeed, saveNewSeed, saveRandomSeed } from "../seed.js";
import { exit, program } from "./cli.js";

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
  .description("Restores a new wallet from a seed phrase or private key")
  .action(async () => {
    const result = await saveNewSeed();
    if (!result.ok) return exit(result.error);

    console.log("Restored wallet from seed");
  });

program
  .command("backup")
  .description("Outputs the mnemonic seed phrase for the current wallet")
  .action(async () => {
    const seed = getSavedSeed();
    if (!seed) return exit("No seed saved. Create a new wallet first.");

    console.log(entropyToMnemonic(seed));
  });

program
  .command("addresses")
  .description("Outputs the addresses for the current wallet")
  .option("--testnet", "Set flag to derive testnet addresses")
  .action(async (options: { testnet: boolean }) => {
    const seed = getSavedSeed();
    if (!seed) return exit("No seed saved. Create a new wallet first.");

    const addresses = toAddresses(
      seed,
      options.testnet ? "testnet" : "mainnet",
    ).assert();

    for (const [blockchain, address] of Object.entries(addresses))
      console.log(`${blockchain}: ${address}`);
  });
