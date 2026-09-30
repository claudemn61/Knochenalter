import { describe, expect, it } from "vitest";
import {
  BOYS_STANDARD_AGES_MONTHS,
  GIRLS_STANDARD_AGES_MONTHS,
  nearestStandardAge,
} from "../src/greulich-pyle-standard-ages";

describe("nearestStandardAge", () => {
  it("returns an exact plate age unchanged, for both sexes", () => {
    for (const age of BOYS_STANDARD_AGES_MONTHS)
      expect(nearestStandardAge(age, "male")).toBe(age);
    for (const age of GIRLS_STANDARD_AGES_MONTHS)
      expect(nearestStandardAge(age, "female")).toBe(age);
  });

  it("snaps to the nearer whole-year plate in the boys' 5-11y band (60-132mo, 12mo apart)", () => {
    // 8y3m (99mo), the model estimate from the reported case: closer to
    // 96 (8y, diff 3) than 108 (9y, diff 9).
    expect(nearestStandardAge(99, "male")).toBe(96);
    expect(nearestStandardAge(100, "male")).toBe(96);
    expect(nearestStandardAge(103, "male")).toBe(108);
  });

  it("rounds an exact tie down to the lower plate age", () => {
    // Midway between 96 (8y) and 108 (9y).
    expect(nearestStandardAge(102, "male")).toBe(96);
  });

  it("snaps correctly across the girls' irregular school-age gaps", () => {
    // Confirmed gap: 8y10m (106mo) straight to 10y (120mo), 14 months apart.
    expect(nearestStandardAge(110, "female")).toBe(106);
    expect(nearestStandardAge(115, "female")).toBe(120);
  });
});
