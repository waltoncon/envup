import { parse as parseToJson } from "@/parsers/terraform-tfvars";

export function parse(content: string) {
  const clean = content.replaceAll(/#.*$/gm, "").trim();
  const result = parseToJson(clean);
  return JSON.parse(result);
}
