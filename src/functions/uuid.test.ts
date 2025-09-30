import { describe, it, expect } from "vitest";
import uuid from "./uuid";
import { ZodError } from "zod";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("uuid()", () => {
  ["1", "4", "6", "7"].forEach((ver) => {
    it(`generates version ${ver} UUID`, () => {
      const v = uuid({ value: ver });
      expect(uuidRegex.test(v)).toBe(true);
      expect(v).not.toBe(uuid({ value: ver })); // uniqueness heuristic
    });
  });

  it("defaults to v4", () => {
    const v = uuid({});
    expect(uuidRegex.test(v)).toBe(true);
  });

  it("throws on unsupported version", () => {
    expect(() => uuid({ value: "99" })).toThrow(ZodError);
  });
});
