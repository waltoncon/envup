import { describe, it, expect, mock } from "bun:test";

const execa = mock().mockReturnValue({ stdout: "mocked secret value" });
mock.module("execa", () => ({ execa }));

describe("op", async () => {
  const { default: op } = await import("./op");

  it("calls execa with the correct command", async () => {
    await op({ value: "vault/item" });
    expect(execa).toHaveBeenCalled();

    expect(execa).toHaveBeenCalledWith(
      ["", " read ", ""],
      expect.stringMatching(/op|op\.exe/),
      "op://vault/item"
    );
  });

  it("returns mocked stdout", async () => {
    const result = await op({ value: "vault/item" });
    expect(result).toBe("mocked secret value");
  });
});
