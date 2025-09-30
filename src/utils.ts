import z from "zod";
import type { MergeChange } from "./merge-ast";

export function needsQuotes(value: string): boolean {
  // If the value contains spaces, quotes, or special shell characters, it should be quoted
  // This regex checks for spaces or characters that might need quoting
  const specialCharsRegex = /[\s"'\\$`!#&*(){}[\];<>?~|]/;
  return specialCharsRegex.test(value);
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

export function getValueByDot(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

type MaybePromise<T> = Promise<T> | T;

export type Context = {
  sourcePath?: string;
};

type CreateFunctionConfig<
  TShape extends z.ZodRawShape,
  TRet extends MaybePromise<string | undefined>
> = {
  schema: (zod: typeof z) => TShape;
  handler: (
    args: { [K in keyof TShape]: z.infer<TShape[K]> },
    ctx: Context
  ) => TRet;
};

export function createFunction<
  const TShape extends z.ZodRawShape,
  TRet extends MaybePromise<string | undefined>
>(
  config: CreateFunctionConfig<TShape, TRet>
): (rawArgs: unknown, ctx?: Context) => TRet {
  // Wrap the provided shape in a strict Zod object automatically
  const schema = z.object(config.schema(z)).strict();

  return (rawArgs: unknown, ctx?: Context) => {
    const args = schema.parse(rawArgs);
    return config.handler(args as any, ctx ?? {});
  };
}
