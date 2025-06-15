import { type } from "arktype";

const PrivateKey = type(/^[a-f0-9]{64}$/);
type PrivateKey = typeof PrivateKey.infer;

export { PrivateKey };
