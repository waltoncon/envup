import hash from "./hash";
import { describe, test, expect } from "vitest";

describe("hash()", () => {
  test("hashes using default sha256 + hex", () => {
    const result = hash({ value: "hello" });
    expect(result).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  test("hashes using md5 + hex", () => {
    const result = hash({ value: "hello", algo: "md5", encoding: "hex" });
    expect(result).toBe("5d41402abc4b2a76b9719d911017c592");
  });

  test("hashes using sha256 + base64", () => {
    const result = hash({ value: "hello", encoding: "base64" });
    expect(result).toBe("LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=");
  });

  test("hashes using sha256 + base64url", () => {
    const result = hash({ value: "hello", encoding: "base64url" });
    expect(result).toBe("LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ");
  });

  test("throws when value missing", () => {
    // @ts-expect-error intentional missing value
    expect(() => hash({})).toThrow("Missing value for hash function");
  });

  test("throws on unsupported algorithm", () => {
    expect(() => hash({ value: "hello", algo: "notreal" })).toThrow(
      "Unsupported hash algorithm: notreal"
    );
  });

  test("throws on unsupported encoding", () => {
    expect(() => hash({ value: "hello", encoding: "utf8" })).toThrow(
      "Unsupported encoding: utf8"
    );
  });
});
