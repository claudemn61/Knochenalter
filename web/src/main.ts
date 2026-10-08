import "./style.css";
import { decodeFile } from "./decode";
import {
  chronologicalMonths,
  rotateClockwise,
  validateCrop,
} from "./processing";
import type { Crop, GrayImage, Result } from "./types";
import type { ReportInput, ReportLabels } from "./report-presentation";
import {
  currentBefund,
  currentHeightPrediction,
  currentTargetHeight,
  renderReport,
} from "./report-view";
import { createImageReview } from "./image-review";
import { nearestStandardAge } from "./greulich-pyle-standard-ages";
import {
  nearestReferenceRow,
  parseReferenceCsv,
  stepReferenceRow,
  type ReferenceRow,
} from "./rsna-reference";
import { loadHandle, saveHandle } from "./reference-storage";
import { t, type Key } from "./i18n";

const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const fileInput = el<HTMLInputElement>("file-input");
const sex = el<HTMLSelectElement>("sex");
const dob = el<HTMLInputElement>("dob");
const exam = el<HTMLInputElement>("exam-date");
const heightCm = el<HTMLInputElement>("height-cm");
const heightFatherCm = el<HTMLInputElement>("height-father-cm");
const heightMotherCm = el<HTMLInputElement>("height-mother-cm");
const boneAgeYears = el<HTMLInputElement>("bone-age-years");
const boneAgeMonths = el<HTMLInputElement>("bone-age-months");
const boneAgeHint = el("bone-age-hint");
const referencePickCsv = el<HTMLButtonElement>("reference-pick-csv");
const referencePickImages = el<HTMLButtonElement>("reference-pick-images");
const referenceCsvInput = el<HTMLInputElement>("reference-csv-input");
const referenceImagesInput = el<HTMLInputElement>("reference-images-input");
const referenceStatus = el("reference-status");
const referenceContent = el("reference-content");
const referenceImage = el<HTMLImageElement>("reference-image");
const referenceCaption = el("reference-caption");
const referenceYoungerButtons = [
  el<HTMLButtonElement>("reference-younger"),
  el<HTMLButtonElement>("compare-younger"),
];
const referenceOlderButtons = [
  el<HTMLButtonElement>("reference-older"),
  el<HTMLButtonElement>("compare-older"),
];
const compareDialog = el<HTMLDialogElement>("compare-dialog");
const comparePatientViewport = el("compare-patient-viewport");
const compareReferenceViewport = el("compare-reference-viewport");
const comparePatientImage = el<HTMLImageElement>("compare-patient-image");
const compareReferenceImage = el<HTMLImageElement>("compare-reference-image");
const comparePatientCaption = el("compare-patient-caption");
const compareReferenceCaption = el("compare-reference-caption");
const compareZoom = el<HTMLInputElement>("compare-zoom");
const compareZoomValue = el("compare-zoom-value");
const canvas = el<HTMLCanvasElement>("image-canvas");
const ctx = canvas.getContext("2d")!;
const source = document.createElement("canvas");
const sourceCtx = source.getContext("2d")!;
const base = new URL("./", document.baseURI).href;
// Public weights may live on a separate host; same origin unless VITE_WEIGHTS_BASE is set.
const weightsBase = new URL(import.meta.env.VITE_WEIGHTS_BASE || "./", base)
  .href;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
exam.value = today();
let image: GrayImage | undefined;
let filename = "";
let crop: Crop = { x0: 0, y0: 0, x1: 0, y1: 0 };
let worker: Worker | undefined;
let result: Result | undefined;
// Bone age in whole months, editable after inference - always snapped to
// the nearest Greulich-Pyle atlas plate age (see
// greulich-pyle-standard-ages.ts), never an arbitrary in-between value.
// Seeded from the model's estimate on a fresh result, then whatever the
// year/month fields hold, snapped on every change. Defined exactly when
// `result` is.
let editedMonths: number | undefined;
// The model's raw, unsnapped estimate in months, kept only to show in the
// "manually adjusted" hint - never used for the Befund/height calculations.
let modelMonths: number | undefined;
// Locally loaded RSNA reference data (CSV rows + matching image files), for
// showing a comparison image next to the computed bone age. Loaded fresh
// each session via the file pickers below - never bundled with the app, as
// the dataset is for non-commercial/educational use only.
let referenceRows: ReferenceRow[] = [];
let referenceImages: Map<string, File | FileSystemFileHandle> | undefined;
let referenceObjectUrl: string | undefined;
// The row currently shown (starts at the nearest match, but can be stepped
// away from it via the younger/older buttons below).
let displayedReferenceRow: ReferenceRow | undefined;
let busy = false,
  fileGeneration = 0;
