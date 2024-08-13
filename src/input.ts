import { type } from "arktype";
import { Result, Ok, Err, mayFail } from "ts-handling";

const readUserInput = (): Promise<string> => {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  let data = "";

  process.stdin.on("data", (chunk) => {
    data += chunk;
  });

  return new Promise<string>((resolve) => {
    process.stdin.on("end", () => {
      resolve(data.trim());
    });
  });
};

const runPrompt = async (message: string): Promise<Result<string, string>> => {
  if (!process.stdin.isTTY) return Err("Must be run within a terminal");

  console.log(message);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  let data = "";
  let inputTimeout: NodeJS.Timeout;

  return Ok(
    await new Promise<string>((resolve) => {
      const onDataReceived = (chunk: string) => {
        clearTimeout(inputTimeout);
        data += chunk;
        inputTimeout = setTimeout(() => {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onDataReceived);
          process.stdout.moveCursor(0, -1);
          process.stdout.clearLine(1);
          resolve(data.replace(/\r/g, "\n").trim());
        }, 500);
      };

      process.stdin.on("data", onDataReceived);
    }),
  );
};

const readInput = async (
  readFromStdin: boolean,
  message: string,
): Promise<Result<string, string>> => {
  if (readFromStdin) return Ok(await readUserInput());
  return runPrompt(message);
};

const readJsonInput = async (
  readFromStdin: boolean,
  message: string,
): Promise<Result<object, string>> => {
  const input = await readInput(readFromStdin, message);
  if (!input.ok) return Err(input.error);

  const parsed = Parser(input.data);
  if (parsed instanceof type.errors) return Err(parsed.summary);

  return Ok(parsed);
};

const Parser = type("string")
  .pipe((s, ctx) => {
    const parsed = mayFail(() => JSON.parse(s));
    return parsed.ok ? parsed.data : ctx.error("valid JSON");
  })
  .pipe(type("object"));

export default readJsonInput;
export { Parser };
