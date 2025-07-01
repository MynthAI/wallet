import { blake3Hash } from "@webbuf/blake3";
import { WebBuf } from "@webbuf/webbuf";
import Conf from "conf";
import * as id from "node-machine-id";

type Settings = {
  fee?: number;
  providerId?: string;
  seed?: string;
};

const getEncryptionKey = () =>
  blake3Hash(WebBuf.fromHex(id.default.machineIdSync())).toHex();

const config = new Conf<Settings>({
  clearInvalidConfig: true,
  encryptionKey: getEncryptionKey(),
  projectName: "encrypt",
});

export default config;
