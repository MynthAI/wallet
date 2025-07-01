import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";

const { name, description } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "..", "package.json"),
    "utf-8",
  ),
);
const program = new Command().name(name).description(description);

const exit = (message: string) => {
  console.error(message);
  process.exitCode = 1;
};

export { exit, program };
