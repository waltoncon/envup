import { parse } from "path";
import { describe, it, expect } from "bun:test";
import { parseEnvToAST } from "./ast";
import { mergeEnvAst } from "./merge-ast";
import { stringifyEnvAst } from "./stringify-ast";

describe("Merging ASTs", () => {
  it("should merge two ASTs correctly", () => {
    const existingAst = parseEnvToAST(/* ini */ `export AWS_REGION=eu-west-1
# Fastify local default port
export PORT=3000
# New comment here
export OTEL_SERVICE_NAME=demo-service
# change 'none' to 'console' to see traces
export BACKEND_TO_BACKEND_ENABLED=true
export SERVICE_A_AUTH_SERVICE_NAME="updated_service_name"
export SERVICE_A_AUTH_KEY=realpassword123
export SALESFORCE_AUTH_URL="https://my.salesforce.com/"
export SERVICE_B_DOMAIN="service-b.example.com"
export SERVICE_B_AUTH_KEY="An actual key"
export SERVICE_B_AUTH_SERVICE_NAME=demo
export PASSWORD_NOT_IN_EXAMPLE=passwordABC
export TOKEN_NOT_IN_EXAMPLE=token123
export MANUALLY_ADDED_AT_THE_BOTTOM="local"
`);

    const exampleAst = parseEnvToAST(/* ini */ `export AWS_REGION=eu-west-1
# Fastify local default port
export PORT=3000
# New comment here
export OTEL_SERVICE_NAME=demo-service
# change 'none' to 'console' to see traces
export BACKEND_TO_BACKEND_ENABLED=true # added a comment here
export SERVICE_A_AUTH_SERVICE_NAME="dev"
export SERVICE_A_AUTH_KEY="dev"
export SALESFORCE_AUTH_URL="https://my.salesforce.com/"
export SERVICE_B_DOMAIN=localhost:3001
export SERVICE_B_AUTH_KEY=dev
export SERVICE_B_AUTH_SERVICE_NAME=local
export MANUALLY_ADDED_AT_THE_BOTTOM="default value"
export A_NEW_KEY="With a new value too"
`);

    const mergedAst = mergeEnvAst(existingAst, exampleAst);
    const mergedEnv = stringifyEnvAst(mergedAst.merged);

    const expectedEnv = /* ini */ `export AWS_REGION=eu-west-1
# Fastify local default port
export PORT=3000
# New comment here
export OTEL_SERVICE_NAME=demo-service
# change 'none' to 'console' to see traces
export BACKEND_TO_BACKEND_ENABLED=true # added a comment here
export SERVICE_A_AUTH_SERVICE_NAME="updated_service_name"
export SERVICE_A_AUTH_KEY=realpassword123
export SALESFORCE_AUTH_URL="https://my.salesforce.com/"
export SERVICE_B_DOMAIN="service-b.example.com"
export SERVICE_B_AUTH_KEY="An actual key"
export SERVICE_B_AUTH_SERVICE_NAME=demo
export MANUALLY_ADDED_AT_THE_BOTTOM="local"
export A_NEW_KEY="With a new value too"
export PASSWORD_NOT_IN_EXAMPLE=passwordABC
export TOKEN_NOT_IN_EXAMPLE=token123
`;

    expect(mergedEnv).toBe(expectedEnv);
  });
});