let dragging: { x: number; y: number } | undefined;
const imageReview = createImageReview(() => {
  if (!image || busy || !validateCrop(crop, image.width, image.height)) return undefined;
  return { source, crop };
});
el("review-image").addEventListener("click", () => imageReview.open());
const ageText = (months: number) => {
  const rounded = Math.round(months),
    years = Math.floor(rounded / 12),
    m = rounded % 12;
  return t("age.years", {
    years,
    yearWord: t(years === 1 ? "age.year" : "age.yearPlural"),
    months: m,
    monthWord: t(m === 1 ? "age.month" : "age.monthPlural"),
  });
};
function setBoneAgeInputs(months: number) {
  boneAgeYears.value = String(Math.floor(months / 12));
  boneAgeMonths.value = String(months % 12);
}
// Fires on blur/commit (not per keystroke) so a value being typed isn't
// snapped away mid-edit; the fields then re-display the snapped result.
function onBoneAgeEdit() {
  if (!result || modelMonths === undefined) return;
  const years = Math.max(0, Number(boneAgeYears.value) || 0);
  const months = Math.max(0, Number(boneAgeMonths.value) || 0);
  const raw = Math.min(228, Math.round(years * 12 + months));
  editedMonths = nearestStandardAge(raw, result.sex);
  setBoneAgeInputs(editedMonths);
  if (editedMonths === nearestStandardAge(modelMonths, result.sex))
    boneAgeHint.hidden = true;
  else {
    boneAgeHint.textContent = t("result.manualHint", {
      value: ageText(modelMonths),
    });
    boneAgeHint.hidden = false;
  }
  renderReport(reportInput(result));
  updateReferenceImage();
}
boneAgeYears.addEventListener("change", onBoneAgeEdit);
boneAgeMonths.addEventListener("change", onBoneAgeEdit);
function updateReferenceStatus() {
  referenceStatus.textContent =
    referenceRows.length || referenceImages?.size
      ? t("reference.loaded", {
          rows: String(referenceRows.length),
          images: String(referenceImages?.size ?? 0),
        })
      : t("reference.notLoaded");
}
function referenceAvailable(id: string) {
  return !!referenceImages?.has(id);
}
function updateReferenceStepButtons() {
  const hasYounger =
    !!result &&
    !!displayedReferenceRow &&
    !!stepReferenceRow(referenceRows, result.sex, displayedReferenceRow.months, -1, referenceAvailable);
  const hasOlder =
    !!result &&
    !!displayedReferenceRow &&
    !!stepReferenceRow(referenceRows, result.sex, displayedReferenceRow.months, 1, referenceAvailable);
  for (const button of referenceYoungerButtons) button.disabled = !hasYounger;
  for (const button of referenceOlderButtons) button.disabled = !hasOlder;
}
async function showReferenceRow(row: ReferenceRow) {
  const source = referenceImages?.get(row.id);
  if (!source) return;
  const file = source instanceof File ? source : await source.getFile();
  if (referenceObjectUrl) URL.revokeObjectURL(referenceObjectUrl);
  referenceObjectUrl = URL.createObjectURL(file);
  referenceImage.src = referenceObjectUrl;
  displayedReferenceRow = row;
  const diff = editedMonths === undefined ? 0 : Math.round(row.months - editedMonths);
  referenceCaption.textContent = t("reference.caption", {
    age: ageText(row.months),
    sex: t(row.sex === "male" ? "sex.male" : "sex.female"),
    id: row.id,
    diff: `${diff >= 0 ? "+" : ""}${diff}`,
  });
  referenceContent.hidden = false;
  updateReferenceStepButtons();
  if (compareDialog.open) {
    compareReferenceImage.src = referenceObjectUrl;
    compareReferenceCaption.textContent = referenceCaption.textContent;
  }
}
function stepReference(direction: -1 | 1) {
  if (!result || !displayedReferenceRow) return;
  const next = stepReferenceRow(
    referenceRows,
    result.sex,
    displayedReferenceRow.months,
    direction,
    referenceAvailable,
  );
  if (next) void showReferenceRow(next);
}
for (const button of referenceYoungerButtons)
  button.addEventListener("click", () => stepReference(-1));
for (const button of referenceOlderButtons)
  button.addEventListener("click", () => stepReference(1));
