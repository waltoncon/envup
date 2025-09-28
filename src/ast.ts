import type { AssignmentNode, EnvAst } from "./types";

/**
 * Parses a .env file content into an AST
 * @param {string} content - The .env file content
 * @returns {Array} AST nodes
 */
export function parseEnvToAST(content: string) {
  const lines = content.split(/\r?\n/);
  const ast: EnvAst[] = [];

  let multilineNode: AssignmentNode | null = null;

  lines.forEach((line, index) => {
    const rawLine = line;
    const trimmed = line.trim();

    // If we are in a multiline string, accumulate lines
    if (multilineNode) {
      multilineNode.value += "\n" + line;
      multilineNode.raw += "\n" + rawLine;

      if (
        multilineNode.quote &&
        line.includes(multilineNode.quote) &&
        !line.endsWith("\\")
      ) {
        // End of multiline
        multilineNode.value = multilineNode.value
          .replace(new RegExp(`^${multilineNode.quote}`), "")
          .replace(new RegExp(`${multilineNode.quote}$`), "");
        ast.push(multilineNode);
        multilineNode = null;
      }
      return;
    }

    // Blank line
    if (trimmed === "") {
      ast.push({ type: "Blank", content: rawLine, line: index + 1 });
      return;
    }

    // Comment line
    if (trimmed.startsWith("#")) {
      ast.push({
        type: "Comment",
        value: trimmed.slice(1).trim(),
        raw: rawLine,
        line: index + 1,
      });
      return;
    }

    // Assignment
    const equalsIndex = line.indexOf("=");
    if (equalsIndex !== -1) {
      let keyPart = line.slice(0, equalsIndex).trim();
      let exported = false;
      if (/^export\s+/i.test(keyPart)) {
        exported = true;
        keyPart = keyPart.replace(/^export\s+/i, "");
      }
      let key = keyPart;
      let rest = line.slice(equalsIndex + 1).trim();

      let value = rest;
      let comment = undefined;
      let quote: '"' | "'" | undefined;

      // Handle inline comment
      const hashIndex = rest.indexOf("#");
      if (hashIndex !== -1) {
        // Check if hash is inside quotes
        const quoteChar = rest[0];
        if (
          (quoteChar === '"' || quoteChar === "'") &&
          rest.endsWith(quoteChar)
        ) {
          // Ignore hash inside quotes
        } else {
          value = rest.slice(0, hashIndex).trim();
          comment = rest.slice(hashIndex + 1).trim();
        }
      }

      // Handle multiline strings
      if (
        (value.startsWith('"') && !value.endsWith('"')) ||
        (value.startsWith("'") && !value.endsWith("'"))
      ) {
        multilineNode = {
          type: "Assignment",
          key,
          value: value,
          comment,
          raw: rawLine,
          line: index + 1,
          quote: value[0] as '"' | "'",
          exported,
        };
        return; // accumulate next lines
      }

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        quote = value[0] as '"' | "'";
        value = value.slice(1, -1);
      }

      ast.push({
        type: "Assignment",
        key,
        value,
        comment,
        raw: rawLine,
        line: index + 1,
        exported,
        quote,
      });
      return;
    }

    // If line doesn't match anything, treat as raw
    ast.push({ type: "Unknown", content: rawLine, line: index + 1 });
  });

  return ast;
}
