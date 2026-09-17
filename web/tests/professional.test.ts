import { describe, expect, it } from "vitest";
import { readProfessionalAssessment } from "../src/professional";

const valid = { years: "2", months: "10", method: "Greulich–Pyle", source: "Beispieldienst",
  date: "2026-05-20", sameExam: true };
const read = (overrides = {}) => readProfessionalAssessment({ ...valid, ...overrides }, "2026-05-16", "2026-09-06");

describe("user-transcribed professional assessment", () => {
  it("converts whole years and additional months and trims provenance", () => {
    expect(read({ source: "  Beispieldienst  " })).toEqual({
      months: 34, method: "Greulich–Pyle", source: "Beispieldienst", date: "2026-05-20",
    });
    expect(read({ years: "0", months: "0" }).months).toBe(0);
    expect(read({ years: "20", months: "0" }).months).toBe(240);
  });
  it.each([
    { years: "" }, { months: "" }, { years: "NaN" }, { years: "Infinity" },
    { years: "-1" }, { years: "2.5" }, { months: "12" }, { months: "-1" },
    { months: "1.5" }, { years: "20", months: "1" }, { sameExam: false },
    { source: "   " }, { method: "" }, { source: "x".repeat(121) }, { method: "x".repeat(81) },
    { date: "2026-02-30" }, { date: "2026-05-15" }, { date: "2026-09-07" }, { date: "" },
  ])("rejects incomplete or inconsistent transcription %j", (override) => {
    expect(() => read(override)).toThrow();
  });
  it("translates validation messages", () => {
    expect(() => read({ sameExam: false })).toThrow("dasselbe Röntgenbild");
  });
});
