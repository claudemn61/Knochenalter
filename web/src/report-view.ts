import type { ReportInput } from "./report-presentation";
import { presentReport } from "./report-presentation";

const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;

/** The `befund` block of the presentation last rendered, for the copy button. */
let lastBefund: ReturnType<typeof presentReport>["befund"];
export const currentBefund = () => lastBefund;

function fields(id: string, rows: { label: string; value: string }[]) {
  el(id).replaceChildren(
    ...rows.map(({ label, value }) => {
      const cell = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value;
      cell.append(term, description);
      return cell;
    }),
  );
}

export function renderReport(input: ReportInput) {
  const p = presentReport(input);
  const l = input.labels;
  lastBefund = p.befund;
  el("result-months").textContent = p.estimatedValue;
  el("result-age").textContent = l.estimatedAgeText;
  el("result-stddev").textContent = p.stdDevValue;
  el("result-chrono").textContent = p.chronologicalValue;
  el("result-chrono-age").textContent = l.chronologicalAgeText || "";
  el("result-difference").textContent = p.differenceValue;
  el("befund-section").hidden = !p.befund;
  el("befund-copy").hidden = !p.befund || p.befund.outOfRange;
  if (p.befund?.outOfRange) {
    fields("befund-fields", []);
    el("befund-conclusion").textContent = p.befund.message;
    el("befund-citation").textContent = "";
  } else if (p.befund) {
    fields("befund-fields", [
      { label: p.befund.boneAgeLabel, value: p.befund.boneAgeValue },
      { label: p.befund.chronoLabel, value: p.befund.chronoValue },
      { label: p.befund.stdDevLabel, value: p.befund.stdDevValue },
      { label: p.befund.upperLabel, value: p.befund.upperValue },
      { label: p.befund.lowerLabel, value: p.befund.lowerValue },
    ]);
    el("befund-conclusion").textContent = p.befund.conclusion;
    el("befund-citation").textContent = p.befund.citation;
  }
  el("height-section").hidden = !p.heightPrediction;
  if (p.heightPrediction?.state === "ok") {
    fields("height-fields", [
      { label: p.heightPrediction.currentLabel, value: p.heightPrediction.currentValue },
      { label: p.heightPrediction.categoryLabel, value: p.heightPrediction.categoryValue },
      { label: p.heightPrediction.pmhLabel, value: p.heightPrediction.pmhValue },
      { label: p.heightPrediction.predictedLabel, value: p.heightPrediction.predictedValue },
    ]);
    el("height-message").textContent = "";
    el("height-citation").textContent = p.heightPrediction.citation;
  } else if (p.heightPrediction) {
    fields("height-fields", []);
    el("height-message").textContent = p.heightPrediction.message;
    el("height-citation").textContent = "";
  }
}
