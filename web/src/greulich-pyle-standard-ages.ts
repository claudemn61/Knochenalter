// The Greulich & Pyle (1959) atlas only has a comparison plate at specific
// ages - not a continuous scale. A bone age assigned by matching a hand
// X-ray against the atlas is always one of these ages, never an arbitrary
// in-between value. Transcribed from the age list in the printed atlas
// supplied by the app's maintainer.
//
// [age in months]
export const BOYS_STANDARD_AGES_MONTHS: number[] = [
  0, 3, 6, 9, 12, 15, 18, 24, 32, 36, 42, 48, 54, 60, 72, 84, 96, 108, 120,
  132, 138, 150, 156, 162, 168, 180, 186, 192, 204, 216, 228,
];
export const GIRLS_STANDARD_AGES_MONTHS: number[] = [
  0, 3, 6, 9, 12, 15, 18, 24, 30, 36, 42, 50, 60, 69, 82, 94, 106, 120, 132,
  144, 156, 162, 168, 180, 192, 204, 216,
];

/**
 * The atlas age (in months) closest to the given value, for the given sex.
 * On an exact tie between two plate ages, keeps the lower one.
 */
export function nearestStandardAge(months: number, sex: "male" | "female") {
  const table = sex === "male" ? BOYS_STANDARD_AGES_MONTHS : GIRLS_STANDARD_AGES_MONTHS;
  let nearest = table[0];
  let bestDiff = Math.abs(months - nearest);
  for (const age of table) {
    const diff = Math.abs(months - age);
    if (diff < bestDiff) {
      bestDiff = diff;
      nearest = age;
    }
  }
  return nearest;
}