function updateReferenceImage() {
  updateReferenceStatus();
  if (
    !result ||
    editedMonths === undefined ||
    !referenceRows.length ||
    !referenceImages?.size
  ) {
    referenceContent.hidden = true;
    displayedReferenceRow = undefined;
    updateReferenceStepButtons();
    return;
  }
  const row = nearestReferenceRow(referenceRows, editedMonths, result.sex);
  if (!row || !referenceImages.has(row.id)) {
    referenceContent.hidden = true;
    referenceStatus.textContent = t("reference.noMatch");
    displayedReferenceRow = undefined;
    updateReferenceStepButtons();
    return;
  }
  void showReferenceRow(row);
}
// Zoom/pan state for the compare dialog: a shared zoom level applied to both
// images relative to each one's own best-fit size, with scroll position
// mirrored between the two viewports (as a fraction of the scrollable
// range) so the same relative image region stays in view on both sides.
function fitAndSize(viewport: HTMLElement, img: HTMLImageElement, zoomValue: number) {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const fit = Math.min(
    (viewport.clientWidth - 16) / img.naturalWidth,
    (viewport.clientHeight - 16) / img.naturalHeight,
  );
  const factor = Math.max(fit, 0.01) * zoomValue;
  img.style.width = `${Math.max(1, img.naturalWidth * factor)}px`;
  img.style.height = `${Math.max(1, img.naturalHeight * factor)}px`;
}
function resizeCompare() {
  if (!compareDialog.open) return;
  const zoomValue = Number(compareZoom.value);
  fitAndSize(comparePatientViewport, comparePatientImage, zoomValue);
  fitAndSize(compareReferenceViewport, compareReferenceImage, zoomValue);
  compareZoomValue.textContent = `${Math.round(zoomValue * 100)}%`;
}
comparePatientImage.addEventListener("load", resizeCompare);
compareReferenceImage.addEventListener("load", resizeCompare);
compareZoom.addEventListener("input", resizeCompare);
window.addEventListener("resize", resizeCompare);
el("compare-zoom-reset").addEventListener("click", () => {
  compareZoom.value = "1";
  resizeCompare();
  comparePatientViewport.scrollTo(0, 0);
  compareReferenceViewport.scrollTo(0, 0);
});
let syncingScroll = false;
function syncScroll(from: HTMLElement, to: HTMLElement) {
  if (syncingScroll) return;
  syncingScroll = true;
  const fx = from.scrollWidth > from.clientWidth
    ? from.scrollLeft / (from.scrollWidth - from.clientWidth)
    : 0;
  const fy = from.scrollHeight > from.clientHeight
    ? from.scrollTop / (from.scrollHeight - from.clientHeight)
    : 0;
  to.scrollLeft = fx * (to.scrollWidth - to.clientWidth);
  to.scrollTop = fy * (to.scrollHeight - to.clientHeight);
  setTimeout(() => {
    syncingScroll = false;
  }, 0);
}
comparePatientViewport.addEventListener("scroll", () =>
  syncScroll(comparePatientViewport, compareReferenceViewport),
);
compareReferenceViewport.addEventListener("scroll", () =>
  syncScroll(compareReferenceViewport, comparePatientViewport),
);
function openCompareDialog() {
  if (!image || !referenceObjectUrl) return;
  compareZoom.value = "1";
  comparePatientImage.src = source.toDataURL("image/png");
  comparePatientCaption.textContent = `${filename} · ${image.width} × ${image.height}`;
  compareReferenceImage.src = referenceObjectUrl;
  compareReferenceCaption.textContent = referenceCaption.textContent || "";
  compareDialog.showModal();
  comparePatientViewport.scrollTo(0, 0);
  compareReferenceViewport.scrollTo(0, 0);
  resizeCompare();
}
referenceImage.addEventListener("dblclick", openCompareDialog);
canvas.addEventListener("dblclick", openCompareDialog);
el("compare-close").addEventListener("click", () => compareDialog.close());
compareDialog.addEventListener("click", (event) => {
  if (event.target === compareDialog) compareDialog.close();
});
function basenameNoExt(name: string) {
  const slash = name.lastIndexOf("/");
  const base = slash === -1 ? name : name.slice(slash + 1);
  const dot = base.lastIndexOf(".");
  return dot === -1 ? base : base.slice(0, dot);
}
function applyReferenceCsvText(text: string) {
  try {
    referenceRows = parseReferenceCsv(text);
  } catch (cause) {
    referenceRows = [];
    referenceStatus.textContent = t("reference.loadFailed", {
      reason: cause instanceof Error ? cause.message : String(cause),
    });
    return;
  }
  updateReferenceImage();
}
async function collectImageEntries(
  dir: FileSystemDirectoryHandle,
  into: Map<string, File | FileSystemFileHandle>,
) {
  for await (const entry of dir.values()) {
    if (entry.kind === "directory")
      await collectImageEntries(entry as FileSystemDirectoryHandle, into);
    else if (/\.(png|jpe?g|bmp|gif|webp)$/i.test(entry.name))
      into.set(basenameNoExt(entry.name), entry as FileSystemFileHandle);
  }
}

// File System Access API: lets the user's picked CSV/images folder be
// reopened in later sessions via a persisted handle (see
// reference-storage.ts), instead of picking them again every time. Falls
// back to the plain <input type=file> pickers below on browsers that don't
// support it (e.g. Firefox, Safari) - session-only there, as before.
const fsAccessSupported =
  "showOpenFilePicker" in window && "showDirectoryPicker" in window;
const referenceReconnect = el("reference-reconnect");
const referenceReconnectBtn = el<HTMLButtonElement>("reference-reconnect-btn");
let referenceCsvHandle: FileSystemFileHandle | undefined;
let referenceImagesHandle: FileSystemDirectoryHandle | undefined;

