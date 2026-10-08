// Looks up a locally-loaded RSNA Pediatric Bone Age reference image closest
// to a given bone age/sex, for side-by-side comparison when the printed
// Greulich-Pyle atlas isn't at hand. The CSV and images are never bundled
// with the app (the dataset is non-commercial/educational-use only) - the
// user loads their own local copy each session via main.ts's file pickers.

export interface ReferenceRow {
  id: string;
  months: number;
  sex: "male" | "female" | "";
}

function detectColumn(header: string[], candidates: string[]): number {
  const lower = header.map((h) => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = lower.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Parses an RSNA-style labels CSV. Column names vary across the dataset's
 * train/validation CSVs (e.g. "id"/"Image ID", "boneage"/"Bone Age
 * (months)", "male"/"Sex"), so candidate names are matched case-insensitively.
 */
export function parseReferenceCsv(text: string): ReferenceRow[] {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const idIdx = detectColumn(header, ["id", "image id", "case id", "imageid"]);
  const ageIdx = detectColumn(header, [
    "boneage",
    "bone age",
    "bone age (months)",
    "boneage(months)",
    "age",
  ]);
  const sexIdx = detectColumn(header, ["male", "sex", "gender"]);
  if (idIdx === -1 || ageIdx === -1) {
    throw new Error(
      `Spalten nicht erkannt (erwarte z.B. id/boneage/male). Kopfzeile: ${header.join(", ")}`,
    );
  }
  const rows: ReferenceRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length <= Math.max(idIdx, ageIdx)) continue;
    const id = cols[idIdx].trim();
    const months = Number(cols[ageIdx].trim());
    if (!id || !Number.isFinite(months)) continue;
    let sex: ReferenceRow["sex"] = "";
    if (sexIdx !== -1 && cols[sexIdx] !== undefined) {
      const raw = cols[sexIdx].trim().toLowerCase();
      if (["true", "m", "male", "1"].includes(raw)) sex = "male";
      else if (["false", "f", "female", "0"].includes(raw)) sex = "female";
    }
    rows.push({ id, months, sex });
  }
  return rows;
}

/** The row whose labeled bone age is closest to `months`, among rows matching `sex`. */
export function nearestReferenceRow(
  rows: ReferenceRow[],
  months: number,
  sex: "male" | "female",
): ReferenceRow | undefined {
  const candidates = rows.filter((row) => row.sex === sex);
  let best: ReferenceRow | undefined;
  let bestDiff = Infinity;
  for (const row of candidates) {
    const diff = Math.abs(row.months - months);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = row;
    }
  }
  return best;
}

/**
 * The next-younger (direction -1) or next-older (direction 1) row relative
 * to `fromMonths`, restricted to `sex` and to rows `available` (i.e. whose
 * image file is actually loaded locally) - lets a user step through the
 * reference dataset by age even after picking a specific comparison image.
 */
export function stepReferenceRow(
  rows: ReferenceRow[],
  sex: "male" | "female",
  fromMonths: number,
  direction: -1 | 1,
  available: (id: string) => boolean,
): ReferenceRow | undefined {
  let best: ReferenceRow | undefined;
  for (const row of rows) {
    if (row.sex !== sex || !available(row.id)) continue;
    if (direction < 0 ? row.months >= fromMonths : row.months <= fromMonths) continue;
    if (!best || (direction < 0 ? row.months > best.months : row.months < best.months))
      best = row;
  }
  return best;
}
