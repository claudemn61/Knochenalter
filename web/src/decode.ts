import dicomParser from "dicom-parser";
import UTIF from "utif";
import type { GrayImage } from "./types";
import { t } from "./i18n";

// Sanity ceiling only - rejects clearly malformed dimensions. Actual working
// resolution is capped much lower (see MAX_WORKING_DIMENSION below); nothing
// here needs to hold a full-resolution 48-108 MP phone photo in memory.
const MAX_PIXELS = 80_000_000;
// Long-edge cap for the decoded working copy (crop UI, review zoom, the
// pixels kept in memory and sent to the model). Modern phone cameras
// routinely produce 48-108 MP photos; decoding and grayscale-converting
// that at full resolution risks running a phone browser tab out of memory
// (silently - no catchable error, the page just stops responding). The
// model itself resizes everything to 512x512 regardless, and 4000px on the
// long edge is still ample detail for manually cropping the hand by eye.
const MAX_WORKING_DIMENSION = 4000;
function dimensions(width: number, height: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > MAX_PIXELS
  ) {
    throw new Error(t("decode.badSize"));
  }
}
function isoDate(s?: string) {
  return s && /^\d{8}$/.test(s)
    ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
    : undefined;
}
function fromRGBA(
  rgba: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
) {
  const pixels = new Uint8Array(width * height);
  for (let i = 0; i < pixels.length; i++) {
    // Match OpenCV grayscale weights; composite transparent pixels onto black.
    pixels[i] = Math.round(
      ((0.299 * rgba[4 * i] +
        0.587 * rgba[4 * i + 1] +
        0.114 * rgba[4 * i + 2]) *
        rgba[4 * i + 3]) /
        255,
    );
  }
  return pixels;
}
async function decodeBitmap(
  blob: Blob,
  allowDownscale = false,
): Promise<Pick<GrayImage, "pixels" | "width" | "height">> {
  const bitmap = await createImageBitmap(blob);
  try {
    dimensions(bitmap.width, bitmap.height);
    // The DICOM-embedded-JPEG path (allowDownscale=false) must come back at
    // exactly the DICOM's declared size, which the caller checks; only the
    // plain-photo path may shrink a huge source down to a working copy.
    const scale = allowDownscale
      ? Math.min(1, MAX_WORKING_DIMENSION / Math.max(bitmap.width, bitmap.height))
      : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bitmap, 0, 0, width, height);
    return {
      pixels: fromRGBA(ctx.getImageData(0, 0, width, height).data, width, height),
      width,
      height,
    };
  } finally {
    bitmap.close();
  }
}

