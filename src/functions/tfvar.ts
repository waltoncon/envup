import { defineFunction, getValueByDot } from "@/utils";
import { readFile } from "node:fs/promises";
import { parse, resolve } from "node:path";
import { parse as parseTfvars } from "@/lib/terraform";

export default defineFunction(async function tfvar(
  {
    path,
    key,
  }: {
    value?: string;
    path?: string;
    key?: string;
  },
  { sourcePath } = {}
) {
  if (!path) {
    throw new Error("Missing path to tfvar file");
  }

  if (!key) {
    throw new Error("Missing key to retrieve from tfvar file");
  }

  if (!sourcePath) {
    throw new Error("Missing sourcePath in function context");
  }

  const tfvarFilePath = resolve(parse(sourcePath).dir, path);
  const content = await readFile(tfvarFilePath, "utf-8");
  const parsed = parseTfvars(content);
  const value = getValueByDot(parsed, key);
  return value;
});
