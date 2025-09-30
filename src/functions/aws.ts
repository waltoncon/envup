import { createFunction } from "@/utils";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export default createFunction({
  schema: (z) => ({
    value: z.string().describe("The name of the secret in AWS Secrets Manager"),
    region: z.string().optional().describe("The AWS region"),
    profile: z.string().optional().describe("The AWS CLI profile to use"),
    versionStage: z
      .string()
      .optional()
      .default("AWSCURRENT")
      .describe("The version stage of the secret to retrieve"),
  }),
  handler: async (args) => {
    const { value, region, profile, versionStage } = args;

    const client = new SecretsManagerClient({ region, profile });
    const result = await client.send(
      new GetSecretValueCommand({
        SecretId: value,
        VersionStage: versionStage,
      })
    );

    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Failed to retrieve secret ${value} from AWS Secrets Manager`
      );
    }

    return result.SecretString;
  },
});
