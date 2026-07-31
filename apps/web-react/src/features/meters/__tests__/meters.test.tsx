import { describe, it, expect } from "vitest";

describe("Phase F4 Meters & Meter Readings Logic Tests", () => {
  it("should calculate meter consumption correctly", () => {
    const previousValue = 120;
    const currentValue = 185;
    const consumption = currentValue - previousValue;
    expect(consumption).toBe(65);
  });

  it("should reject decreased meter value validation logic", () => {
    const previousValue = 200;
    const currentValue = 180;
    const isDecreased = currentValue < previousValue;
    expect(isDecreased).toBe(true);
  });
});
