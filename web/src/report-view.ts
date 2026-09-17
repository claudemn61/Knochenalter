import type { ReportInput } from "./report";
import { presentReport, scaleOf } from "./report-presentation";

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

export function renderReport(
  input: ReportInput,
  radiograph: HTMLCanvasElement,
) {
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
  el("professional-comparison").hidden = !p.professional;
  fields("professional-comparison-data", p.professional?.fields || []);
  fields("result-exam-data", p.examFields);
  fields("execution-details", [
    ...p.technicalFields,
    { label: l.preprocessingLabel, value: l.preprocessingValue },
  ]);

  const values = [
    input.months,
    ...(p.chronological === undefined ? [] : [p.chronological]),
  ];
  const axis = scaleOf(values);
  el("age-scale-min").textContent = p.monthsValue(axis.min, 0);
  el("age-scale-max").textContent = p.monthsValue(axis.max, 0);
  el("age-estimate-marker").style.left = `${axis.at(input.months)}%`;
  el("age-chrono-marker").hidden = p.chronological === undefined;
  el("age-chrono-legend").hidden = p.chronological === undefined;
  el("age-comparison-span").hidden = p.chronological === undefined;
  if (p.chronological !== undefined) {
    el("age-chrono-marker").style.left = `${axis.at(p.chronological)}%`;
    el("age-comparison-span").style.left =
      `${Math.min(...values.map(axis.at))}%`;
    el("age-comparison-span").style.width =
      `${Math.abs(axis.at(input.months) - axis.at(p.chronological))}%`;
  }

  const plate = el<HTMLCanvasElement>("result-radiograph");
  plate.width = radiograph.width;
  plate.height = radiograph.height;
  plate.getContext("2d")!.drawImage(radiograph, 0, 0);

  const foldAxis = scaleOf([...input.folds, input.months]);
  el("result-mean").textContent = p.meanValue;
  el("result-networks").replaceChildren(
    ...p.folds.map((fold) => {
      const row = document.createElement("div");
      row.className = "network-row";
      const name = document.createElement("span");
      name.textContent = fold.label;
      const rail = document.createElement("span");
      rail.className = "network-rail";
      rail.setAttribute("aria-hidden", "true");
      const mean = document.createElement("i");
      mean.className = "network-mean";
      mean.style.left = `${foldAxis.at(input.months)}%`;
      const dot = document.createElement("i");
      dot.className = "network-dot";
      dot.style.left = `${foldAxis.at(fold.months)}%`;
      rail.append(mean, dot);
      const value = document.createElement("span");
      value.textContent = fold.value;
      row.append(name, rail, value);
      return row;
    }),
  );
  el("result-references").replaceChildren(
    ...p.references.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );
}
