import { describe, expect, it } from "vitest";
import {
  nearestReferenceRow,
  parseReferenceCsv,
  stepReferenceRow,
} from "../src/rsna-reference";

describe("parseReferenceCsv", () => {
  it("parses the RSNA training-CSV column names (id, boneage, male)", () => {
    const csv = "id,boneage,male\n1001,84,True\n1002,96,False\n";
    expect(parseReferenceCsv(csv)).toEqual([
      { id: "1001", months: 84, sex: "male" },
      { id: "1002", months: 96, sex: "female" },
    ]);
  });

  it("parses alternate column names (Image ID, Bone Age (months), Sex)", () => {
    const csv = "Image ID,Bone Age (months),Sex\n55,120,M\n56,60,F\n";
    expect(parseReferenceCsv(csv)).toEqual([
      { id: "55", months: 120, sex: "male" },
      { id: "56", months: 60, sex: "female" },
    ]);
  });

  it("skips rows with a non-numeric age or missing id", () => {
    const csv = "id,boneage,male\n1001,84,True\n,90,True\n1003,n/a,True\n";
    expect(parseReferenceCsv(csv)).toEqual([{ id: "1001", months: 84, sex: "male" }]);
  });

  it("throws a clear error when id/age columns can't be found", () => {
    expect(() => parseReferenceCsv("foo,bar\n1,2\n")).toThrow(/Spalten nicht erkannt/);
  });

  it("returns an empty list for an empty or header-only CSV", () => {
    expect(parseReferenceCsv("")).toEqual([]);
    expect(parseReferenceCsv("id,boneage,male\n")).toEqual([]);
  });
});

describe("nearestReferenceRow", () => {
  const rows = [
    { id: "a", months: 84, sex: "male" as const },
    { id: "b", months: 96, sex: "male" as const },
    { id: "c", months: 90, sex: "female" as const },
  ];

  it("finds the closest row restricted to the given sex", () => {
    expect(nearestReferenceRow(rows, 99, "male")).toEqual({
      id: "b",
      months: 96,
      sex: "male",
    });
  });

  it("never returns a row of the other sex, even if numerically closer", () => {
    // 90 is an exact match for the female row, but only male is requested.
    expect(nearestReferenceRow(rows, 90, "male")?.id).not.toBe("c");
  });

  it("returns undefined when no row matches the requested sex", () => {
    expect(nearestReferenceRow(rows, 50, "female")).toEqual({
      id: "c",
      months: 90,
      sex: "female",
    });
    expect(nearestReferenceRow([rows[0]], 50, "female")).toBeUndefined();
  });
});

describe("stepReferenceRow", () => {
  const rows = [
    { id: "a", months: 72, sex: "male" as const },
    { id: "b", months: 84, sex: "male" as const },
    { id: "c", months: 96, sex: "male" as const },
    { id: "d", months: 90, sex: "male" as const }, // no local image file
    { id: "e", months: 60, sex: "female" as const },
  ];
  const available = (id: string) => id !== "d";

  it("steps to the next-older available row", () => {
    expect(stepReferenceRow(rows, "male", 84, 1, available)).toEqual({
      id: "c",
      months: 96,
      sex: "male",
    });
  });

  it("steps to the next-younger available row", () => {
    expect(stepReferenceRow(rows, "male", 84, -1, available)).toEqual({
      id: "a",
      months: 72,
      sex: "male",
    });
  });

  it("skips rows whose image isn't locally available", () => {
    // 90 (row d) is closer to 84 than 96, but has no local image.
    expect(stepReferenceRow(rows, "male", 84, 1, available)?.id).not.toBe("d");
  });

  it("never returns a row of the other sex", () => {
    expect(stepReferenceRow(rows, "male", 70, -1, available)).toBeUndefined();
  });

  it("returns undefined past either end of the range", () => {
    expect(stepReferenceRow(rows, "male", 96, 1, available)).toBeUndefined();
    expect(stepReferenceRow(rows, "male", 72, -1, available)).toBeUndefined();
  });
});
