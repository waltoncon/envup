import { describe, it, expect, vi } from "vitest";
import tfvar from "./tfvar";
import { resolve } from "node:path";

const fsProm = () => ({
  readFile: async (path: string) => {
    if (String(path).includes("fixtures/sample.tfvars")) {
      return `nested = { key = "hello" }\nnumber = 123\n`;
    }
    throw new Error("Unexpected path: " + path);
  },
});

vi.mock("fs/promises", fsProm);
vi.mock("node:fs/promises", fsProm);

const sourcePath = resolve(__dirname, "dummy.ts"); // only directory is used

describe("tfvar()", () => {
  it("retrieves nested key value", async () => {
    const value = await tfvar(
      // @ts-ignore
      { path: "fixtures/sample.tfvars", key: "nested.key" },
      { sourcePath }
    );
    expect(value).toBe("hello");
  });

  it("retrieves top-level number", async () => {
    const value = await tfvar(
      // @ts-ignore
      { path: "fixtures/sample.tfvars", key: "number" },
      { sourcePath }
    );
    expect(value).toBe(123);
  });

  it("throws on missing path", async () => {
    // @ts-expect-error intentional
    await expect(tfvar({ key: "x" }, { sourcePath })).rejects.toThrow(
      /Missing path/
    );
  });

  it("throws on missing key", async () => {
    await expect(
      // @ts-expect-error intentional
      tfvar({ path: "fixtures/sample.tfvars" }, { sourcePath })
    ).rejects.toThrow(/Missing key/);
  });

  it("throws on missing sourcePath context", async () => {
    await expect(
      // @ts-expect-error intentional
      tfvar({ path: "fixtures/sample.tfvars", key: "nested.key" })
    ).rejects.toThrow(/sourcePath/);
  });
});
