import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import aws from "./aws";
import { ZodError } from "zod";

const sendMock = vi.fn();
const ctorParams: any[] = [];
const commandParams: any[] = [];

vi.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: vi.fn().mockImplementation((params) => {
    ctorParams.push(params);
    return { send: sendMock };
  }),
  GetSecretValueCommand: vi.fn().mockImplementation((params) => {
    commandParams.push(params);
    return params;
  }),
}));

beforeEach(() => {
  sendMock.mockReset();
  ctorParams.length = 0;
  commandParams.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("aws()", () => {
  it("throws when missing secret name", async () => {
    await expect(() => aws({ region: "us-east-1" })).toThrow(ZodError);
  });

  it("returns secret string on success", async () => {
    sendMock.mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
      SecretString: "my-secret",
    });

    const out = await aws({
      value: "my/secret",
      region: "us-east-1",
      profile: "default",
    });

    expect(out).toBe("my-secret");
    expect(commandParams[0]).toEqual({
      SecretId: "my/secret",
      VersionStage: "AWSCURRENT",
    });
  });

  it("throws on non-200 status code", async () => {
    sendMock.mockResolvedValue({
      $metadata: { httpStatusCode: 500 },
      SecretString: "ignored",
    });

    await expect(
      aws({ value: "bad/secret", region: "us-east-1" })
    ).rejects.toThrow(
      "Failed to retrieve secret bad/secret from AWS Secrets Manager"
    );
  });

  it("passes custom versionStage", async () => {
    sendMock.mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
      SecretString: "ignored",
    });

    await aws({
      value: "versioned/secret",
      region: "us-west-2",
      versionStage: "AWSPREVIOUS",
    });

    expect(commandParams[0]).toEqual({
      SecretId: "versioned/secret",
      VersionStage: "AWSPREVIOUS",
    });
  });
});
