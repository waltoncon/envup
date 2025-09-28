import type { EnvAst, AssignmentNode } from "./types";

type MergeChange =
  | { type: "added_key"; key: string }
  | { type: "added_node"; nodeType: string; line: number }
  | { type: "added_inline_comment"; key: string }
  | { type: "key_not_in_example"; key: string };

export interface MergeResult {
  merged: EnvAst[];
  changes: MergeChange[];
}

/**
 * Merges .env and .env.example ASTs.
 * - Keeps .env values and inline comments.
 * - Adds missing keys/comments from example in the same order.
 * - Merges inline comments if .env is missing one.
 * - Ignores trailing blank lines in example but keeps .env’s.
 * - Returns merged AST and list of changes
 */
export function mergeEnvAst(env: EnvAst[], example: EnvAst[]): MergeResult {
  const changes: MergeChange[] = [];

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
        let mergedComment = envNode.comment;
        if ((!mergedComment || mergedComment.trim() === "") && exNode.comment) {
          mergedComment = exNode.comment;
          changes.push({
            type: "added_inline_comment",
            key: exNode.key,
          });
        }

        merged.push({ ...envNode, comment: mergedComment });
      } else {
        // Add new assignment from example
        merged.push({ ...exNode });
        changes.push({ type: "added_key", key: exNode.key });
      }
    } else {
      // Comments, blanks, unknown — follow example layout
      merged.push({ ...exNode });

      if (exNode.type === "Comment" || exNode.type === "Unknown") {
        changes.push({
          type: "added_node",
          nodeType: exNode.type,
          line: exNode.line,
        });
      }
    }
  }

  // Add .env keys not present in example
  const exampleKeys = new Set(
    example
      .filter((n): n is AssignmentNode => n.type === "Assignment")
      .map((n) => n.key)
  );

  const extraEnvNodes = env.filter(
    (n): n is AssignmentNode =>
      n.type === "Assignment" && !exampleKeys.has(n.key)
  );

  merged.push(...extraEnvNodes);
  for (const n of extraEnvNodes) {
    changes.push({
      type: "key_not_in_example",
      key: n.key,
    });
  }

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
  const finalMerged = merged.map((node, i) => ({ ...node, line: i + 1 }));

  return { merged: finalMerged, changes };
}
