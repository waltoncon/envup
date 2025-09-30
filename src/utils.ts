import type { MergeChange } from "./merge-ast";

export function needsQuotes(value: string): boolean {
  // If the value contains spaces, quotes, or special shell characters, it should be quoted
  // This regex checks for spaces or characters that might need quoting
  const specialCharsRegex = /[\s"'\\$`!#&*(){}[\];<>?~|]/;
  return specialCharsRegex.test(value);
}

type FuncData = {
  value: string | undefined;
  [key: string]: string | undefined;
};
type FuncReturn = Promise<string | undefined> | string | undefined;
export type FuncCtx = { sourcePath?: string };
export type Func = (data: FuncData, ctx?: FuncCtx) => FuncReturn;
export function defineFunction(callback: Func) {
  return callback;
}

export function prettifyChanges(changes: MergeChange[]): string {
  return changes
    .map((change) => {
      switch (change.type) {
        case "added_key":
          return `+ Added key: ${change.key}`;
        case "added_node":
          return `+ Added ${change.nodeType} node at line ${change.line}`;
        case "added_inline_comment":
          return `+ Added inline comment for key: ${change.key}`;
        case "key_not_in_example":
          return `- Key not in example: ${change.key}`;
        default:
          return `? Unknown change type`;
      }
    })
    .join("\n");
}
