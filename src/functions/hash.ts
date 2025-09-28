import { defineFunction } from "@/utils";
import type { BinaryToTextEncoding } from "node:crypto";
import { createHash, getHashes } from "node:crypto";

export default defineFunction(function hash({
  value,
  algo = "sha256",
  encoding = "hex",
}: {
  value: string;
  algo?: string;
  encoding?: BinaryToTextEncoding;
}) {
  if (!getHashes().includes(algo)) {
    throw new Error(`Unsupported hash algorithm: ${algo}`);
  }

  if (!["base64", "base64url", "hex", "binary"].includes(encoding)) {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }

  return createHash(algo).update(value).digest(encoding);
});