async function decodeDicom(bytes: Uint8Array): Promise<GrayImage> {
  let ds: ReturnType<typeof dicomParser.parseDicom>;
  try {
    ds = dicomParser.parseDicom(bytes);
  } catch {
    throw new Error(
      t("decode.dicomUnreadable"),
    );
  }
  const width = ds.uint16("x00280011")!,
    height = ds.uint16("x00280010")!;
  dimensions(width, height);
  if (Number(ds.string("x00280008") || 1) !== 1)
    throw new Error(
      t("decode.dicomMultiframe"),
    );
  const photo = ds.string("x00280004")?.trim();
  if (!["MONOCHROME1", "MONOCHROME2"].includes(photo || ""))
    throw new Error(t("decode.dicomMonochrome"));
  if ((ds.uint16("x00280002") || 1) !== 1)
    throw new Error(t("decode.dicomChannels"));
  const ts = ds.string("x00020010")?.trim();
  const element = ds.elements.x7fe00010;
  if (!element) throw new Error(t("decode.noPixels"));
  const metadata = {
    sex: ({ M: "male", F: "female" } as const)[
      ds.string("x00100040") as "M" | "F"
    ],
    dob: isoDate(ds.string("x00100030")),
    examDate: isoDate(ds.string("x00080020")),
  };
  let values: Float64Array;
  const bits = ds.uint16("x00280100")!,
    stored = ds.uint16("x00280101") || bits;
  const signed = ds.uint16("x00280103") === 1;
  if (ts === "1.2.840.10008.1.2.4.50") {
    const jpeg = dicomParser.readEncapsulatedImageFrame(ds, element, 0);
    const decoded = await decodeBitmap(
      new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" }),
    );
    if (decoded.width !== width || decoded.height !== height)
      throw new Error(t("decode.dicomJpegSize"));
    values = Float64Array.from(decoded.pixels);
  } else {
    if (
      ![
        "1.2.840.10008.1.2",
        "1.2.840.10008.1.2.1",
        "1.2.840.10008.1.2.2",
      ].includes(ts || "")
    ) {
      throw new Error(
        t("decode.dicomCompression", {
          transfer: ts || t("decode.unknownTransfer"),
        }),
      );
    }
    if (
      ![8, 16].includes(bits) ||
      stored < 1 ||
      stored > bits ||
      (ds.uint16("x00280102") ?? stored - 1) !== stored - 1
    ) {
      throw new Error(
        t("decode.dicomBits"),
      );
    }
    const n = width * height,
      size = bits / 8;
    if (
      element.length < n * size ||
      element.dataOffset + n * size > bytes.length
    )
      throw new Error(t("decode.truncated"));
    const view = new DataView(
      bytes.buffer,
      bytes.byteOffset + element.dataOffset,
      n * size,
    );
    const little = ts !== "1.2.840.10008.1.2.2",
      mask = (1 << stored) - 1;
    values = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let v =
        (bits === 8 ? view.getUint8(i) : view.getUint16(i * 2, little)) & mask;
      if (signed && v >= 2 ** (stored - 1)) v -= 2 ** stored;
      values[i] = v;
    }
  }

  // Same order as upstream load_image_from_dicom: VOI, MONOCHROME1, min/max.
  const lut = ds.elements.x00283010?.items?.[0]?.dataSet;
  if (lut?.elements.x00283002 && lut.elements.x00283006) {
    const count = lut.uint16("x00283002", 0) || 65536;
    const first = signed
      ? lut.int16("x00283002", 1)!
      : lut.uint16("x00283002", 1)!;
    const depth = lut.uint16("x00283002", 2)!;
    if (![8, 10, 11, 12, 13, 14, 15, 16].includes(depth))
      throw new Error(t("decode.dicomLut"));
    const data = lut.elements.x00283006;
    const word = data.length >= count * 2;
    if (data.length < count * (word ? 2 : 1))
      throw new Error("VOI LUT truncada.");
    for (let i = 0; i < values.length; i++) {
      const index = Math.max(
        0,
        Math.min(count - 1, Math.trunc(values[i]) - first),
      );
      values[i] = word
        ? lut.uint16("x00283006", index)!
        : lut.byteArray[data.dataOffset + index];
    }
  } else {
    const center = Number.parseFloat(ds.string("x00281050") || "NaN");
    const window = Number.parseFloat(ds.string("x00281051") || "NaN");
    const func = ds.string("x00281056")?.trim() || "LINEAR";
    if (Number.isFinite(center) && Number.isFinite(window)) {
      if (
        !["LINEAR", "LINEAR_EXACT", "SIGMOID"].includes(func) ||
        window < (func === "LINEAR" ? 1 : Number.MIN_VALUE)
      ) {
        throw new Error(t("decode.dicomWindow"));
      }
      for (let i = 0; i < values.length; i++) {
        if (func === "SIGMOID")
          values[i] = 1 / (1 + Math.exp((-4 * (values[i] - center)) / window));
        else if (func === "LINEAR" && window === 1)
          values[i] = values[i] <= center - 0.5 ? 0 : 1;
        else {
          const c = func === "LINEAR" ? center - 0.5 : center;
          const w = func === "LINEAR" ? window - 1 : window;
          values[i] = Math.max(0, Math.min(1, (values[i] - c) / w + 0.5));
        }
      }
    }
  }
  let min = Infinity,
    max = -Infinity;
  for (const v of values) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  if (!(max > min))
    throw new Error(t("decode.empty"));
  const pixels = new Uint8Array(values.length);
  for (let i = 0; i < pixels.length; i++) {
    const v = photo === "MONOCHROME1" ? max - values[i] : values[i] - min;
    pixels[i] = Math.trunc((v / (max - min)) * 255);
  }
  return { pixels, width, height, format: "DICOM", ...metadata };
}

