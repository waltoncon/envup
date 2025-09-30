import { createFunction } from "@/utils";
import { createHash, getHashes } from "node:crypto";

export default createFunction(
  {
    schema: (z) => ({
      value: z.string().describe("The input string to hash"),
      algo: z
        .enum(getHashes())
        .default("sha256")
        .describe("The hash algorithm to use (see Node.js crypto.getHashes())"),
      encoding: z
        .enum(["base64", "base64url", "hex", "binary"])
        .default("hex")
        .describe("The output encoding"),
    }),
    handler: ({ value, algo, encoding }) => {
      return createHash(algo).update(value).digest(encoding);
    },
  }
  // function hash({
  //   value,
  //   algo = "sha256",
  //   encoding = "hex",
  // }: {
  //   value?: string;
  //   algo?: string;
  //   encoding?: BinaryToTextEncoding;
  // }) {
  //   if (value === undefined) {
  //     throw new Error("Missing value for hash function");
  //   }

  //   if (!getHashes().includes(algo)) {
  //     throw new Error(`Unsupported hash algorithm: ${algo}`);
  //   }

  //   if (!["base64", "base64url", "hex", "binary"].includes(encoding)) {
  //     throw new Error(`Unsupported encoding: ${encoding}`);
  //   }

  //   return createHash(algo).update(value).digest(encoding);
  // }
);
