// Bayley-Pinneau adult height prediction, revised for the Greulich-Pyle
// hand standards.
//
// Source: Bayley N, Pinneau SR. "Tables for Predicting Adult Height from
// Skeletal Age: Revised for Use with the Greulich-Pyle Hand Standards."
// J Pediatr. 1952;40(4):423-441. Reprinted in Greulich & Pyle (1959),
// Radiographic Atlas of Skeletal Development of the Hand and Wrist, 2nd
// ed., Tables IIA-IIF (boys) and IIIA-IIIF (girls). Transcribed from a
// scan of the printed tables supplied by the app's maintainer, and
// cross-checked against three worked examples given in the book's own
// text (two boys, one girl) - the predicted heights below match those
// examples exactly.
//
// IMPORTANT GAP (boys only): the "Retarded Boys" table in the source book
// (Table IIE) only covers skeletal ages 6-0 through 13-0. The original
// 1952 paper has a continuation (Table IIF, retarded boys at older
// skeletal ages) that was not available to transcribe (the journal
// article is paywalled and no free reproduction of that specific table
// was found). Skeletal ages beyond 13-0 for retarded boys are therefore
// NOT SUPPORTED and must not be extrapolated - report them as out of
// range instead of guessing. The girls' tables have no such gap: Table
// IIIF (retarded girls) covers skeletal ages up to 17-0.
//
// Method: each table lists "per cent of mature height attained" (PMH) at
// mostly-3-month skeletal-age steps (a few tables widen to 4- or 6-month
// steps at points the source itself prints that way - the interpolation
// below does not assume uniform spacing). Predicted mature height =
// current height / (PMH / 100) - this is the formula the book itself
// gives, and its own worked examples match the tables' printed body cells
// exactly, so only this percentage row needs to be stored, not the large
// derived body grid of predicted heights. The current-height unit is
// irrelevant to PMH itself: pass inches or cm, the predicted height comes
// back in the same unit.

export type MaturityCategory = "average" | "accelerated" | "retarded";
export type Sex = "male" | "female";

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

export const GIRLS_AVERAGE_PMH: [number, number][] = [
  // Table IIIA - Average Girls, skeletal ages 6 through 11 years.
  [72, 72.0], [75, 72.9], [78, 73.8], [82, 75.1], [84, 75.7], [87, 76.5],
  [90, 77.2], [94, 78.2], [96, 79.0], [99, 80.1], [102, 81.0], [106, 82.1],
  [108, 82.7], [111, 83.6], [114, 84.4], [117, 85.3], [120, 86.2], [123, 87.4],
  [126, 88.4], [129, 89.6], [132, 90.6], [135, 91.0], [138, 91.4], [141, 91.8],
  // Table IIIB - Average Girls, skeletal ages 12 through 18 years.
  [144, 92.2], [147, 93.2], [150, 94.1], [153, 95.0], [156, 95.8], [159, 96.7],
  [162, 97.4], [165, 97.8], [168, 98.0], [171, 98.3], [174, 98.6], [177, 98.8],
  [180, 99.0], [183, 99.1], [186, 99.3], [189, 99.4], [192, 99.6], [195, 99.6],
  [198, 99.7], [201, 99.8], [204, 99.9], [210, 99.95], [216, 100.0],
];

export const GIRLS_ACCELERATED_PMH: [number, number][] = [
  // Table IIIC - Accelerated Girls, skeletal ages 7 through 11 years.
  [84, 71.2], [87, 72.2], [90, 73.2], [94, 74.2], [96, 75.0], [99, 76.0],
  [102, 77.1], [106, 78.4], [108, 79.0], [111, 80.0], [114, 80.9], [117, 81.9],
  [120, 82.8], [123, 84.1], [126, 85.6], [129, 87.0], [132, 88.3], [135, 88.7],
  [138, 89.1], [141, 89.7],
  // Table IIID - Accelerated Girls, skeletal ages 12 through 17 years.
  [144, 90.1], [147, 91.3], [150, 92.4], [153, 93.5], [156, 94.5], [159, 95.5],
  [162, 96.3], [165, 96.8], [168, 97.2], [171, 97.7], [174, 98.0], [177, 98.3],
  [180, 98.6], [183, 98.8], [186, 99.0], [189, 99.2], [192, 99.3], [195, 99.4],
  [198, 99.5], [201, 99.7], [204, 99.8], [210, 99.95],
];

export const GIRLS_RETARDED_PMH: [number, number][] = [
  // Table IIIE - Retarded Girls, skeletal ages 6 through 11 years.
  [72, 73.3], [75, 74.2], [78, 75.1], [82, 76.3], [84, 77.0], [87, 77.9],
  [90, 78.8], [94, 79.7], [96, 80.4], [99, 81.3], [102, 82.3], [106, 83.6],
  [108, 84.1], [111, 85.1], [114, 85.8], [117, 86.6], [120, 87.4], [123, 88.4],
  [126, 89.6], [129, 90.7], [132, 91.8], [135, 92.2], [138, 92.6], [141, 92.9],
  // Table IIIF - Retarded Girls, skeletal ages 12 through 17 years. Unlike
  // the boys' retarded table, this one has no gap.
  [144, 93.2], [147, 94.2], [150, 94.9], [153, 95.7], [156, 96.4], [159, 97.1],
  [162, 97.7], [165, 98.1], [168, 98.3], [171, 98.6], [174, 98.9], [177, 99.2],
  [180, 99.4], [183, 99.5], [186, 99.6], [189, 99.7], [192, 99.8], [195, 99.9],
  [198, 99.9], [201, 99.95], [204, 100.0],
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

const TABLES: Record<Sex, Record<MaturityCategory, [number, number][]>> = {
  male: {
    average: BOYS_AVERAGE_PMH,
    accelerated: BOYS_ACCELERATED_PMH,
    retarded: BOYS_RETARDED_PMH,
  },
  female: {
    average: GIRLS_AVERAGE_PMH,
    accelerated: GIRLS_ACCELERATED_PMH,
    retarded: GIRLS_RETARDED_PMH,
  },
};

/**
 * Predicts adult height from current height, skeletal age and
 * chronological age (both in months). Returns undefined when the skeletal
 * age falls outside the matching table's range - notably, any retarded
 * boy (skeletal age at least a year behind chronological age) past 13-0
 * skeletal age, where the source has no data (see the gap notice above;
 * the girls' retarded table has no such gap).
 */
export function predictAdultHeight(
  sex: Sex,
  currentHeight: number,
  skeletalMonths: number,
  chronologicalMonths: number,
): HeightPrediction | undefined {
  const category = maturityCategory(skeletalMonths, chronologicalMonths);
  const pmh = interpolate(TABLES[sex][category], skeletalMonths);
  if (pmh === undefined || !Number.isFinite(currentHeight) || currentHeight <= 0)
    return undefined;
  return { category, pmh, predictedHeight: currentHeight / (pmh / 100) };
}
