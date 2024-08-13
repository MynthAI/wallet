import { HTTPError } from "got";
import { mayFailAsync } from "ts-handling";

const handle = (task: () => Promise<unknown>) =>
  mayFailAsync(async () => {
    try {
      return await task();
    } catch (error) {
      if (error instanceof HTTPError)
        console.error("Error response:", error.response.body);

      throw error;
    }
  });

export { handle };
