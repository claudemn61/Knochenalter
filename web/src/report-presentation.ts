import type { ReportInput } from "./report";
import { greulichPyleSd } from "./greulich-pyle-sd";
import { predictAdultHeightBoys } from "./bayley-pinneau";

const CM_PER_INCH = 2.54;

export function fill(template: string, values: Record<string, string>): string {
  return String(template ?? "").replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match,
  );
}

export function formatNumber(
  value: number,
  locale: string,
  digits: number,
): string {
  if (!Number.isFinite(value)) return String(value);
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}

export function formatInteger(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : String(value);
}

export function formatIsoDate(iso: string, locale: string): string {
  const text = String(iso ?? "").trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (!match) return text;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  if (Number.isNaN(date.getTime())) return text;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return text;
  }
}

/** Descriptive axis only: its domain is not a clinical reference interval. */
export function scaleOf(values: number[], x = 0, width = 100) {
  const finite = values.filter(Number.isFinite);
  const low = finite.length ? Math.min(...finite) : 0;
  const high = finite.length ? Math.max(...finite) : 0;
  const pad = Math.max((high - low) * 0.75, 6);
  const min = Math.max(0, low - pad);
  const max = high + pad;
  const span = max - min || 1;
  return {
    min,
    max,
    at: (value: number) =>
      x + ((Math.min(Math.max(value, min), max) - min) / span) * width,
  };
}

