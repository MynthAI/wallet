import { TextDecoder } from "util";

type Encoding = "hex" | "utf8";

const looksLikeHex = (data: Buffer) => {
  if (data.length === 0 || data.length % 2 !== 0) return false;

  for (const b of data)
    if (
      !(
        (b >= 0x30 && b <= 0x39) || // '0'–'9'
        (b >= 0x41 && b <= 0x46) || // 'A'–'F'
        (b >= 0x61 && b <= 0x66) // 'a'–'f'
      )
    )
      return false;

  return true;
};

const isValidUtf8 = (data: Buffer) => {
  let decoded: string;

  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return false;
  }

  // eslint-disable-next-line no-control-regex
  return !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(decoded);
};

const detectEncoding = (data: Buffer): Encoding => {
  if (looksLikeHex(data)) {
    try {
      const decoded = Buffer.from(data.toString("ascii"), "hex");
      if (isValidUtf8(decoded)) return "hex";
    } catch {}
  }

  if (isValidUtf8(data)) return "utf8";

  return "hex";
};

const decode = (data: Buffer): string => data.toString(detectEncoding(data));

export { decode };
