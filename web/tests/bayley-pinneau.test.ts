import { describe, expect, it } from "vitest";
import {
  maturityCategory,
  predictAdultHeightBoys,
} from "../src/bayley-pinneau";

describe("maturityCategory", () => {
  it("is average within a year of chronological age either way", () => {
    expect(maturityCategory(150, 150)).toBe("average");
    expect(maturityCategory(150, 139)).toBe("average"); // +11 months
    expect(maturityCategory(150, 161)).toBe("average"); // -11 months
  });
  it("is accelerated a year or more ahead of chronological age", () => {
    expect(maturityCategory(150, 138)).toBe("accelerated"); // +12 months
  });
  it("is retarded a year or more behind chronological age", () => {
    expect(maturityCategory(150, 162)).toBe("retarded"); // -12 months
  });
});

// The book's own worked examples (p. 234-235), reproduced exactly.
describe("predictAdultHeightBoys - worked examples from the source", () => {
  it("13-year-old, SA 13-3, 60 inches -> 67.4 inches (Table IIB, average)", () => {
    const p = predictAdultHeightBoys(60, 159, 156);
    expect(p?.category).toBe("average");
    expect(p?.pmh).toBeCloseTo(89.0);
    expect(p?.predictedHeight).toBeCloseTo(67.4, 1);
  });

  it("13-year-old, SA 13-3, 51.5 inches -> 57.9 inches (division method)", () => {
    const p = predictAdultHeightBoys(51.5, 159, 156);
    expect(p?.predictedHeight).toBeCloseTo(57.9, 1);
  });

  it("14-year-old, SA 15-6, 67.5 inches -> 69.5 inches (Table IID, accelerated)", () => {
    const p = predictAdultHeightBoys(67.5, 186, 168);
    expect(p?.category).toBe("accelerated");
    expect(p?.predictedHeight).toBeCloseTo(69.5, 1);
  });
});

describe("predictAdultHeightBoys - range handling", () => {
  it("is undefined below 6 years skeletal age (below every table)", () => {
    expect(predictAdultHeightBoys(40, 60, 60)).toBeUndefined();
  });

  it("is undefined for retarded boys past 13-0 skeletal age (no Table IIF)", () => {
    // 14-0 skeletal age, chronological age 15-6 (18 months behind -> retarded).
    expect(predictAdultHeightBoys(60, 168, 186)).toBeUndefined();
    // But 13-0 itself, the last point in Table IIE, still works.
    const p = predictAdultHeightBoys(60, 156, 174);
    expect(p?.category).toBe("retarded");
    expect(p?.pmh).toBeCloseTo(88.0);
  });

  it("is undefined for average/accelerated boys past their tables' maxima", () => {
    expect(predictAdultHeightBoys(70, 223, 223)).toBeUndefined(); // > 222, average
    expect(predictAdultHeightBoys(70, 205, 190)).toBeUndefined(); // > 204, accelerated
  });
});
