import program from "./commands/index.js";

const run = async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
