import { describe, expect, it } from "vitest";
import { maturityCategory, predictAdultHeight } from "../src/bayley-pinneau";

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
describe("predictAdultHeight - worked examples from the source", () => {
  it("boy, 13-year-old, SA 13-3, 60 inches -> 67.4 inches (Table IIB, average)", () => {
    const p = predictAdultHeight("male", 60, 159, 156);
    expect(p?.category).toBe("average");
    expect(p?.pmh).toBeCloseTo(89.0);
    expect(p?.predictedHeight).toBeCloseTo(67.4, 1);
  });

  it("boy, 13-year-old, SA 13-3, 51.5 inches -> 57.9 inches (division method)", () => {
    const p = predictAdultHeight("male", 51.5, 159, 156);
    expect(p?.predictedHeight).toBeCloseTo(57.9, 1);
  });

  it("boy, 14-year-old, SA 15-6, 67.5 inches -> 69.5 inches (Table IID, accelerated)", () => {
    const p = predictAdultHeight("male", 67.5, 186, 168);
    expect(p?.category).toBe("accelerated");
    expect(p?.predictedHeight).toBeCloseTo(69.5, 1);
  });

  it("girl, 12-year-old, SA 10-3, 55 inches -> 62.2 inches (Table IIIE, retarded)", () => {
    const p = predictAdultHeight("female", 55, 123, 144);
    expect(p?.category).toBe("retarded");
    expect(p?.pmh).toBeCloseTo(88.4);
    expect(p?.predictedHeight).toBeCloseTo(62.2, 1);
  });
});

describe("predictAdultHeight - range handling", () => {
  it("is undefined below 6 years skeletal age (below every table)", () => {
    expect(predictAdultHeight("male", 40, 60, 60)).toBeUndefined();
    expect(predictAdultHeight("female", 40, 60, 60)).toBeUndefined();
  });

  it("is undefined for retarded boys past 13-0 skeletal age (no Table IIF)", () => {
    // 14-0 skeletal age, chronological age 15-6 (18 months behind -> retarded).
    expect(predictAdultHeight("male", 60, 168, 186)).toBeUndefined();
    // But 13-0 itself, the last point in Table IIE, still works.
    const p = predictAdultHeight("male", 60, 156, 174);
    expect(p?.category).toBe("retarded");
    expect(p?.pmh).toBeCloseTo(88.0);
  });

  it("has no gap for retarded girls: 14-0 skeletal age still works (Table IIIF)", () => {
    // Same shape as the boys case above (18 months behind -> retarded), but
    // girls' Table IIIF has no gap, unlike the boys' missing Table IIF.
    const p = predictAdultHeight("female", 60, 168, 186);
    expect(p?.category).toBe("retarded");
    expect(p?.pmh).toBeCloseTo(98.3);
    expect(p?.predictedHeight).toBeCloseTo(61.0, 1);
  });

  it("is undefined for average/accelerated boys past their tables' maxima", () => {
    expect(predictAdultHeight("male", 70, 223, 223)).toBeUndefined(); // > 222, average
    expect(predictAdultHeight("male", 70, 205, 190)).toBeUndefined(); // > 204, accelerated
  });

  it("is undefined for average/accelerated/retarded girls past their tables' maxima", () => {
    expect(predictAdultHeight("female", 70, 217, 217)).toBeUndefined(); // > 216, average
    expect(predictAdultHeight("female", 70, 211, 195)).toBeUndefined(); // > 210, accelerated
    expect(predictAdultHeight("female", 70, 205, 220)).toBeUndefined(); // > 204, retarded
  });
});
