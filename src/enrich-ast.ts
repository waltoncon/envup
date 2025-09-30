import type { EnvAst, AssignmentNode } from "./types";
import aws from "./functions/aws";
import { needsQuotes, type Context } from "./utils";
import hash from "./functions/hash";
import random from "./functions/random";
import uuid from "./functions/uuid";
import timestamp from "./functions/timestamp";
import tfvar from "./functions/tfvar";

export async function enrichAst(
  ast: EnvAst[],
  ctx?: Context
): Promise<EnvAst[]> {
  return await Promise.all(
    ast.map(async (node) => {
      if (node.type !== "Assignment") return node;

      if (!node.value.startsWith("envup://")) return node;

      const url = new URL(node.value);
      const funcName = url.hostname;
      const value = url.pathname.slice(1);
      const args = Object.fromEntries(url.searchParams);

      if (value) {
        args.value = value;
      }

      if (!funcName) {
        console.error(`Invalid envup URL (missing function): ${node.raw}`);
        return node;
      }

      if (!(funcName in functions)) {
        console.error(`Unknown envup function: ${funcName}`);
        return node;
      }

      const func = functions[funcName as FuncName];
      const newValue = (await func(args, ctx)) || "";

      return {
        ...node,
        value: newValue,
        quote: needsQuotes(newValue) ? node.quote || '"' : undefined,
      } satisfies AssignmentNode;
    })
  );
}

type FuncName = keyof typeof functions;

const functions = {
  random,
  uuid,
  timestamp,
  hash,
  aws,
  tfvar,
} as const;
