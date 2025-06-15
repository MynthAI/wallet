import { modPow } from "bigint-mod-arith";

const a = -1n;
const p = 2n ** 255n - 19n;
const d = (((-121665n * modPow(121666n, p - 2n, p)) % p) + p) % p;

const G: [bigint, bigint] = [
  15112221349535400772501151409588531511454012693041857206046113283949847762202n,
  46316835694926478169428394003475163141307993866256225615783033603165251855960n,
];

const modInverse = (a: bigint, p: bigint) => modPow(a, p - 2n, p);

const edwardsAdd = (
  P: [bigint, bigint],
  Q: [bigint, bigint],
  d: bigint,
  p: bigint,
): [bigint, bigint] => {
  const [x1, y1] = P;
  const [x2, y2] = Q;
  const x3 =
    ((x1 * y2 + y1 * x2) * modInverse(1n + d * x1 * x2 * y1 * y2, p)) % p;
  const y3 =
    ((y1 * y2 - a * x1 * x2) * modInverse(1n - d * x1 * x2 * y1 * y2, p)) % p;
  return [x3, y3];
};

const edwardsMul = (k: bigint, P: [bigint, bigint], d: bigint, p: bigint) => {
  let R: [bigint, bigint] = [0n, 1n];

  while (k > 0n) {
    if (k & 1n) R = edwardsAdd(R, P, d, p);
    P = edwardsAdd(P, P, d, p);
    k >>= 1n;
  }

  return R;
};

const deriveEd25519PublicKey = (scalar: bigint) => edwardsMul(scalar, G, d, p);

const compressEd25519Coordinates = (x: bigint, y: bigint) => {
  const yBytes = Buffer.from(y.toString(16).padStart(64, "0"), "hex").reverse();
  const xBit = x % 2n << 7n;
  yBytes[31] |= Number(xBit);
  return new Uint8Array(yBytes);
};

const deriveCompressedEd25519PublicKey = (scalar: bigint) =>
  compressEd25519Coordinates(...deriveEd25519PublicKey(scalar));

export {
  compressEd25519Coordinates,
  deriveCompressedEd25519PublicKey,
  deriveEd25519PublicKey,
};
