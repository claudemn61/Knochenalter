import { describe, expect, it } from "vitest";
import {
  presentReport,
  type ReportInput,
  type ReportLabels,
} from "../src/report-presentation";

/* --------------------------------------------------------------- fixtures */

const labels: ReportLabels = {
  notInformedValue: "Não informada",
  notComputedValue: "Não calculada",
  monthsValueTemplate: "{months} meses",

  befundHeading: "Laudo padrão",
  befundBoneAgeLabel: "Idade óssea biológica:",
  befundChronoLabel: "Idade cronológica:",
  befundStdDevLabel: "Desvio padrão:",
  befundRangeLabel: "Faixa normal (±2 DP):",
  befundAgeValueTemplate: "{years} anos {months} meses",
  befundRangeValueTemplate: "{low} – {high}",
  befundIntro: "Trata-se, portanto, de uma idade óssea",
  befundRetardation: "com mais de 2 desvios-padrão abaixo da idade cronológica, compatível com retardo.",
  befundAcceleration: "com mais de 2 desvios-padrão acima da idade cronológica, compatível com aceleração.",
  befundNormal: "dentro de 2 desvios-padrão da idade cronológica, compatível com achado normal.",
  befundOutOfRange: "Fora da faixa etária da tabela de referência.",
  befundCitation: "Greulich & Pyle, 1959, Tabelas V/VI.",

  heightHeading: "Previsão de estatura adulta (Bayley-Pinneau)",
  heightCurrentLabel: "Estatura atual:",
  heightCategoryLabel: "Tipo de maturação:",
  heightCategoryAverage: "maturação média",
  heightCategoryAccelerated: "maturação acelerada",
  heightCategoryRetarded: "maturação retardada",
  heightPmhLabel: "Percentual da estatura adulta atingido:",
  heightPredictedLabel: "Estatura adulta prevista:",
  heightCmValueTemplate: "{cm} cm",
  heightPercentValueTemplate: "{percent} %",
  heightOutOfRange: "Fora da faixa etária da tabela de referência.",
  heightCitation: "Bayley & Pinneau, 1952, Tabelas IIA–IIE / IIIA–IIIF.",

  targetHeading: "Estatura-alvo genética (mid-parental height)",
  targetLabel: "Estatura-alvo:",
  targetValueTemplate: "{target} cm ({low}–{high} cm)",
  targetCitation: "Tanner, Goldstein & Whitehouse, 1970.",
};

