import { globby } from "globby";
import { appendFile, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, parse as parseFile } from "node:path";
import { parse, parsedToString } from "@/parse";

const files = await globby(["**", "!*.out"], {
  cwd: resolve("./test-env-files"),
  absolute: true,
  dot: true,
});

console.log("Found files:", files);

await rm("./test-env-files/all.env");

for (const file of files) {
  if (!file.includes("export")) continue;

  console.log("Processing file:", file);

  const content = await readFile(file, "utf-8");
  const name = parseFile(file).base;

  await appendFile(
    "./test-env-files/all.env",
    `# --- ${name} ---\n${content}\n`,
    "utf-8"
  );

  console.log(`\n--- ${file} ---`);

  const parsed = parse(content);

  const output = parsedToString(parsed);

  console.log(output);

  const outputFile = `${file}.out`;

  await writeFile(outputFile, output, "utf-8");
}
