import type { BinaryToTextEncoding } from "node:crypto";
import { createHash, getHashes } from "node:crypto";

export function hash(url: URL) {
  const value = url.pathname.slice(1);
  const algo = url.searchParams.get("algo") || "sha256";
  const encoding = (url.searchParams.get("encoding") ||
    "hex") as BinaryToTextEncoding;

  if (!getHashes().includes(algo)) {
    throw new Error(`Unsupported hash algorithm: ${algo}`);
  }

  if (!["base64", "base64url", "hex", "binary"].includes(encoding)) {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }

  return createHash(algo).update(value).digest(encoding);
}
