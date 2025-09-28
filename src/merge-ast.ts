import type { EnvAst, AssignmentNode } from "./types";

/**
 * Merges .env and .env.example ASTs.
 * - Keeps .env values and inline comments.
 * - Adds missing keys/comments from example in the same order.
 * - Merges inline comments if .env is missing one.
 * - Ignores trailing blank lines in example but keeps .env’s.
 */
export function mergeEnvAst(env: EnvAst[], example: EnvAst[]): EnvAst[] {
  const envAssignments = new Map(
    env
      .filter((n): n is AssignmentNode => n.type === "Assignment")
      .map((n) => [n.key, n])
  );

  // Remove trailing blank lines from example
  let exampleTrimmed = [...example];
  while (
    exampleTrimmed.length > 0 &&
    exampleTrimmed[exampleTrimmed.length - 1]?.type === "Blank"
  ) {
    exampleTrimmed.pop();
  }

  const merged: EnvAst[] = [];

  // Build the merged structure following example order
  for (const exNode of exampleTrimmed) {
    if (exNode.type === "Assignment") {
      const envNode = envAssignments.get(exNode.key);
      if (envNode) {
        // Merge inline comment (example fills in only if env missing)
        const mergedComment =
          envNode.comment && envNode.comment.trim() !== ""
            ? envNode.comment
            : exNode.comment;
        merged.push({ ...envNode, comment: mergedComment });
      } else {
        // Add new assignment from example
        merged.push({ ...exNode });
      }
    } else {
      // Comments, blanks, unknown nodes — follow example layout
      merged.push({ ...exNode });
    }
  }

  // Add .env keys not present in example
  const exampleKeys = new Set(
    example
      .filter((n): n is AssignmentNode => n.type === "Assignment")
      .map((n) => n.key)
  );

  const extraEnvNodes = env.filter((n) => {
    return n.type === "Assignment" && !exampleKeys.has(n.key);
  });

  // Append extras at the end (preserving .env's trailing blanks)
  merged.push(...extraEnvNodes);

  // Preserve trailing blanks from .env (if any)
  const trailingEnvBlanks = [...env]
    .reverse()
    .filter((n) => n.type === "Blank")
    .reverse();

  if (trailingEnvBlanks.length > 0) {
    // Add them at the end if not already present
    const lastMerged = merged[merged.length - 1];
    if (!lastMerged || lastMerged.type !== "Blank") {
      merged.push(...trailingEnvBlanks);
    }
  }

  // Recalculate line numbers sequentially
  return merged.map((node, i) => ({ ...node, line: i + 1 }));
}
