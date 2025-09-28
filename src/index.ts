import { readdir } from "node:fs/promises";
import { globby } from "globby";
import { parse } from "node:path";

const cwd = process.cwd();
const files = await globby("./.env*.example", { cwd, absolute: true });

console.log("Found .env example files:");
for (const file of files) {
  console.log(`- ${file}`);
  processEnvExampleFile(file);
}

function processEnvExampleFile(file: string) {
  console.log(`Processing ${file}`);

  const parsed = parse(file);
  const destEnvFile = parsed.dir + "/" + parsed.name.replace(".example", "");

  console.log(`  -> ${destEnvFile}`);
}

function mergeEnvs(
  source: Record<string, string>,
  override: Record<string, string>
) {
  return { ...source, ...override };
}
