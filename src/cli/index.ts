import { Command, Option } from "commander";
import { readFile, stat, writeFile as baseWriteFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import pkg from "../../package.json";
import { parseEnvToAST } from "@/ast";
import { mergeEnvAst } from "@/merge-ast";
import { stringifyEnvAst } from "@/stringify-ast";
import { enrichAst } from "@/enrich-ast";
import { prettifyChanges } from "@/utils";
import { globby } from "globby";
import type { EnvAst } from "@/types";

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
  .addOption(
    new Option("--dry-run", "Show what would be done, but make no changes")
  )
  .argument("[files...]", "Files to process (default: all .env* files)", [])
  .action(async (filesArg: string[], { cwd, dryRun }) => {
    const globbed = filesArg?.length
      ? filesArg
      : await globby(".env*", { cwd, dot: true, gitignore: false });

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

      const sourceContent = await readFile(source, "utf-8");
      const sourceAst = parseEnvToAST(sourceContent);

      if (dryRun) {
        console.log("Source content:\n", sourceContent);
      }

      let outputAst: EnvAst[];

      if (await fileExists(dest)) {
        console.log(`Updating ${relDest} from ${relSource}`);

        const destContent = await readFile(dest, "utf-8");

        await writeFile(dryRun, `${dest}.bak`, destContent);

        const { merged, changes } = mergeEnvAst(
          parseEnvToAST(destContent),
          sourceAst
        );

        if (changes.length) {
          console.log(prettifyChanges(changes));
        }

        outputAst = await enrichAst(merged, { sourcePath: source });
      } else {
        console.log(`Creating ${relDest} from ${relSource}...`);
        outputAst = await enrichAst(sourceAst, { sourcePath: source });
      }

      const stringified = stringifyEnvAst(outputAst);
      await writeFile(dryRun, dest, stringified);
    }
  });

program.parse();

async function fileExists(path: string): Promise<boolean> {
  return stat(path)
    .then(() => true)
    .catch(() => false);
}

async function writeFile(
  dryRun: boolean,
  ...[dest, content]: Parameters<typeof baseWriteFile>
) {
  if (dryRun) {
    console.log(`Writing to ${dest}:\n${content}`);
  } else {
    await baseWriteFile(dest, content);
  }
}