// HEIC/HEIF: an ISO base media ("ftyp" box) container, the format iPhones
// save photos in by default. Neither Chrome nor Firefox can decode it
// natively, so it is decoded with libheif-js (the actual libheif, compiled
// to run in the browser) instead of createImageBitmap().
//
// The format-identifying brand is not only the "major_brand" (the four
// bytes right after "ftyp") - a file can also declare it only among the
// "compatible_brands" that follow, and different encoders (Android
// manufacturers in particular) are inconsistent about which one carries
// it. Reading every brand the box lists, not just the first, avoids
// silently missing a real HEIF file because of that.
function ftypBrands(bytes: Uint8Array): string[] {
  if (bytes.length < 16) return [];
  if (String.fromCharCode(...bytes.subarray(4, 8)) !== "ftyp") return [];
  const boxSize = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.length,
  ).getUint32(0);
  const end = Math.min(bytes.length, boxSize > 8 ? boxSize : bytes.length);
  const brands: string[] = [];
  // offset 8: major_brand, 12: minor_version (not a brand, harmless to
  // include), 16+: compatible_brands.
  for (let offset = 8; offset + 4 <= end; offset += 4)
    brands.push(String.fromCharCode(...bytes.subarray(offset, offset + 4)));
  return brands;
}
function isHeic(bytes: Uint8Array, file: File): boolean {
  if (/\.hei[cf]$/i.test(file.name) || /^image\/hei[cf]$/.test(file.type))
    return true;
  return ftypBrands(bytes).some((brand) =>
    /^(hei[a-z]|hev[a-z]|mif1|msf1|avif|avis)/.test(brand),
  );
}

// libheif-js ships no type declarations for its high-level HeifDecoder
// wrapper (only for the low-level, auto-generated Emscripten bindings), so
// its shape is declared here for the one call site that needs it.
interface HeifImage {
  get_width(): number;
  get_height(): number;
  display(
    target: { data: Uint8ClampedArray; width: number; height: number },
    callback: (result: { data: Uint8ClampedArray } | undefined) => void,
  ): void;
}
interface LibheifModule {
  HeifDecoder: new () => { decode(bytes: Uint8Array): HeifImage[] };
}

/** Shrinks an already-decoded RGBA buffer to MAX_WORKING_DIMENSION on the
 * long edge, if it exceeds it; a no-op otherwise. Used for HEIC, whose
 * decoder (unlike createImageBitmap) has no built-in resize option. */
function downscaleIfNeeded(
  rgba: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
): { data: Uint8Array | Uint8ClampedArray; width: number; height: number } {
  const scale = Math.min(1, MAX_WORKING_DIMENSION / Math.max(width, height));
  if (scale >= 1) return { data: rgba, width, height };
  // A plain `new Uint8ClampedArray(length)` (unlike wrapping an existing
  // typed array) is the one form TS's lib types back with a concrete
  // ArrayBuffer, which ImageData's constructor requires.
  const clamped = new Uint8ClampedArray(rgba.length);
  clamped.set(rgba);
  const source = new OffscreenCanvas(width, height);
  source.getContext("2d")!.putImageData(new ImageData(clamped, width, height), 0, 0);
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));
  const target = new OffscreenCanvas(outWidth, outHeight);
  const ctx = target.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, outWidth, outHeight);
  return {
    data: ctx.getImageData(0, 0, outWidth, outHeight).data,
    width: outWidth,
    height: outHeight,
  };
}

