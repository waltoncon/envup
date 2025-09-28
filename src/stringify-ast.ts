import type { EnvAst } from "./types";

export function stringifyEnvAst(ast: EnvAst[]) {
  return ast
    .map((node) => {
      switch (node.type) {
        case "Blank":
          return node.content;
        case "Comment":
          return `# ${node.value}`;
        case "Assignment":
          const exportPart = node.exported ? "export " : "";
          const quote = node.quote || "";
          const commentPart = node.comment ? ` # ${node.comment}` : "";
          return `${exportPart}${node.key}=${quote}${node.value}${quote}${commentPart}`;
        case "Unknown":
          return node.content;
      }
    })
    .join("\n");
}