async function loadReferenceCsvFromHandle(handle: FileSystemFileHandle) {
  try {
    applyReferenceCsvText(await (await handle.getFile()).text());
  } catch (cause) {
    referenceStatus.textContent = t("reference.loadFailed", {
      reason: cause instanceof Error ? cause.message : String(cause),
    });
  }
}
async function loadReferenceImagesFromHandle(handle: FileSystemDirectoryHandle) {
  const map = new Map<string, File | FileSystemFileHandle>();
  try {
    await collectImageEntries(handle, map);
  } catch (cause) {
    referenceStatus.textContent = t("reference.loadFailed", {
      reason: cause instanceof Error ? cause.message : String(cause),
    });
    return;
  }
  referenceImages = map;
  updateReferenceImage();
}
function updateReferenceReconnectUi(csvPending: boolean, imagesPending: boolean) {
  referenceReconnect.hidden = !(csvPending || imagesPending);
}
async function pickReferenceCsv() {
  let handle: FileSystemFileHandle;
  try {
    [handle] = await window.showOpenFilePicker({
      types: [{ description: "CSV", accept: { "text/csv": [".csv"] } }],
    });
  } catch (cause) {
    if ((cause as DOMException)?.name !== "AbortError") throw cause;
    return;
  }
  referenceCsvHandle = handle;
  await saveHandle("referenceCsv", handle);
  await loadReferenceCsvFromHandle(handle);
}
async function pickReferenceImages() {
  let handle: FileSystemDirectoryHandle;
  try {
    handle = await window.showDirectoryPicker({ mode: "read" });
  } catch (cause) {
    if ((cause as DOMException)?.name !== "AbortError") throw cause;
    return;
  }
  referenceImagesHandle = handle;
  await saveHandle("referenceImages", handle);
  await loadReferenceImagesFromHandle(handle);
}
async function reconnectReference() {
  if (
    referenceCsvHandle &&
    (await referenceCsvHandle.queryPermission({ mode: "read" })) !== "granted"
  ) {
    if ((await referenceCsvHandle.requestPermission({ mode: "read" })) !== "granted")
      referenceCsvHandle = undefined;
  }
  if (
    referenceImagesHandle &&
    (await referenceImagesHandle.queryPermission({ mode: "read" })) !== "granted"
  ) {
    if ((await referenceImagesHandle.requestPermission({ mode: "read" })) !== "granted")
      referenceImagesHandle = undefined;
  }
  if (referenceCsvHandle) await loadReferenceCsvFromHandle(referenceCsvHandle);
  if (referenceImagesHandle) await loadReferenceImagesFromHandle(referenceImagesHandle);
  if (!referenceCsvHandle && !referenceImagesHandle)
    referenceStatus.textContent = t("reference.reconnectFailed");
  updateReferenceReconnectUi(!referenceCsvHandle, !referenceImagesHandle);
}
async function restoreReferenceHandles() {
  if (!fsAccessSupported) return;
  const [csvHandle, imagesHandle] = await Promise.all([
    loadHandle<FileSystemFileHandle>("referenceCsv"),
    loadHandle<FileSystemDirectoryHandle>("referenceImages"),
  ]);
  if (!csvHandle && !imagesHandle) return;
  referenceCsvHandle = csvHandle;
  referenceImagesHandle = imagesHandle;
  const csvGranted =
    !!csvHandle && (await csvHandle.queryPermission({ mode: "read" })) === "granted";
  const imagesGranted =
    !!imagesHandle &&
    (await imagesHandle.queryPermission({ mode: "read" })) === "granted";
  if (csvGranted) await loadReferenceCsvFromHandle(csvHandle);
  if (imagesGranted) await loadReferenceImagesFromHandle(imagesHandle);
  updateReferenceReconnectUi(!!csvHandle && !csvGranted, !!imagesHandle && !imagesGranted);
}
referenceReconnectBtn.addEventListener("click", () => void reconnectReference());
referencePickCsv.addEventListener(
  "click",
  fsAccessSupported ? () => void pickReferenceCsv() : () => referenceCsvInput.click(),
);
referencePickImages.addEventListener(
  "click",
  fsAccessSupported ? () => void pickReferenceImages() : () => referenceImagesInput.click(),
);
referenceCsvInput.addEventListener("change", async () => {
  const file = referenceCsvInput.files?.[0];
  if (!file) return;
  applyReferenceCsvText(await file.text());
});
referenceImagesInput.addEventListener("change", () => {
  referenceImages = new Map();
  for (const file of referenceImagesInput.files ?? []) {
    if (!/\.(png|jpe?g|bmp|gif|webp)$/i.test(file.name)) continue;
    referenceImages.set(basenameNoExt(file.name), file);
  }
  updateReferenceImage();
});
void restoreReferenceHandles();
function error(message: string) {
  el("error").textContent = message;
  el("error").hidden = false;
}
function notice(message: string) {
  el("notice").textContent = message;
  el("notice").hidden = false;
}
let statusKey: Key = "model.initial";
function status(key: Key) {
  statusKey = key;
  el("model-status").textContent = t(key);
}
function invalidateResult() {
  imageReview.close();
  result = undefined;
  editedMonths = undefined;
  modelMonths = undefined;
  boneAgeYears.value = boneAgeMonths.value = "";
  boneAgeHint.hidden = true;
  el("result-folds").textContent = "";
  el("result").hidden = true;
  referenceContent.hidden = true;
}
function refresh() {
  let validDates = true;
  el("chrono").textContent = "—";
  try {
    if (!exam.value) validDates = false;
    if (dob.value && exam.value)
      el("chrono").textContent = ageText(
        chronologicalMonths(dob.value, exam.value),
      );
  } catch {
    validDates = false;
    el("chrono").textContent = t("msg.checkDates");
  }
  el<HTMLButtonElement>("analyze").disabled =
    busy ||
    !image ||
    !sex.value ||
    !validDates ||
    !validateCrop(crop, image.width, image.height);
}
function setBusy(value: boolean) {
  busy = value;
  if (value) dragging = undefined;
  el<HTMLFieldSetElement>("exam-fields").disabled = value;
  for (const id of [
    "prepare",
    "clear-cache",
    "rotate",
    "full-crop",
    "replace",
    "review-image",
  ])
    el<HTMLButtonElement>(id).disabled = value;
  for (const id of ["x0", "y0", "x1", "y1"])
    el<HTMLInputElement>(id).disabled = value;
  fileInput.disabled = value;
  el("cancel").hidden = !value;
  el("progress-area").hidden = !value;
  refresh();
}
function syncCrop() {
  for (const key of ["x0", "y0", "x1", "y1"] as const)
    el<HTMLInputElement>(key).value = String(crop[key]);
  invalidateResult();
  refresh();
  draw();
}
function draw() {
  if (!image) return;
  ctx.drawImage(source, 0, 0);
  ctx.fillStyle = "#08130ba8";
  ctx.fillRect(0, 0, image.width, crop.y0);
  ctx.fillRect(0, crop.y1, image.width, image.height - crop.y1);
  ctx.fillRect(0, crop.y0, crop.x0, crop.y1 - crop.y0);
  ctx.fillRect(crop.x1, crop.y0, image.width - crop.x1, crop.y1 - crop.y0);
  ctx.strokeStyle = "#d5e7b8";
  ctx.lineWidth = Math.max(2, image.width / 350);
  ctx.setLineDash([image.width / 100, image.width / 150]);
  ctx.strokeRect(crop.x0, crop.y0, crop.x1 - crop.x0, crop.y1 - crop.y0);
  ctx.setLineDash([]);
}
function showImage() {
  if (!image) return;
  source.width = canvas.width = image.width;
  source.height = canvas.height = image.height;
  const rgba = sourceCtx.createImageData(image.width, image.height);
  for (let i = 0; i < image.pixels.length; i++) {
    rgba.data[4 * i] =
      rgba.data[4 * i + 1] =
      rgba.data[4 * i + 2] =
        image.pixels[i];
    rgba.data[4 * i + 3] = 255;
  }
  sourceCtx.putImageData(rgba, 0, 0);
  crop = { x0: 0, y0: 0, x1: image.width, y1: image.height };
  syncCrop();
  el("viewer").hidden = false;
  el("dropzone").hidden = true;
  el("image-format").textContent = image.format;
  el("file-info").textContent =
    `${filename} · ${image.width} × ${image.height}`;
}
async function openFile(file: File) {
  if (busy) return;
  const generation = ++fileGeneration;
  invalidateResult();
  image = undefined;
  el("viewer").hidden = true;
  el("dropzone").hidden = false;
  el("error").hidden = el("notice").hidden = true;
  setBusy(true);
  el("progress-label").textContent = t("progress.opening");
  el("progress-percent").textContent = "";
  el<HTMLProgressElement>("progress").removeAttribute("value");
  try {
    const decoded = await decodeFile(file);
    if (generation !== fileGeneration) return;
    image = decoded;
    filename = file.name;
    const entered =
      sex.value || dob.value || heightCm.value || heightFatherCm.value || heightMotherCm.value;
    sex.value = image.sex || "";
    dob.value = image.dob || "";
    exam.value = image.examDate || today();
    heightCm.value = heightFatherCm.value = heightMotherCm.value = "";
    showImage();
    if (image.sex || image.dob || image.examDate) notice(t("msg.dicomFilled"));
    else if (entered) notice(t("msg.fieldsCleared"));
  } catch (e) {
    if (generation === fileGeneration)
      error(e instanceof Error ? e.message : t("msg.openFailed"));
  } finally {
    if (generation === fileGeneration) setBusy(false);
  }
}
const choose = () => {
  if (!busy) fileInput.click();
};
fileInput.addEventListener("change", () => {
  if (fileInput.files?.[0]) void openFile(fileInput.files[0]);
  fileInput.value = "";
});
el("dropzone").addEventListener("click", choose);
el("dropzone").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    choose();
  }
});
el("replace").addEventListener("click", choose);
for (const name of ["dragenter", "dragover"])
  el("dropzone").addEventListener(name, (e) => {
    e.preventDefault();
    if (!busy) el("dropzone").classList.add("dragging");
  });
