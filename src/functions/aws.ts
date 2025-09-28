import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export default async function aws(url: URL) {
  const client = new SecretsManagerClient({
    region: url.searchParams.get("region") || undefined,
    profile: url.searchParams.get("profile") || undefined,
  });

  const value = url.pathname.slice(1);

  if (!value) {
    throw new Error("Missing secret name in AWS Secrets Manager URL");
  }

  const result = await client.send(
    new GetSecretValueCommand({
      SecretId: value,
      VersionStage: url.searchParams.get("version-stage") || "AWSCURRENT",
    })
  );

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error(
      `Failed to retrieve secret ${value} from AWS Secrets Manager`
    );
  }

  return result.SecretString;
}
