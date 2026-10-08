import { describe, expect, it } from "vitest";
import { nearestReferenceRow, parseReferenceCsv } from "../src/rsna-reference";

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