function input(overrides: Partial<ReportInput> = {}): ReportInput {
  return {
    months: 134.2481,
    sex: "female",
    chronologicalMonths: 133.6,
    locale: "pt-BR",
    labels,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ tests */

describe("headline presentation", () => {
  it("shows the same Jahre/Monate ages and standard deviation as the Befund fields, when in range", () => {
    // Same fixture as the Befund retardation test below: boys, months=107
    // (bone age), chronologicalMonths=132.
    const p = presentReport(
      input({ sex: "male", months: 107, chronologicalMonths: 132 }),
    );
    const b = p.befund;
    if (!b || b.outOfRange) throw new Error("expected an in-range Befund");
    expect(p.estimatedAgeValue).toBe(b.boneAgeValue);
    expect(p.estimatedAgeValue).toBe("8 anos 11 meses");
    expect(p.chronologicalAgeValue).toBe(b.chronoValue);
    expect(p.chronologicalAgeValue).toBe("11 anos 0 meses");
    expect(p.stdDevValue).toBe(b.stdDevValue);
    expect(p.stdDevValue).toBe("10,5 meses");
  });

  it("still computes the bone age headline without a chronological age, but falls back for the rest", () => {
    const p = presentReport(input({ chronologicalMonths: undefined }));
    expect(p.estimatedAgeValue).toBe("11 anos 2 meses");
    expect(p.chronologicalAgeValue).toBe("Não informada");
    expect(p.stdDevValue).toBe("Não calculada");
    expect(p.befund).toBeUndefined();
  });

  it("falls back the standard deviation, but keeps both ages, when the Befund is out of range", () => {
    // Girls table ends at 180 months (15y) - see tests/greulich-pyle-sd.test.ts.
    const p = presentReport(
      input({ sex: "female", chronologicalMonths: 181 }),
    );
    expect(p.befund).toEqual({
      outOfRange: true,
      heading: labels.befundHeading,
      message: labels.befundOutOfRange,
    });
    expect(p.stdDevValue).toBe("Não calculada");
    expect(p.estimatedAgeValue).toBe("11 anos 2 meses");
    expect(p.chronologicalAgeValue).toBe("15 anos 1 meses");
  });

  it("formats the standard deviation for the requested locale", () => {
    const fixture = { sex: "male" as const, months: 107, chronologicalMonths: 132 };
    expect(presentReport(input(fixture)).stdDevValue).toBe("10,5 meses");
    expect(
      presentReport(input({ ...fixture, locale: "en-US" })).stdDevValue,
    ).toBe("10.5 meses");
  });
});

// Reference points transcribed from Greulich & Pyle (1959), Table V (boys)
// / Table VI (girls) - see src/greulich-pyle-sd.ts. Chosen at exact table
// ages to keep the expected numbers unambiguous (interpolation itself is
// covered by tests/greulich-pyle-sd.test.ts).
describe("Standard-Befund (Greulich-Pyle)", () => {
  it("classifies more than 2 SD below chronological age as retardation", () => {
    // Boys, 132 months (11y): table SD 10.5 -> threshold 21 months.
    const p = presentReport(
      input({ sex: "male", months: 107, chronologicalMonths: 132 }),
    );
    expect(p.befund).toEqual({
      outOfRange: false,
      heading: labels.befundHeading,
      boneAgeLabel: labels.befundBoneAgeLabel,
      boneAgeValue: "8 anos 11 meses",
      chronoLabel: labels.befundChronoLabel,
      chronoValue: "11 anos 0 meses",
      stdDevLabel: labels.befundStdDevLabel,
      stdDevValue: "10,5 meses",
      rangeLabel: labels.befundRangeLabel,
      rangeValue: "9 anos 3 meses – 12 anos 9 meses",
      conclusion: `${labels.befundIntro} ${labels.befundRetardation}`,
      citation: labels.befundCitation,
    });
  });

  it("classifies more than 2 SD above chronological age as acceleration", () => {
    // Girls, 96 months (8y): table SD 8.8 -> threshold 17.6 months.
    const p = presentReport(
      input({ sex: "female", months: 116, chronologicalMonths: 96 }),
    );
    const b = p.befund;
    if (!b || b.outOfRange) throw new Error("expected an in-range Befund");
    expect(b.conclusion).toBe(
      `${labels.befundIntro} ${labels.befundAcceleration}`,
    );
    expect(b.stdDevValue).toBe("8,8 meses");
    expect(b.rangeValue).toBe("6 anos 6 meses – 9 anos 6 meses");
  });

  it("classifies within 2 SD of chronological age as normal, boundary inclusive", () => {
    // Boys, 60 months (5y): table SD 8.4 -> threshold 16.8 months.
    const inside = presentReport(
      input({ sex: "male", months: 65, chronologicalMonths: 60 }),
    ).befund;
    if (!inside || inside.outOfRange)
      throw new Error("expected an in-range Befund");
    expect(inside.conclusion).toBe(
      `${labels.befundIntro} ${labels.befundNormal}`,
    );
    // Exactly at the -2 SD boundary: "within" is boundary-inclusive, not
    // "more than".
    const boundary = presentReport(
      input({ sex: "male", months: 43.2, chronologicalMonths: 60 }),
    ).befund;
    if (!boundary || boundary.outOfRange)
      throw new Error("expected an in-range Befund");
    expect(boundary.conclusion).toBe(
      `${labels.befundIntro} ${labels.befundNormal}`,
    );
  });

  it("is out of range below 12 months and above the table for the sex", () => {
    // Boys table reaches 204 months (17y); girls only to 180 months (15y),
    // with no continuation in the source (confirmed against the printed book).
    for (const overrides of [
      { sex: "male" as const, chronologicalMonths: 6 },
      { sex: "male" as const, chronologicalMonths: 205 },
      { sex: "female" as const, chronologicalMonths: 181 },
    ]) {
      const p = presentReport(input(overrides));
      expect(p.befund).toEqual({
        outOfRange: true,
        heading: labels.befundHeading,
        message: labels.befundOutOfRange,
      });
    }
  });

  it("is undefined without a chronological age", () => {
    expect(
      presentReport(input({ chronologicalMonths: undefined })).befund,
    ).toBeUndefined();
  });
});

describe("Endgrössen-Prognose (Bayley-Pinneau)", () => {
  it("converts cm to inches, predicts, and converts back (book example: 13y, SA 13-3, 60in)", () => {
    const p = presentReport(
      input({
        sex: "male",
        months: 159, // skeletal age 13-3
        chronologicalMonths: 156, // 13-0
        heightCm: 60 * 2.54, // 152.4 cm
      }),
    );
    const h = p.heightPrediction;
    if (!h || h.state !== "ok") throw new Error("expected an ok prediction");
    expect(h.currentValue).toBe("152,4 cm");
    expect(h.categoryValue).toBe(labels.heightCategoryAverage);
    expect(h.pmhValue).toBe("89,0 %");
    // 60/0.89 = 67.4157... inches = 171.236 cm -> 171.2
    expect(h.predictedValue).toBe("171,2 cm");
  });

  it("reports out of range for retarded boys past 13 years skeletal age", () => {
    const h = presentReport(
      input({
        sex: "male",
        months: 168, // 14-0
        chronologicalMonths: 186, // 15-6, 18 months ahead -> retarded
        heightCm: 150,
      }),
    ).heightPrediction;
    expect(h).toEqual({
      state: "outOfRange",
      heading: labels.heightHeading,
      message: labels.heightOutOfRange,
    });
  });

  it("reports an ok prediction for girls too (Table IIIA, average)", () => {
    const h = presentReport(
      input({
        sex: "female",
        months: 120, // skeletal age 10-0
        chronologicalMonths: 120, // 10-0, same -> average
        heightCm: 150,
      }),
    ).heightPrediction;
    if (!h || h.state !== "ok") throw new Error("expected an ok prediction");
    expect(h.categoryValue).toBe(labels.heightCategoryAverage);
    expect(h.pmhValue).toBe("86,2 %");
    // 150 / 0.862 = 174.0139... -> 174.0
    expect(h.predictedValue).toBe("174,0 cm");
  });

  it("is undefined without a height or without a chronological age", () => {
    expect(presentReport(input({ sex: "male" })).heightPrediction).toBeUndefined();
    expect(
      presentReport(
        input({ sex: "male", heightCm: 150, chronologicalMonths: undefined }),
      ).heightPrediction,
    ).toBeUndefined();
  });
});

describe("genetische Zielgrösse (Mid-Parental Height)", () => {
  it("adds 13cm and halves for boys", () => {
    const t = presentReport(
      input({ sex: "male", heightFatherCm: 180, heightMotherCm: 165 }),
    ).targetHeight;
    // (180 + 165 + 13) / 2 = 179
    expect(t).toEqual({
      heading: labels.targetHeading,
      label: labels.targetLabel,
      value: "179,0 cm (170,5–187,5 cm)",
      citation: labels.targetCitation,
    });
  });

  it("subtracts 13cm and halves for girls", () => {
    const t = presentReport(
      input({ sex: "female", heightFatherCm: 180, heightMotherCm: 165 }),
    ).targetHeight;
    // (180 + 165 - 13) / 2 = 166
    expect(t?.value).toBe("166,0 cm (157,5–174,5 cm)");
  });

  it("needs both parents' heights, but neither bone age nor chronological age", () => {
    expect(
      presentReport(input({ sex: "male", heightFatherCm: 180 })).targetHeight,
    ).toBeUndefined();
    expect(
      presentReport(
        input({
          sex: "male",
          heightFatherCm: 180,
          heightMotherCm: 165,
          chronologicalMonths: undefined,
        }),
      ).targetHeight,
    ).toBeDefined();
  });
});
