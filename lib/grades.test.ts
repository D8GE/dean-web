import { describe, expect, it } from "vitest";
import { pointsFromPercent, scorePercent } from "./grades";

describe("score helpers", () => {
  it("rounds a pace onto the assignment's points", () => {
    expect(pointsFromPercent(86, 100)).toBe(86);
    expect(pointsFromPercent(90, 20)).toBe(18);
    expect(pointsFromPercent(150, 10)).toBe(10);
    expect(pointsFromPercent(40, 0)).toBe(0);
  });

  it("does not divide by zero points", () => {
    expect(scorePercent(8, 10)).toBe(80);
    expect(scorePercent(null, 10)).toBeNull();
    expect(scorePercent(0, 0)).toBeNull();
  });
});
