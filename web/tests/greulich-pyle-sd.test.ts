import { describe, expect, it } from "vitest";
import { greulichPyleSd } from "../src/greulich-pyle-sd";

describe("greulichPyleSd", () => {
  it("returns the exact table value at a tabulated age", () => {
    expect(greulichPyleSd(12, "male")).toBeCloseTo(2.1);
    expect(greulichPyleSd(204, "male")).toBeCloseTo(15.4);
    expect(greulichPyleSd(12, "female")).toBeCloseTo(2.7);
    expect(greulichPyleSd(180, "female")).toBeCloseTo(11.2);
    expect(greulichPyleSd(132, "male")).toBeCloseTo(10.5);
  });

  it("linearly interpolates between adjacent table points", () => {
    // Boys 60mo -> 8.4, 66mo -> 9.1; halfway at 63mo.
    expect(greulichPyleSd(63, "male")).toBeCloseTo((8.4 + 9.1) / 2);
    // Girls 96mo -> 8.8, 108mo -> 9.3; a quarter of the way at 99mo.
    expect(greulichPyleSd(99, "female")).toBeCloseTo(8.8 + 0.25 * (9.3 - 8.8));
  });

  it("is undefined below the table (under 12 months)", () => {
    expect(greulichPyleSd(0, "male")).toBeUndefined();
    expect(greulichPyleSd(11.9, "female")).toBeUndefined();
  });

  it("is undefined above the table for each sex", () => {
    // Boys table reaches 204 months (17y); girls only to 180 months (15y),
    // with no continuation in the source.
    expect(greulichPyleSd(205, "male")).toBeUndefined();
    expect(greulichPyleSd(181, "female")).toBeUndefined();
    expect(greulichPyleSd(204, "female")).toBeUndefined();
  });
});
