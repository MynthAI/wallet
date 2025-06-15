import { modInv } from "bigint-mod-arith";

const p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
const a = 0n;
const G: [bigint, bigint] = [
  0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
  0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
];
const zero: [bigint, bigint] = [0n, 0n];

const computePointDoublingSlope = (
  x1: bigint,
  y1: bigint,
  a: bigint,
  p: bigint,
): bigint => {
  const numerator = 3n * x1 * x1 + a;
  const denominator = modInv(2n * y1, p);
  return (numerator * denominator) % p;
};

const computePointAdditionSlope = (
  x1: bigint,
  x2: bigint,
  y1: bigint,
  y2: bigint,
  p: bigint,
): bigint => {
  const numerator = y2 - y1;
  const denominator = modInv(x2 - x1, p);
  return (numerator * denominator) % p;
};

const pointAdd = (
  P: [bigint, bigint],
  Q: [bigint, bigint],
  a: bigint,
  p: bigint,
): [bigint, bigint] => {
  if (P[0] === 0n && P[1] === 0n) return Q;
  if (Q[0] === 0n && Q[1] === 0n) return P;

  const [x1, y1] = P;
  const [x2, y2] = Q;

  if (x1 === x2) {
    if (y1 !== y2 || y1 === 0n) return zero;
    const m = computePointDoublingSlope(x1, y1, a, p);
    const x3 = (m * m - x1 - x2) % p;
    const y3 = (m * (x1 - x3) - y1) % p;
    return [(x3 + p) % p, (y3 + p) % p];
  } else {
    const m = computePointAdditionSlope(x1, x2, y1, y2, p);
    const x3 = (m * m - x1 - x2) % p;
    const y3 = (m * (x1 - x3) - y1) % p;
    return [(x3 + p) % p, (y3 + p) % p];
  }
};

const pointMul = (
  k: bigint,
  P: [bigint, bigint],
  a: bigint,
  p: bigint,
): [bigint, bigint] => {
  let R: [bigint, bigint] = zero;
  let Q: [bigint, bigint] = [...P];

  while (k > 0n) {
    if (k & 1n) R = pointAdd(R, Q, a, p);
    Q = pointAdd(Q, Q, a, p);
    k >>= 1n;
  }

  return R;
};

const deriveSecp256k1PublicKey = (entropy: bigint) =>
  pointMul(entropy, G, a, p);

export { deriveSecp256k1PublicKey };
