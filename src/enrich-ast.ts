import type { EnvAst, AssignmentNode } from "./types";
import aws from "./functions/aws";
import { needsQuotes } from "./utils";
import { hash } from "./functions/hash";
import random from "./functions/random";
import uuid from "./functions/uuid";

export async function enrichAst(ast: EnvAst[], existingAst: EnvAst[] = []) {
  return await Promise.all(
    ast.map(async (node) => {
      if (node.type !== "Assignment") return node;

      const existingNode = existingAst
        .filter((n) => n.type === "Assignment")
        .find((n) => n.key === node.key);

      if (existingNode) return { ...node, value: existingNode.value };

      if (!node.value.startsWith("envup://")) return node;

      const url = new URL(node.value);
      const funcName = url.hostname;

      if (!funcName) {
        console.error(`Invalid envup URL (missing function): ${node.raw}`);
        return node;
      }

      if (!(funcName in functions)) {
        console.error(`Unknown envup function: ${funcName}`);
        return node;
      }

      const func = functions[funcName as FuncName];
      const newValue = (await func(url)) || "";

      return {
        ...node,
        value: newValue,
        quote: needsQuotes(newValue) ? node.quote || '"' : undefined,
      } satisfies AssignmentNode;
    })
  );
}

type Func = (url: URL) => Promise<string | undefined> | string | undefined;
type FuncName = keyof typeof functions;

const functions = {
  random,
  uuid,
  timestamp: () => Date.now().toString(),
  hash,
  aws,
} as const satisfies Record<string, Func>;
