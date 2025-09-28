import { defineFunction } from "@/utils";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export default defineFunction(async function aws({
  value,
  region,
  profile,
  versionStage = "AWSCURRENT",
}: {
  value: string;
  region?: string;
  profile?: string;
  versionStage?: string;
}) {
  const client = new SecretsManagerClient({ region, profile });

  if (!value) {
    throw new Error("Missing secret name in AWS Secrets Manager URL");
  }

  const result = await client.send(
    new GetSecretValueCommand({ SecretId: value, VersionStage: versionStage })
  );

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error(
      `Failed to retrieve secret ${value} from AWS Secrets Manager`
    );
  }

  return result.SecretString;
});
