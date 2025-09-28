export type AssignmentNode = {
  type: "Assignment";
  key: string;
  value: string;
  comment?: string;
  raw: string;
  line: number;
  quote?: '"' | "'";
  exported: boolean;
};

export type CommentNode = {
  type: "Comment";
  value: string;
  raw: string;
  line: number;
};

export type BlankNode = {
  type: "Blank";
  content: string;
  line: number;
};

export type UnknownNode = {
  type: "Unknown";
  content: string;
  line: number;
};

export type EnvAst = CommentNode | AssignmentNode | BlankNode | UnknownNode;
