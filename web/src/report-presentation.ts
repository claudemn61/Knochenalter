import { greulichPyleSd } from "./greulich-pyle-sd";
import { predictAdultHeight } from "./bayley-pinneau";

const CM_PER_INCH = 2.54;

/** Every string the screen can show. Flat on purpose: each field maps to one i18n key. */
export interface ReportLabels {
  estimatedBoneAgeLabel: string;
  estimatedAgeText: string;
  estimatedBoneAgeCaption: string;
  chronologicalAgeLabel: string;
  chronologicalAgeText?: string;
  differenceLabel: string;
  notInformedValue: string;
  notComputedValue: string;
  stdDevLabel: string;
  stdDevValueTemplate: string;
  monthsValueTemplate: string;
  differenceValueTemplate: string;

  /** Standard-Befund block: static labels, values computed per result. */
  befundHeading: string;
  befundBoneAgeLabel: string;
  befundChronoLabel: string;
  befundStdDevLabel: string;
  befundUpperLabel: string;
  befundLowerLabel: string;
  /** A year/month age. Template: {years}, {months}. */
  befundAgeValueTemplate: string;
  /** Opening clause of the concluding sentence. */
  befundIntro: string;
  befundRetardation: string;
  befundAcceleration: string;
  befundNormal: string;
  /** Shown instead of the fields when the chronological age is outside the
   * Greulich-Pyle table's range for the given sex. */
  befundOutOfRange: string;
  befundCitation: string;

  /** Bayley-Pinneau adult height prediction block: static labels. */
  heightHeading: string;
  heightCurrentLabel: string;
  heightCategoryLabel: string;
  heightCategoryAverage: string;
  heightCategoryAccelerated: string;
  heightCategoryRetarded: string;
  heightPmhLabel: string;
  heightPredictedLabel: string;
  /** A height value. Template: {cm}. */
  heightCmValueTemplate: string;
  /** A percentage value. Template: {percent}. */
  heightPercentValueTemplate: string;
  heightOutOfRange: string;
  heightCitation: string;
}

export interface ReportInput {
  /** Ensemble estimate in months. */
  months: number;
  /** The three individual network outputs, in months; used for the ensemble SD. */
  folds: number[];
  /** Biological sex given to the network. */
  sex: "male" | "female";
  /** Chronological age in months, or undefined when no date of birth. */
  chronologicalMonths?: number;
  /** Current height in cm, for the Bayley-Pinneau prediction; undefined when not entered. */
  heightCm?: number;
  /** BCP 47 locale used for number formatting. */
  locale: string;
  /** Every display string. */
  labels: ReportLabels;
}

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

/** One set of values, rounding rules and field order for the screen. */
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
  // Sample standard deviation (n-1) of the ensemble's individual fold
  // predictions around their mean (input.months). This is the spread between
  // the three networks, not a clinical confidence interval for one patient
  // (see result.stddevNote).
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
  // Bayley-Pinneau adult height prediction: offered with a current height
  // entered and a chronological age available (see src/bayley-pinneau.ts).
  const heightPrediction =
    chronological === undefined || input.heightCm === undefined
      ? undefined
      : (() => {
          const heightInches = input.heightCm! / CM_PER_INCH;
          const prediction = predictAdultHeight(
            input.sex,
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
  return {
    chronological,
    difference,
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
    stdDevMonths,
    stdDevValue,
    befund,
    heightPrediction,
  };
}
