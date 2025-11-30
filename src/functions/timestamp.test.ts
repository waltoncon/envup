import { describe, it, expect } from "bun:test";
import timestamp from "./timestamp";

describe("timestamp()", () => {
  it("returns numeric string of current time", () => {
    const before = Date.now();
    const value = timestamp({});
    const after = Date.now();
    // @ts-ignore
    expect(/^\d+$/.test(value)).toBe(true);
    const num = Number(value);
    expect(num).toBeGreaterThanOrEqual(before);
    expect(num).toBeLessThanOrEqual(after);
  });

  it("produces increasing values over time", () => {
    const a = Number(timestamp({}));
    const b = Number(timestamp({}));
    expect(b).toBeGreaterThanOrEqual(a);
  });
});
