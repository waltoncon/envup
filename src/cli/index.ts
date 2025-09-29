import { Command, Option } from "commander";
import { readFile, stat, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import pkg from "../../package.json";
import { parseEnvToAST } from "@/ast";
import { mergeEnvAst } from "@/merge-ast";
import { stringifyEnvAst } from "@/stringify-ast";
import { enrichAst } from "@/enrich-ast";
import { prettifyChanges } from "@/utils";
import { globby } from "globby";

const program = new Command();

program
  .name("envup")
  .description(pkg.description)
  .version(pkg.version)
  .addOption(
    new Option(
      "-C, --cwd <dir>",
      "Run in the given current working directory"
    ).default(process.cwd(), "current working directory")
  )
  .action(async ({ cwd }) => {
    const globbed = await globby(".env*", {
      cwd,
      dot: true,
      gitignore: false,
    });

    const files = globbed
      .map((file) => resolve(cwd, file.replace(/\.example$/, "")))
      .filter((file) => !file.endsWith(".bak"))
      .filter((file, index, arr) => arr.indexOf(file) === index)
      .map((dest) => {
        const source = `${dest}.example`;
        const relDest = relative(cwd, dest);
        const relSource = relative(cwd, source);
        return { source, dest, relDest, relSource };
      });

    if (files.length === 0) {
      console.log("No env or example files found");
      return;
    }

    for (const { source, dest, relDest, relSource } of files) {
      if (!(await fileExists(source))) {
        console.error(`${source} does not exist.`);
        continue;
      }

      if (await fileExists(dest)) {
        console.log(`Updating ${relDest} from ${relSource}`);

        const destContent = await readFile(dest, "utf-8");

        await writeFile(`${dest}.bak`, destContent);

        const { merged, changes } = mergeEnvAst(
          parseEnvToAST(destContent),
          parseEnvToAST(await readFile(source, "utf-8"))
        );

        console.log(changes.length ? prettifyChanges(changes) : "No changes");

        const enriched = await enrichAst(merged);
        const stringified = stringifyEnvAst(enriched);
        await writeFile(dest, stringified);
      } else {
        console.log(`Creating ${relDest} from ${relSource}...`);
        const exampleContent = await readFile(source, "utf-8");
        const example = parseEnvToAST(exampleContent);
        const enriched = await enrichAst(example);
        const stringified = stringifyEnvAst(enriched);
        await writeFile(dest, stringified);
      }
    }
  });

program.parse();

async function fileExists(path: string): Promise<boolean> {
  return stat(path)
    .then(() => true)
    .catch(() => false);
}
