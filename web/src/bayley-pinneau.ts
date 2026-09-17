// Bayley-Pinneau adult height prediction, revised for the Greulich-Pyle
// hand standards. Boys only for now - the girls' tables (III A-F) have not
// been transcribed yet.
//
// Source: Bayley N, Pinneau SR. "Tables for Predicting Adult Height from
// Skeletal Age: Revised for Use with the Greulich-Pyle Hand Standards."
// J Pediatr. 1952;40(4):423-441. Reprinted in Greulich & Pyle (1959),
// Radiographic Atlas of Skeletal Development of the Hand and Wrist, 2nd
// ed., Tables IIA-IIE (boys). Transcribed from a scan of the printed
// tables supplied by the app's maintainer.
//
// IMPORTANT GAP: the "Retarded Boys" table in the source book (Table IIE)
// only covers skeletal ages 6-0 through 13-0. The original 1952 paper has
// a continuation (Table IIF, retarded boys at older skeletal ages) that
// was not available to transcribe (the journal article is paywalled and no
// free reproduction of that specific table was found). Skeletal ages
// beyond 13-0 for retarded boys are therefore NOT SUPPORTED and must not
// be extrapolated - report them as out of range instead of guessing.
//
// Method: each table lists "per cent of mature height attained" (PMH) at
// 3-month skeletal-age steps. Predicted mature height = current height /
// (PMH / 100) - this is the formula the book itself gives, and its own
// worked examples match the tables' printed body cells exactly (checked
// against three examples in the text), so only this percentage row needs
// to be stored, not the large derived body grid of predicted heights.
// The current-height unit is irrelevant to PMH itself: pass inches or cm,
// the predicted height comes back in the same unit.

export type MaturityCategory = "average" | "accelerated" | "retarded";

// [skeletal age in months, % of mature height]
export const BOYS_AVERAGE_PMH: [number, number][] = [
  // Table IIA - Average Boys, skeletal ages 7 through 12 years.
  [84, 69.5], [87, 70.2], [90, 70.9], [93, 71.6], [96, 72.3], [99, 73.1],
  [102, 73.9], [105, 74.6], [108, 75.2], [111, 76.1], [114, 76.9], [117, 77.7],
  [120, 78.4], [123, 79.1], [126, 79.5], [129, 80.0], [132, 80.4], [135, 81.2],
  [138, 81.8], [141, 82.7], [144, 83.4], [147, 84.3], [150, 85.3], [153, 86.3],
  // Table IIB - Average Boys, skeletal ages 13 years to maturity.
  [156, 87.6], [159, 89.0], [162, 90.2], [165, 91.4], [168, 92.7], [171, 93.8],
  [174, 94.8], [177, 95.8], [180, 96.8], [183, 97.3], [186, 97.6], [189, 98.0],
  [192, 98.2], [195, 98.5], [198, 98.7], [201, 98.9], [204, 99.1], [207, 99.3],
  [210, 99.4], [213, 99.5], [216, 99.6], [219, 99.8], [222, 100.0],
];

export const BOYS_ACCELERATED_PMH: [number, number][] = [
  // Table IIC - Accelerated Boys, skeletal ages 7 through 11 years.
  [84, 67.0], [87, 67.6], [90, 68.3], [93, 68.9], [96, 69.6], [99, 70.3],
  [102, 70.9], [105, 71.5], [108, 72.0], [111, 72.8], [114, 73.4], [117, 74.1],
  [120, 74.7], [123, 75.3], [126, 75.8], [129, 76.3], [132, 76.7], [135, 77.6],
  [138, 78.6], [141, 80.0],
  // Table IID - Accelerated Boys, skeletal ages 12 through 17 years.
  [144, 80.9], [147, 81.8], [150, 82.8], [153, 83.9], [156, 85.0], [159, 86.3],
  [162, 87.5], [165, 89.0], [168, 90.5], [171, 91.8], [174, 93.0], [177, 94.3],
  [180, 95.8], [183, 96.7], [186, 97.1], [189, 97.6], [192, 98.0], [195, 98.3],
  [198, 98.5], [201, 98.8], [204, 99.0],
];

export const BOYS_RETARDED_PMH: [number, number][] = [
  // Table IIE - Retarded Boys, skeletal ages 6 through 13 years. No
  // continuation available (see the gap notice above).
  [72, 68.0], [75, 69.0], [78, 70.0], [81, 70.9], [84, 71.8], [87, 72.8],
  [90, 73.8], [93, 74.7], [96, 75.6], [99, 76.5], [102, 77.3], [105, 77.9],
  [108, 78.6], [111, 79.4], [114, 80.0], [117, 80.7], [120, 81.2], [123, 81.6],
  [126, 81.9], [129, 82.1], [132, 82.3], [135, 82.7], [138, 83.2], [141, 83.9],
  [144, 84.5], [147, 85.2], [150, 86.0], [153, 86.9], [156, 88.0],
];

/**
 * Bayley-Pinneau maturity category: whether skeletal age tracks, leads or
 * lags chronological age by at least a year - this decides which table to
 * read the percentage from (see the book's own "Directions for Using the
 * Tables").
 */
export function maturityCategory(
  skeletalMonths: number,
  chronologicalMonths: number,
): MaturityCategory {
  const diff = skeletalMonths - chronologicalMonths;
  if (diff >= 12) return "accelerated";
  if (diff <= -12) return "retarded";
  return "average";
}

function interpolate(
  table: [number, number][],
  months: number,
): number | undefined {
  const [firstAge] = table[0];
  const [lastAge] = table[table.length - 1];
  if (!Number.isFinite(months) || months < firstAge || months > lastAge)
    return undefined;
  for (let i = 1; i < table.length; i++) {
    const [age0, v0] = table[i - 1];
    const [age1, v1] = table[i];
    if (months <= age1) {
      if (age1 === age0) return v0;
      const t = (months - age0) / (age1 - age0);
      return v0 + t * (v1 - v0);
    }
  }
  // Unreachable: the range check above guarantees a bracketing pair.
  return undefined;
}

export interface HeightPrediction {
  category: MaturityCategory;
  /** Interpolated per cent of mature height already attained. */
  pmh: number;
  /** currentHeight / (pmh / 100), in the same unit as currentHeight. */
  predictedHeight: number;
}

/**
 * Predicts adult height for a boy from current height, skeletal age and
 * chronological age (both in months). Returns undefined when the skeletal
 * age falls outside the matching table's range - notably, any retarded
 * boy (skeletal age at least a year behind chronological age) past 13-0
 * skeletal age, where the source has no data (see the gap notice above).
 */
export function predictAdultHeightBoys(
  currentHeight: number,
  skeletalMonths: number,
  chronologicalMonths: number,
): HeightPrediction | undefined {
  const category = maturityCategory(skeletalMonths, chronologicalMonths);
  const table =
    category === "average"
      ? BOYS_AVERAGE_PMH
      : category === "accelerated"
        ? BOYS_ACCELERATED_PMH
        : BOYS_RETARDED_PMH;
  const pmh = interpolate(table, skeletalMonths);
  if (pmh === undefined || !Number.isFinite(currentHeight) || currentHeight <= 0)
    return undefined;
  return { category, pmh, predictedHeight: currentHeight / (pmh / 100) };
}
