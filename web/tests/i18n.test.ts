import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { de, t, type Key } from "../src/i18n";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html");
const sources = readdirSync(new URL("../src", import.meta.url))
  .filter((name) => name.endsWith(".ts"))
  .map((name) => read(`src/${name}`));

const keys = Object.keys(de).sort();

describe("dictionary", () => {
  it("leaves no empty translation", () => {
    for (const key of keys as Key[])
      expect(de[key].trim().length).toBeGreaterThan(0);
  });
});

describe("keys referenced by the app", () => {
  it("exist for every data-i18n attribute in the markup", () => {
    const used = [...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(used.length).toBeGreaterThan(30);
    for (const key of used) expect(de).toHaveProperty([key]);
  });

  it("exist for every t(\"…\") call in the sources", () => {
    const used = sources.flatMap((source) =>
      [...source.matchAll(/\bt\(\s*"([^"]+)"/g)].map((m) => m[1]),
    );
    expect(used.length).toBeGreaterThan(30);
    for (const key of used) expect(de).toHaveProperty([key]);
  });

  it("cover the model status keys the report re-renders", () => {
    for (const key of ["model.initial", "model.ready", "model.executed", "model.cleared"])
      expect(de).toHaveProperty([key]);
  });
});

describe("t", () => {
  it("interpolates variables", () => {
    expect(t("progress.fold", { stage: "Berechnung läuft", fold: 2 })).toBe(
      "Berechnung läuft · Netzwerk 2/3",
    );
  });

  it("keeps an unknown placeholder rather than emitting undefined", () => {
    expect(t("height.cmValueTemplate", {})).toBe("{cm} cm");
  });
});
