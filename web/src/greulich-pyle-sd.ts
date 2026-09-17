// Population reference for the Standard-Befund classification: standard
// deviation of skeletal (hand) age from chronological age, by sex.
//
// Source: Greulich WW, Pyle SI. Radiographic Atlas of Skeletal Development
// of the Hand and Wrist, 2nd ed. Stanford University Press, 1959.
// Table V (Boys) and Table VI (Girls), "Means and Standard Deviations for
// Skeletal Age (Hand)". Transcribed from a scan of the printed tables
// supplied by the app's maintainer. Table VI (girls) ends at 15 years in
// the source; it has no continuation to 16-17 years.
//
// [chronological age in months, standard deviation in months]
export const BOYS_SD: [number, number][] = [
  [12, 2.1],
  [18, 2.7],
  [24, 4.0],
  [30, 5.4],
  [36, 6.0],
  [42, 6.6],
  [48, 7.0],
  [54, 7.8],
  [60, 8.4],
  [66, 9.1],
  [72, 9.3],
  [84, 10.1],
  [96, 10.8],
  [108, 11.0],
  [120, 11.4],
  [132, 10.5],
  [144, 10.4],
  [156, 11.1],
  [168, 12.0],
  [180, 14.2],
  [192, 15.1],
  [204, 15.4],
];
export const GIRLS_SD: [number, number][] = [
  [12, 2.7],
  [18, 3.4],
  [24, 4.0],
  [30, 4.8],
  [36, 5.6],
  [42, 6.5],
  [48, 7.2],
  [54, 8.0],
  [60, 8.6],
  [66, 8.9],
  [72, 9.0],
  [84, 8.3],
  [96, 8.8],
  [108, 9.3],
  [120, 10.8],
  [132, 12.3],
  [144, 14.0],
  [156, 14.6],
  [168, 12.6],
  [180, 11.2],
];

/**
 * Linear interpolation of the Greulich-Pyle standard deviation at a given
 * chronological age. Returns undefined outside the table's range for that
 * sex (below 12 months, or above 204 months for boys / 180 months for
 * girls) - the table is not extrapolated.
 */
export function greulichPyleSd(
  chronologicalMonths: number,
  sex: "male" | "female",
): number | undefined {
  const table = sex === "male" ? BOYS_SD : GIRLS_SD;
  const [firstAge] = table[0];
  const [lastAge] = table[table.length - 1];
  if (
    !Number.isFinite(chronologicalMonths) ||
    chronologicalMonths < firstAge ||
    chronologicalMonths > lastAge
  )
    return undefined;
  for (let i = 1; i < table.length; i++) {
    const [age0, sd0] = table[i - 1];
    const [age1, sd1] = table[i];
    if (chronologicalMonths <= age1) {
      if (age1 === age0) return sd0;
      const t = (chronologicalMonths - age0) / (age1 - age0);
      return sd0 + t * (sd1 - sd0);
    }
  }
  // Unreachable: the range check above guarantees a bracketing pair.
  return undefined;
}