async function decodeHeic(bytes: Uint8Array): Promise<GrayImage> {
  // Lazy-loaded: the "classic" pure-JS build (no separate .wasm fetch, works
  // synchronously once loaded) adds close to 3 MB, a cost only HEIC imports
  // should pay, not every page load. This is the actual libheif (Emscripten
  // build), current and actively maintained - unlike the abandoned heic2any
  // wrapper this replaced, which failed to decode some real-world HEIF files.
  const { default: libheif } = (await import("libheif-js")) as unknown as {
    default: LibheifModule;
  };
  let images: HeifImage[];
  try {
    images = new libheif.HeifDecoder().decode(bytes);
  } catch {
    images = [];
  }
  // decode() does not throw on an unreadable file; it logs to the console
  // and returns an empty array instead.
  if (!images.length) throw new Error(t("decode.heicFailed"));
  const image = images[0];
  const width = image.get_width(),
    height = image.get_height();
  dimensions(width, height);
  const full = await new Promise<Uint8ClampedArray>((resolve, reject) => {
    image.display(
      { data: new Uint8ClampedArray(width * height * 4), width, height },
      (result) => {
        if (result) resolve(result.data);
        else reject(new Error(t("decode.heicFailed")));
      },
    );
  });
  const working = downscaleIfNeeded(full, width, height);
  return {
    pixels: fromRGBA(working.data, working.width, working.height),
    width: working.width,
    height: working.height,
    format: "HEIC",
  };
}

/** First bytes and metadata as shown to the reader, to diagnose an
 * unrecognised or undecodable file without needing the browser console. */
function diagnostics(file: File, bytes: Uint8Array): string {
  const hex = [...bytes.subarray(0, 16)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
  return `[${file.name || "ohne Namen"} · ${file.type || "kein Typ"} · ${hex}]`;
}

export async function decodeFile(file: File): Promise<GrayImage> {
  if (file.size > 100 * 1024 * 1024)
    throw new Error(t("decode.tooLarge"));
  if (!file.size) throw new Error(t("decode.emptyFile"));
  const buffer = await file.arrayBuffer(),
    bytes = new Uint8Array(buffer);
  const isDicom =
    bytes.length > 132 &&
    String.fromCharCode(...bytes.subarray(128, 132)) === "DICM";
  if (isDicom || /\.dcm$/i.test(file.name)) return decodeDicom(bytes);
  if (isHeic(bytes, file)) return decodeHeic(bytes);
  const isTiff =
    (bytes[0] === 73 && bytes[1] === 73 && bytes[2] === 42) ||
    (bytes[0] === 77 && bytes[1] === 77 && bytes[3] === 42);
  if (isTiff) {
    const pages = UTIF.decode(buffer);
    if (!pages.length) throw new Error(t("decode.tiffEmpty"));
    if (pages.length !== 1)
      throw new Error(
        t("decode.tiffPages"),
      );
    const page = pages[0];
    dimensions((page.t256 as number[])[0], (page.t257 as number[])[0]);
    UTIF.decodeImage(buffer, page);
    const { width, height } = page;
    const working = downscaleIfNeeded(UTIF.toRGBA8(page), width, height);
    return {
      pixels: fromRGBA(working.data, working.width, working.height),
      width: working.width,
      height: working.height,
      format: "TIFF",
    };
  }
  if (
    !/^image\/(png|jpeg|webp|bmp|avif)$/.test(file.type) &&
    !/\.(png|jpe?g|webp|bmp|avif)$/i.test(file.name)
  ) {
    throw new Error(`${t("decode.unknownFormat")} ${diagnostics(file, bytes)}`);
  }
  try {
    return {
      ...(await decodeBitmap(file, true)),
      format: file.name.split(".").pop()!.toUpperCase(),
    };
  } catch (cause) {
    // A specific, already-translated reason (e.g. "too many pixels") is
    // more useful than the generic message replacing it; only unknown
    // failures (the browser's own decoder rejecting the bytes) fall back to it.
    if (cause instanceof Error && cause.message === t("decode.badSize"))
      throw cause;
    throw new Error(`${t("decode.failed")} ${diagnostics(file, bytes)}`);
  }
}
