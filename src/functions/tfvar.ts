import { parse as parseTfvars } from "@/lib/terraform";
import { createFunction, getValueByDot } from "@/utils";
import { readFile } from "node:fs/promises";
import { parse, resolve } from "node:path";

export default createFunction({
  schema: (z) => ({
    path: z.string().describe("Path to the .tfvars file"),
    key: z.string().describe("The key to retrieve from the .tfvars file"),
  }),
  handler: async ({ path, key }, { sourcePath }) => {
    if (!sourcePath) {
      throw new Error("Missing sourcePath in function context");
    }

    const tfvarFilePath = resolve(parse(sourcePath).dir, path);
    const content = await readFile(tfvarFilePath, "utf-8");
    const parsed = parseTfvars(content);
    const value = getValueByDot(parsed, key);
    return value;
  },
});
