import { describe, it, expect } from "bun:test";
import random from "./random";
import { length } from "zod";

describe("random()", () => {
  it("returns a non-empty string", () => {
    const v = random({});
    expect(typeof v).toBe("string");
    expect(v.length).toBeGreaterThan(0);
  });

  it("default length is 15", () => {
    const lengths = Array.from({ length: 50 }, () => random({}).length);
    lengths.forEach((len) => {
      expect(len).toBe(15);
    });
  });

  it("produces mostly unique values over many generations", () => {
    const count = 2000;
    const set = new Set<string>();
    for (let i = 0; i < count; i++) {
      set.add(random({}));
    }
    expect(set.size).toBe(count);
  });

  it("does not repeat consecutively (extremely unlikely)", () => {
    const a = random({});
    const b = random({});
    expect(a).not.toBe(b);
  });

  it("generates a random string of the specified length", () => {
    const length = 10;
    const result = random({ length: 10 });
    expect(result).toHaveLength(length);
    expect(/^[A-Za-z0-9]+$/.test(result)).toBe(true);
  });

  it("handles edge case of length 0", () => {
    const result = random({ length: 0 });
    expect(result).toBe("");
  });

  it("throw on non-numeric values", () => {
    expect(() => random({ length: "a1bc" })).toThrow();
  });
});
