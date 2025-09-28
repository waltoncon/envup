import { parseEnvToAST } from "@/ast";
import { enrichAst } from "@/enrich-ast";
import { stringifyEnvAst } from "@/stringify-ast";

// Example usage
// const content = await readFile("./test-env-files/.env.envup", "utf-8");
const content = `RANDOM=envup://random
# AWS=envup:aws:/example/secret
// BCRYPT=envup://bcrypt/myplaintextpassword?salt=10
ZOOPLA_SECRET=envup://aws//zoopla-pro-service/salesforce/password?profile=portal-dev&region=eu-west-1`;
const ast = parseEnvToAST(content);
console.log(JSON.stringify(ast, null, 2));

console.log("\nOriginal:");
console.log(stringifyEnvAst(ast));

console.log("\n\nEnriched:");
console.log(stringifyEnvAst(await enrichAst(ast)));

const env = `
MY_KEY=UnchangedValue
`;

const envExample = `
MY_KEY=envup://random
`;

console.log("\n\nWith existing env:");
console.log(
  stringifyEnvAst(
    await enrichAst(parseEnvToAST(envExample), parseEnvToAST(env))
  )
);
