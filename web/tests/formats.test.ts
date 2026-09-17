import { expect, it } from "vitest";
import UTIF from "utif";
import { decodeFile } from "../src/decode";

function dicom(photo = "MONOCHROME2", syntax = "1.2.840.10008.1.2.1") {
  const chunks: Uint8Array[] = [
    new Uint8Array(128),
    new TextEncoder().encode("DICM"),
  ];
  const text = (s: string) =>
    new TextEncoder().encode(s.length % 2 ? s + " " : s);
  const us = (n: number) => {
    const a = new Uint8Array(2);
    new DataView(a.buffer).setUint16(0, n, true);
    return a;
  };
  const tag = (
    group: number,
    element: number,
    vr: string,
    data: Uint8Array,
  ) => {
    const long = vr === "OW",
      h = new Uint8Array(long ? 12 : 8),
      v = new DataView(h.buffer);
    v.setUint16(0, group, true);
    v.setUint16(2, element, true);
    h.set(new TextEncoder().encode(vr), 4);
    if (long) v.setUint32(8, data.length, true);
    else v.setUint16(6, data.length, true);
    chunks.push(h, data);
  };
  tag(2, 16, "UI", text(syntax));
  tag(8, 32, "DA", text("20260101"));
  tag(16, 48, "DA", text("20200101"));
  tag(16, 64, "CS", text("M"));
  tag(40, 2, "US", us(1));
  tag(40, 4, "CS", text(photo));
  tag(40, 16, "US", us(32));
  tag(40, 17, "US", us(32));
  tag(40, 256, "US", us(16));
  tag(40, 257, "US", us(12));
  tag(40, 258, "US", us(11));
  tag(40, 259, "US", us(0));
  const pixels = new Uint8Array(32 * 32 * 2),
    view = new DataView(pixels.buffer);
  for (let i = 0; i < 1024; i++) view.setUint16(i * 2, i, true);
  tag(0x7fe0, 16, "OW", pixels);
  const bytes = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new File([bytes], "SYNTHETIC_NO_EXTENSION");
}

it("reads a synthetic extensionless 16-bit DICOM and extracts only useful metadata", async () => {
  const image = await decodeFile(dicom());
  expect([image.width, image.height, image.format]).toEqual([32, 32, "DICOM"]);
  expect(image.pixels[0]).toBe(0);
  expect(image.pixels[1023]).toBe(255);
  expect([image.sex, image.dob, image.examDate]).toEqual([
    "male",
    "2020-01-01",
    "2026-01-01",
  ]);
});
it("inverts MONOCHROME1 and rejects unsupported compression explicitly", async () => {
  const image = await decodeFile(dicom("MONOCHROME1"));
  expect(image.pixels[0]).toBe(255);
  expect(image.pixels[1023]).toBe(0);
  await expect(
    decodeFile(dicom("MONOCHROME2", "1.2.840.10008.1.2.4.90")),
  ).rejects.toThrow("Nicht unterstützte DICOM-Kompression");
});
it("routes HEIC files past the unknown-format rejection, by extension and by ftyp brand", async () => {
  // Not real HEIC pixel data, so libheif-js can't parse it (logs a warning
  // and returns no images rather than throwing) - which is enough to prove
  // decodeFile() recognises and routes the format, with the dedicated HEIC
  // error, rather than falling through to "Format nicht erkannt".
  const byExtension = new File([new Uint8Array(20)], "photo.heic");
  await expect(decodeFile(byExtension)).rejects.toThrow(
    "HEIC-Bild konnte nicht konvertiert werden",
  );

  const bytes = new Uint8Array(20);
  bytes.set(new TextEncoder().encode("ftyp"), 4);
  bytes.set(new TextEncoder().encode("heic"), 8);
  const byBrand = new File([bytes], "no-extension-attachment");
  await expect(decodeFile(byBrand)).rejects.toThrow(
    "HEIC-Bild konnte nicht konvertiert werden",
  );
});
it("routes HEIF files whose major_brand isn't the HEIF one, but a compatible_brand is", async () => {
  // Real-world case some devices produce: the box's own major_brand is
  // something generic (here "isom", a plain ISO-base brand that alone
  // must not be treated as HEIF - it is also the major_brand of many MP4
  // videos), and only a later compatible_brand actually says "heic". A
  // misleading .jpg name must not override what the bytes say either.
  const box = new Uint8Array(20);
  new DataView(box.buffer).setUint32(0, 20);
  box.set(new TextEncoder().encode("ftyp"), 4);
  box.set(new TextEncoder().encode("isom"), 8);
  box.set(new TextEncoder().encode("heic"), 16);
  const file = new File([box], "IMG_1234.jpg", { type: "image/jpeg" });
  await expect(decodeFile(file)).rejects.toThrow(
    "HEIC-Bild konnte nicht konvertiert werden",
  );
});
it("does not treat a plain MP4/video ftyp box as HEIF", async () => {
  const box = new Uint8Array(20);
  new DataView(box.buffer).setUint32(0, 20);
  box.set(new TextEncoder().encode("ftyp"), 4);
  box.set(new TextEncoder().encode("isom"), 8);
  box.set(new TextEncoder().encode("mp42"), 16);
  const file = new File([box], "clip.mp4", { type: "video/mp4" });
  await expect(decodeFile(file)).rejects.toThrow("Format nicht erkannt");
});
it("still rejects genuinely unrecognised formats", async () => {
  const mystery = new File(
    [new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])],
    "mystery.bin",
  );
  await expect(decodeFile(mystery)).rejects.toThrow("Format nicht erkannt");
});
it("decodes a single-page TIFF locally", async () => {
  const rgba = new Uint8Array(32 * 32 * 4);
  for (let i = 0; i < 1024; i++) {
    rgba[4 * i] = rgba[4 * i + 1] = rgba[4 * i + 2] = i % 256;
    rgba[4 * i + 3] = 255;
  }
  const encoded = UTIF.encodeImage(rgba, 32, 32);
  const image = await decodeFile(new File([encoded], "synthetic.tif"));
  expect([image.width, image.height, image.format]).toEqual([32, 32, "TIFF"]);
  expect(image.pixels[0]).toBe(0);
  expect(image.pixels[255]).toBe(255);
});
