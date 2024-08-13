import * as test from "ava";

type ExecutionContext = test.ExecutionContext;

function invariant(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condition: any,
  t: ExecutionContext,
): asserts condition {
  if (!condition) t.fail(`Invariant failed: ${condition}`);
}

export { invariant };
