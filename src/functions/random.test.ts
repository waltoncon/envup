import { describe, it, expect } from "bun:test";
import random from "./random";

describe("random()", () => {
  it("returns a non-empty string", () => {
    const v = random({});
    expect(typeof v).toBe("string");
    expect(v.length).toBeGreaterThan(0);
  });

  it("returns only lowercase base36 characters (a-z0-9)", () => {
    const v = random({});
    expect(/^[a-z0-9]+$/.test(v)).toBe(true);
    expect(v).toBe(v.toLowerCase());
  });

  it("length is within expected bounds (<= 13)", () => {
    // Implementation uses substring(2, 15) yielding at most length 13.
    const lengths = Array.from({ length: 50 }, () => random({}).length);
    lengths.forEach((len) => {
      expect(len).toBeGreaterThan(0);
      expect(len).toBeLessThanOrEqual(13);
    });
  });

  it("produces mostly unique values over many generations", () => {
    const count = 2000;
    const set = new Set<string>();
    for (let i = 0; i < count; i++) {
      set.add(random({}));
    }
    // Allowing a tiny collision probability; should realistically be zero here.
    expect(set.size).toBeGreaterThan(count * 0.995);
  });

  it("does not repeat consecutively (extremely unlikely)", () => {
    const a = random({});
    const b = random({});
    expect(a).not.toBe(b);
  });
});