for (const name of ["dragleave", "drop"])
  el("dropzone").addEventListener(name, (e) => {
    e.preventDefault();
    el("dropzone").classList.remove("dragging");
  });
el("dropzone").addEventListener("drop", (event) => {
  const files = (event as DragEvent).dataTransfer?.files;
  if (files?.length && !busy) {
    if (files.length !== 1) error(t("msg.oneFile"));
    else void openFile(files[0]);
  }
});
function pointer(event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(
    rect.width / image!.width,
    rect.height / image!.height,
  );
  return {
    x: Math.round(
      Math.max(
        0,
        Math.min(
          image!.width,
          (event.clientX -
            rect.left -
            (rect.width - image!.width * scale) / 2) /
            scale,
        ),
      ),
    ),
    y: Math.round(
      Math.max(
        0,
        Math.min(
          image!.height,
          (event.clientY -
            rect.top -
            (rect.height - image!.height * scale) / 2) /
            scale,
        ),
      ),
    ),
  };
}
canvas.addEventListener("pointerdown", (event) => {
  if (!image || busy) return;
  dragging = pointer(event);
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!dragging || !image) return;
  const p = pointer(event);
  crop = {
    x0: Math.min(p.x, dragging.x),
    y0: Math.min(p.y, dragging.y),
    x1: Math.max(p.x, dragging.x),
    y1: Math.max(p.y, dragging.y),
  };
  syncCrop();
});
for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
  canvas.addEventListener(name, () => {
    dragging = undefined;
  });
