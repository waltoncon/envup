import { globby } from "globby";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type EnvArrayFormat = Array<
  | { type: "comment"; text: string; pos: { line: number; column: number } }
  | {
      type: "var";
      key: string;
      value: string;
      inline_comment?: string;
      quote?: string;
      export?: boolean;
      pos: { line: number; column: number };
    }
>;

const files = await globby(["**", "!*.out"], {
  cwd: resolve("./test-env-files"),
  absolute: true,
  dot: true,
});

console.log("Found files:", files);

const LINE =
  /(?:^|^)(?:^\s*#(?:[^\r\n]*?)(?<full_comment>.*)|\s*(?<export>export\s+)?(?<key>[\w.-]+)(?:\s*=\s*?|:\s+?)(?<val>\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*?(?:#\s*(?<inline_comment>.*))?)(?:$|$)/gm;

for (const file of files) {
  const content = await readFile(file, "utf-8");

  console.log(`\n--- ${file} ---`);

  const parsed = parse(content);

  const output = parsedToString(parsed);

  console.log(output);

  const outputFile = `${file}.out`;

  await writeFile(outputFile, output, "utf-8");
}

export function parsedToString(arr: EnvArrayFormat) {
  return arr
    .map((entry) => {
      if (entry.type === "comment") {
        return `# ${entry.text}`;
      }

      const q = entry.quote || "";
      const ex = entry.export ? "export " : "";

      let line = `${ex}${entry.key}=${q}${entry.value}${q}`;

      if (entry.inline_comment) {
        line += ` # ${entry.inline_comment}`;
      }

      return line;
    })
    .join("\n");
}

export function parse(src: string) {
  // const obj = {};
  const result: EnvArrayFormat = [];

  // Convert buffer to string
  let lines = src.toString();

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/gm, "\n");

  let match;
  while ((match = LINE.exec(lines)) != null) {
    // console.log(match);

    if (match.groups?.full_comment !== undefined) {
      result.push({
        type: "comment",
        text: match.groups.full_comment.trim(),
        pos: getLineAndColumnFromIndex(lines, match.index),
      });
      continue;
    }

    if (match.groups?.key === undefined) {
      // This is probably a blank line
      continue;
    }

    const key = match.groups.key;

    // Default undefined or null to empty string
    let value = match.groups.val || "";

    // Remove whitespace
    value = value.trim();

    // Check if double quoted
    const maybeQuote = value[0];

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");

    const hasQuote = maybeQuote && ['"', "'"].includes(maybeQuote);

    // Expand newlines if double quoted
    if (hasQuote) {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }

    // Add to object
    // obj[key] = value;
    result.push({
      type: "var",
      key,
      value,
      export: match.groups?.export !== undefined,
      quote: hasQuote ? maybeQuote : undefined,
      pos: getLineAndColumnFromIndex(lines, match.index),
    });
  }

  return result;
}

function getLineAndColumnFromIndex(text: string, index: number) {
  if (index < 0 || index > text.length) {
    throw new RangeError("Index is out of range");
  }

  // Get text before the index
  const before = text.slice(0, index);

  // Count lines
  const lines = before.split("\n");

  const line = lines.length;
  const length = lines[line - 1]?.length || 0;
  const column = length + 1;

  return { line, column };
}