/** One set of values, rounding rules and field order for the screen and PDF. */
export function presentReport(input: ReportInput) {
  const l = input.labels;
  const locale = input.locale || "en-US";
  const decimal = (value: number, digits: number) =>
    formatNumber(value, locale, digits);
  const monthsValue = (value: number, digits = 1) =>
    fill(l.monthsValueTemplate, { months: decimal(value, digits) });
  const chronological = Number.isFinite(input.chronologicalMonths)
    ? input.chronologicalMonths
    : undefined;
  const difference =
    chronological === undefined ? undefined : input.months - chronological;
  const foldValues = Array.isArray(input.folds) ? input.folds : [];
  const folds = foldValues.map((value, index) => ({
    label: fill(l.networkOutputLabelTemplate, { index: String(index + 1) }),
    value: monthsValue(value, 4),
    months: value,
  }));
  // Sample standard deviation (n-1) of the ensemble's individual fold
  // predictions around their mean (input.months). This is the spread between
  // the three networks, not a clinical confidence interval for one patient
  // (see result.stddevNote / report.disclaimer).
  const stdDevMonths =
    foldValues.length > 1
      ? Math.sqrt(
          foldValues.reduce((sum, v) => sum + (v - input.months) ** 2, 0) /
            (foldValues.length - 1),
        )
      : undefined;
  const stdDevValue =
    stdDevMonths === undefined
      ? l.notComputedValue
      : fill(l.stdDevValueTemplate, { months: decimal(stdDevMonths, 2) });
  const yearsMonthsValue = (months: number) => {
    const rounded = Math.round(months);
    const years = Math.floor(rounded / 12);
    const remMonths = rounded % 12;
    return fill(l.befundAgeValueTemplate, {
      years: formatInteger(years),
      months: formatInteger(remMonths),
    });
  };
  // Standard-Befund: classifies the estimate against chronological age ± 2 SD,
  // using the population standard deviation of skeletal age from Greulich &
  // Pyle (1959), Table V (boys) / Table VI (girls) - not the ensemble spread
  // above, which measures network disagreement, not population variability.
  // Only shown with a chronological age (date of birth) inside the table's
  // range for the given sex (12 months to 17 years for boys, to 15 years for
  // girls; the source table has no data beyond that for girls).
  const gpSdMonths =
    chronological === undefined
      ? undefined
      : greulichPyleSd(chronological, input.sex);
  const befund =
    chronological === undefined
      ? undefined
      : gpSdMonths === undefined
        ? {
            outOfRange: true as const,
            heading: l.befundHeading,
            message: l.befundOutOfRange,
          }
        : (() => {
            const threshold = 2 * gpSdMonths;
            const conclusionClause =
              difference! < -threshold
                ? l.befundRetardation
                : difference! > threshold
                  ? l.befundAcceleration
                  : l.befundNormal;
            return {
              outOfRange: false as const,
              heading: l.befundHeading,
              boneAgeLabel: l.befundBoneAgeLabel,
              boneAgeValue: yearsMonthsValue(input.months),
              chronoLabel: l.befundChronoLabel,
              chronoValue: yearsMonthsValue(chronological),
              stdDevLabel: l.befundStdDevLabel,
              stdDevValue: monthsValue(gpSdMonths, 1),
              upperLabel: l.befundUpperLabel,
              upperValue: yearsMonthsValue(chronological + threshold),
              lowerLabel: l.befundLowerLabel,
              lowerValue: yearsMonthsValue(
                Math.max(0, chronological - threshold),
              ),
              conclusion: `${l.befundIntro} ${conclusionClause}`,
              citation: l.befundCitation,
            };
          })();
  // Bayley-Pinneau adult height prediction: only offered for boys with a
  // current height entered and a chronological age available (girls'
  // tables are not transcribed yet - see src/bayley-pinneau.ts).
  const heightPrediction =
    chronological === undefined || input.heightCm === undefined
      ? undefined
      : input.sex === "female"
        ? {
            state: "unsupported" as const,
            heading: l.heightHeading,
            message: l.heightFemaleUnsupported,
          }
        : (() => {
            const heightInches = input.heightCm! / CM_PER_INCH;
            const prediction = predictAdultHeightBoys(
              heightInches,
              input.months,
              chronological,
            );
            if (!prediction)
              return {
                state: "outOfRange" as const,
                heading: l.heightHeading,
                message: l.heightOutOfRange,
              };
            const categoryValue =
              prediction.category === "average"
                ? l.heightCategoryAverage
                : prediction.category === "accelerated"
                  ? l.heightCategoryAccelerated
                  : l.heightCategoryRetarded;
            return {
              state: "ok" as const,
              heading: l.heightHeading,
              currentLabel: l.heightCurrentLabel,
              currentValue: fill(l.heightCmValueTemplate, {
                cm: decimal(input.heightCm!, 1),
              }),
              categoryLabel: l.heightCategoryLabel,
              categoryValue,
              pmhLabel: l.heightPmhLabel,
              pmhValue: fill(l.heightPercentValueTemplate, {
                percent: decimal(prediction.pmh, 1),
              }),
              predictedLabel: l.heightPredictedLabel,
              predictedValue: fill(l.heightCmValueTemplate, {
                cm: decimal(prediction.predictedHeight * CM_PER_INCH, 1),
              }),
              citation: l.heightCitation,
            };
          })();
  const examFields = [
    { label: l.sexLabel, value: l.sexValue },
    {
      label: l.dateOfBirthLabel,
      value: input.dateOfBirth
        ? formatIsoDate(input.dateOfBirth, locale)
        : l.notInformedValue,
    },
    {
      label: l.examinationDateLabel,
      value: formatIsoDate(input.examinationDate, locale),
    },
    { label: l.sourceFileLabel, value: input.fileName },
    {
      label: l.analysedImageSizeLabel,
      value:
        input.image.width > 0 && input.image.height > 0
          ? fill(l.imageSizeValueTemplate, {
              width: formatInteger(input.image.width),
              height: formatInteger(input.image.height),
            })
          : l.notInformedValue,
    },
  ];
  const technicalFields = [
    {
      label: l.runtimeLabel,
      value: fill(l.secondsValueTemplate, {
        seconds: decimal(input.seconds, 1),
      }),
    },
    ...(stdDevMonths === undefined
      ? []
      : [{ label: l.stdDevLabel, value: stdDevValue }]),
    { label: l.modelLabel, value: input.modelId },
    { label: l.modelRevisionLabel, value: input.modelRevision },
    { label: l.executionEnvironmentLabel, value: l.executionEnvironmentValue },
    {
      label: l.cropLabel,
      value: fill(l.cropValueTemplate, {
        x0: formatInteger(input.crop.x0),
        y0: formatInteger(input.crop.y0),
        x1: formatInteger(input.crop.x1),
        y1: formatInteger(input.crop.y1),
      }),
    },
  ];
  const professional = input.professional;
  const comparisonLabels = l.professionalComparison;
  const professionalDifference = professional ? input.months - professional.months : undefined;
  const comparison = professional && comparisonLabels ? {
    fields: [
      { label: comparisonLabels.ageLabel, value: monthsValue(professional.months) },
      { label: comparisonLabels.differenceLabel, value: fill(l.differenceValueTemplate, {
        sign: professionalDifference! < 0 ? "-" : "+", months: decimal(Math.abs(professionalDifference!), 1),
      }) },
      { label: comparisonLabels.sourceLabel, value: professional.source },
      { label: comparisonLabels.methodLabel, value: professional.method },
      { label: comparisonLabels.dateLabel, value: formatIsoDate(professional.date, locale) },
    ],
  } : undefined;
  return {
    professional: comparison,
    chronological,
    difference,
    monthsValue,
    estimatedValue: monthsValue(input.months),
    chronologicalValue:
      chronological === undefined
        ? l.notInformedValue
        : monthsValue(chronological),
    differenceValue:
      difference === undefined
        ? l.notComputedValue
        : fill(l.differenceValueTemplate, {
            sign: difference < 0 ? "-" : "+",
            months: decimal(Math.abs(difference), 1),
          }),
    meanValue: monthsValue(input.months, 4),
    stdDevMonths,
    stdDevValue,
    befund,
    heightPrediction,
    examFields,
    technicalFields,
    folds,
    references: [
      l.referenceModelLine,
      l.referenceArchitectureLine,
      l.referenceDatasetLine,
      l.referenceLicenseLine,
      l.referenceApplicationLine,
    ],
  };
}