for (const key of ["x0", "y0", "x1", "y1"] as const)
  el<HTMLInputElement>(key).addEventListener("input", () => {
    crop[key] = Number(el<HTMLInputElement>(key).value);
    invalidateResult();
    refresh();
    if (image && validateCrop(crop, image.width, image.height)) draw();
  });
el("rotate").addEventListener("click", () => {
  if (image && !busy) {
    image = rotateClockwise(image);
    showImage();
  }
});
el("full-crop").addEventListener("click", () => {
  if (image) {
    crop = { x0: 0, y0: 0, x1: image.width, y1: image.height };
    syncCrop();
  }
});
for (const input of [
  sex,
  dob,
  exam,
  heightCm,
  heightFatherCm,
  heightMotherCm,
])
  input.addEventListener("input", () => {
    invalidateResult();
    refresh();
  });

function finishWorker() {
  if (worker) {
    worker.onmessage = worker.onerror = null;
    worker.terminate();
  }
  worker = undefined;
  setBusy(false);
}
function run(mode: "prepare" | "infer") {
  if (busy) return;
  if (mode === "infer" && (!image || !sex.value)) return;
  // terminate() does not retract a message the worker already posted, so a
  // result can still arrive after a reset that cleared the examination fields.
  const generation = ++fileGeneration;
  el("error").hidden = el("notice").hidden = true;
  invalidateResult();
  setBusy(true);
  el("progress-label").textContent = t("progress.model");
  el("progress-percent").textContent = "";
  el<HTMLProgressElement>("progress").value = 0;
  el("progress-detail").textContent =
    mode === "infer" ? t("progress.infer") : t("progress.prepare");
  worker = new Worker(new URL("./inference.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onerror = (event) => {
    if (generation !== fileGeneration) return;
    error(event.message || t("msg.workerStopped"));
    finishWorker();
  };
  worker.onmessage = ({ data }) => {
    if (generation !== fileGeneration) return;
    if (data.type === "progress") {
      const stages: Record<string, Key> = {
        cache: "progress.cache",
        download: "progress.download",
        compute: "progress.compute",
        done: "progress.done",
      };
      el("progress-label").textContent = t("progress.fold", {
        stage: t(stages[data.stage]),
        fold: data.fold + 1,
      });
      const percent = Math.round(
        (100 *
          (data.fold +
            (data.stage === "compute"
              ? 0.7
              : data.stage === "done"
                ? 1
                : data.fraction * (mode === "infer" ? 0.65 : 1)))) /
          3,
      );
      el<HTMLProgressElement>("progress").value = percent;
      el("progress-percent").textContent = `${percent}%`;
    } else if (data.type === "notice") notice(data.message);
    else if (data.type === "error") {
      error(data.message);
      finishWorker();
    } else if (data.type === "ready") {
      finishWorker();
      status("model.ready");
      if (el("notice").hidden) notice(t("msg.readyNotice"));
    } else if (data.type === "result") {
      result = {
        ...data,
        sex: sex.value as "male" | "female",
        dob: dob.value,
        examDate: exam.value,
        heightCm: heightCm.value,
        heightFatherCm: heightFatherCm.value,
        heightMotherCm: heightMotherCm.value,
      };
      modelMonths = result!.months;
      editedMonths = nearestStandardAge(modelMonths, result!.sex);
      setBoneAgeInputs(editedMonths);
      // Individual network estimates before averaging, not snapped to any
      // atlas plate: a wide spread flags a case the model itself is unsure
      // about, invisible in the averaged headline figure alone.
      el("result-folds").textContent = t("result.foldsCaption", {
        values: [...result!.folds]
          .sort((a, b) => a - b)
          .map((fold) => ageText(fold))
          .join(", "),
      });
      boneAgeHint.hidden = true;
      updateReferenceImage();
      finishWorker();
      showResult(result!, true);
      status("model.executed");
    }
  };
  worker.postMessage({
    base,
    weightsBase,
    mode,
    image: mode === "infer" ? image : undefined,
    crop,
    sex: sex.value,
  });
}
el("prepare").addEventListener("click", () => run("prepare"));
el("analysis-form").addEventListener("submit", (e) => {
  e.preventDefault();
  refresh();
  if (!el<HTMLButtonElement>("analyze").disabled) run("infer");
});
el("cancel").addEventListener("click", () => {
  ++fileGeneration;
  finishWorker();
  notice(t("msg.cancelled"));
});
el("clear-cache").addEventListener("click", async () => {
  try {
    for (const key of await caches.keys())
      if (
        key.startsWith("bone-age-weights-") ||
        key === "bone-age-model-metadata"
      )
        await caches.delete(key);
    status("model.cleared");
    notice(t("msg.cacheCleared"));
  } catch {
    error(t("msg.cacheBlocked"));
  }
});
const resultChrono = (r: Result) => {
  if (!r.dob) return undefined;
  try {
    return chronologicalMonths(r.dob, r.examDate);
  } catch {
    return undefined;
  }
};
function showResult(r: Result, scroll = false) {
  renderReport(reportInput(r));
  el("result").hidden = false;
  if (scroll)
    el("result").scrollIntoView({ behavior: "smooth", block: "start" });
}
function reportInput(r: Result): ReportInput {
  return {
    months: editedMonths ?? r.months,
    sex: r.sex,
    chronologicalMonths: resultChrono(r),
    heightCm: r.heightCm ? Number(r.heightCm) : undefined,
    heightFatherCm: r.heightFatherCm ? Number(r.heightFatherCm) : undefined,
    heightMotherCm: r.heightMotherCm ? Number(r.heightMotherCm) : undefined,
    locale: t("app.locale"),
    labels: reportLabels(),
  };
}
function reportLabels(): ReportLabels {
  return {
    notInformedValue: t("result.noChrono"),
    notComputedValue: t("result.notComputed"),
    monthsValueTemplate: t("result.monthsValue"),
    befundHeading: t("befund.heading"),
    befundBoneAgeLabel: t("befund.boneAgeLabel"),
    befundChronoLabel: t("befund.chronoLabel"),
    befundStdDevLabel: t("befund.stddevLabel"),
    befundRangeLabel: t("befund.rangeLabel"),
    befundAgeValueTemplate: t("befund.ageValueTemplate"),
    befundRangeValueTemplate: t("befund.rangeValueTemplate"),
    befundIntro: t("befund.intro"),
    befundRetardation: t("befund.retardation"),
    befundAcceleration: t("befund.acceleration"),
    befundNormal: t("befund.normal"),
    befundOutOfRange: t("befund.outOfRange"),
    befundCitation: t("befund.citation"),
    heightHeading: t("height.heading"),
    heightCurrentLabel: t("height.currentLabel"),
    heightCategoryLabel: t("height.categoryLabel"),
    heightCategoryAverage: t("height.categoryAverage"),
    heightCategoryAccelerated: t("height.categoryAccelerated"),
    heightCategoryRetarded: t("height.categoryRetarded"),
    heightPmhLabel: t("height.pmhLabel"),
    heightPredictedLabel: t("height.predictedLabel"),
    heightCmValueTemplate: t("height.cmValueTemplate"),
    heightPercentValueTemplate: t("height.percentValueTemplate"),
    heightOutOfRange: t("height.outOfRange"),
    heightCitation: t("height.citation"),
    targetHeading: t("target.heading"),
    targetLabel: t("target.label"),
    targetValueTemplate: t("target.valueTemplate"),
    targetCitation: t("target.citation"),
  };
}
el("befund-copy").addEventListener("click", () => {
  const b = currentBefund();
  if (!b || b.outOfRange) return;
  const rows: [string, string][] = [
    [b.boneAgeLabel, b.boneAgeValue],
    [b.chronoLabel, b.chronoValue],
    [b.stdDevLabel, b.stdDevValue],
    [b.rangeLabel, b.rangeValue],
  ];
  // Every rich-text layout attempt (a <table>; a table-free <div>/<span>
  // side-by-side layout; a single <div style="white-space:pre-wrap"> with
  // an inline Arial/9.5pt style) ended up mangled in the reader's target
  // app (Word, Apple Notes, Apple Pages): either "upgraded" into an
  // editable table/box, or - the div attempt - had its style attribute
  // (and with it white-space:pre-wrap) stripped on paste, collapsing every
  // run of spaces/tabs/newlines into a single space and losing all
  // structure. Plain text has no style to strip and no tag to "upgrade":
  // this is the one clipboard flavour offered now, no text/html fallback.
  // Font (Arial 9.5pt) can no longer travel with it; the tradeoff favours
  // the text actually arriving as separate, aligned lines.
  const padTo = (label: string, width: number) => label.padEnd(width, " ");
  const LABEL_WIDTH = 30;
  const lines = [
    ...rows.map(([label, value]) => `${padTo(label, LABEL_WIDTH)}${value}`),
    "",
    b.conclusion,
  ];
  const height = currentHeightPrediction();
  if (height?.state === "ok") {
    // Longest label here ("Erreichter Anteil der Erwachsenengrösse:") is
    // well past the Befund block's LABEL_WIDTH, so this block gets its own
    // padding width - the two blocks are visually separated by the heading
    // and a blank line, so they don't need to share a column position.
    const HEIGHT_LABEL_WIDTH = 44;
    const heightRows: [string, string][] = [
      [height.currentLabel, height.currentValue],
      [height.categoryLabel, height.categoryValue],
      [height.pmhLabel, height.pmhValue],
      [height.predictedLabel, height.predictedValue],
    ];
    lines.push(
      "",
      height.heading,
      ...heightRows.map(
        ([label, value]) => `${padTo(label, HEIGHT_LABEL_WIDTH)}${value}`,
      ),
    );
  }
  const target = currentTargetHeight();
  if (target) lines.push("", target.heading, `${target.label} ${target.value}`);
  const text = lines.join("\n");
  void (async () => {
    try {
      await navigator.clipboard.writeText(text);
      notice(t("befund.copied"));
    } catch {
      error(t("befund.copyFailed"));
    }
  })();
});
el("reset").addEventListener("click", () => {
  ++fileGeneration;
  finishWorker();
  invalidateResult();
  image = undefined;
  filename = "";
  dragging = undefined;
  source.width = source.height = canvas.width = canvas.height = 0;
  sex.value = dob.value = fileInput.value = heightCm.value =
    heightFatherCm.value = heightMotherCm.value = "";
  exam.value = today();
  el("viewer").hidden = true;
  el("dropzone").hidden = false;
  el("error").hidden = el("notice").hidden = true;
  el("image-format").textContent = t("image.localFile");
  el("file-info").textContent = "";
  refresh();
});
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  // Updates are offered, never forced: reloading during an analysis would throw
  // away minutes of local computation.
  let updating = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updating) location.reload();
  });
  navigator.serviceWorker
    .register(new URL("sw.js", base), { scope: new URL("./", base).pathname })
    .then((registration) => {
      const offer = (worker: ServiceWorker | null) => {
        // With no controller this is the first install, not an update.
        if (!worker || !navigator.serviceWorker.controller) return;
        const show = () => {
          if (worker.state !== "installed") return;
          const box = el("notice");
          box.textContent = `${t("msg.updateAvailable")} `;
          const button = document.createElement("button");
          button.type = "button";
          button.className = "text-button";
          button.textContent = t("msg.updateNow");
          button.addEventListener("click", () => {
            updating = true;
            worker.postMessage({ type: "skip-waiting" });
          });
          box.append(button);
          box.hidden = false;
        };
        show();
        worker.addEventListener("statechange", show);
      };
      offer(registration.waiting);
      registration.addEventListener("updatefound", () =>
        offer(registration.installing),
      );
    })
    .catch(() => notice(t("msg.noOffline")));
}
// Static copy carries data-i18n (text), data-i18n-html (text with markup) and
// the attribute variants below. Values come from our own dictionary, never from
// user input, so innerHTML is safe here.
const I18N_ATTRIBUTES: [string, string, string][] = [
  ["[data-i18n-title]", "title", "i18nTitle"],
  ["[data-i18n-aria-label]", "aria-label", "i18nAriaLabel"],
  ["[data-i18n-content]", "content", "i18nContent"],
];
function applyTranslations() {
  document.documentElement.lang = t("app.htmlLang");
  for (const node of document.querySelectorAll<HTMLElement>("[data-i18n]"))
    node.textContent = t(node.dataset.i18n as Key);
  for (const node of document.querySelectorAll<HTMLElement>("[data-i18n-html]"))
    node.innerHTML = t(node.dataset.i18nHtml as Key);
  for (const [selector, attribute, dataset] of I18N_ATTRIBUTES)
    for (const node of document.querySelectorAll<HTMLElement>(selector))
      node.setAttribute(attribute, t(node.dataset[dataset] as Key));
}
applyTranslations();
el("model-status").textContent = t(statusKey);
el("image-format").textContent = t("image.localFile");
refresh();
