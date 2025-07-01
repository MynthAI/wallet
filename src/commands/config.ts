import { type } from "arktype";
import config from "../config.js";
import { exit, program } from "./cli.js";

const ProviderId = type(/^[a-z0-9_-]{3,20}$/);
const Fee = type("string.numeric.parse | number").pipe(
  type("0 <= number < 99"),
);

const cli = program
  .command("config")
  .description("Shows and updates wallet configuration");

cli
  .command("show")
  .description("Shows current wallet configuration")
  .action(() => {
    const providerId = config.get("providerId");
    const fee = config.get("fee") || 0;

    if (providerId) console.log("Provider ID:", providerId);

    console.log(`Fee: ${fee}%`);
  });

const set = cli.command("set").description("Updates wallet configuration");

set
  .command("provider-id")
  .description("Sets the provider ID to use for intent generation")
  .argument("id", "The provider ID to use for intent generation")
  .action(($providerId: string) => {
    const providerId = ProviderId($providerId);
    if (providerId instanceof type.errors) exit(providerId.summary);
    config.set("providerId", providerId);
    console.log("Set providerId to", providerId);
  });

set
  .command("fee")
  .description("Sets the fee to use for intent generation")
  .argument("fee", "The fee to use for intent generation")
  .action(($fee: string) => {
    const fee = Fee($fee);
    if (fee instanceof type.errors) exit(fee.summary);
    config.set("fee", fee);
    console.log(`Set fee to ${fee}%`);
  });
