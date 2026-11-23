/**
 * Self-test for upload hygiene (no network, no database, no Supabase).
 * Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/upload-selftest.ts
 */
import { detectFileKind, signatureMatchesMime } from "../../../src/lib/imageSignature";
import { readVerifiedBytes } from "../../../src/lib/uploads";
import { convertToWebp } from "../../../src/lib/imageProcess";
import sharp from "sharp";

let failed = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
async function rejects(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
}

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const webp = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
const pdf = new TextEncoder().encode("%PDF-1.7\n...");
const mp4 = Uint8Array.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
const text = new TextEncoder().encode("hello, I am not an image");

async function main() {
  check("detects jpeg", detectFileKind(jpeg) === "jpeg");
  check("detects png", detectFileKind(png) === "png");
  check("detects webp", detectFileKind(webp) === "webp");
  check("detects pdf", detectFileKind(pdf) === "pdf");
  check("detects mp4", detectFileKind(mp4) === "mp4");
  check("text is unknown", detectFileKind(text) === null);
  check("empty is unknown", detectFileKind(new Uint8Array()) === null);
  check("RIFF without WEBP is not webp", detectFileKind(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45])) === null);
  check("truncated png is rejected", detectFileKind(png.slice(0, 5)) === null);

  check("png bytes declared png", signatureMatchesMime(png, "image/png"));
  check("text declared png is rejected", !signatureMatchesMime(text, "image/png"));
  check("pdf declared image/jpeg is rejected", !signatureMatchesMime(pdf, "image/jpeg"));
  check("png declared jpeg is rejected", !signatureMatchesMime(png, "image/jpeg"));
  check("unknown MIME is rejected", !signatureMatchesMime(png, "image/gif"));

  const asFile = (b: Uint8Array, name: string, type: string) => new File([b as BlobPart], name, { type });
  check("readVerifiedBytes accepts a real png", (await readVerifiedBytes(asFile(png, "a.png", "image/png"), "bad")).length === png.length);
  check("readVerifiedBytes rejects text renamed .png", await rejects(() => readVerifiedBytes(asFile(text, "x.png", "image/png"), "bad")));

  // --- resize / WebP conversion ---
  const big = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#336699" } }).png().toBuffer();
  const bigOut = await convertToWebp(big);
  const bigMeta = await sharp(bigOut).metadata();
  check("4000x3000 png becomes webp", bigMeta.format === "webp");
  check("4000x3000 fits inside 2000 (2000x1500)", bigMeta.width === 2000 && bigMeta.height === 1500);
  check("converted output has a webp signature", detectFileKind(bigOut) === "webp");

  const small = await sharp({ create: { width: 300, height: 200, channels: 3, background: "#aa0000" } }).jpeg().toBuffer();
  const smallMeta = await sharp(await convertToWebp(small)).metadata();
  check("small image is not enlarged", smallMeta.width === 300 && smallMeta.height === 200);

  const alpha = await sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
  const alphaMeta = await sharp(await convertToWebp(alpha)).metadata();
  check("transparent png keeps alpha", alphaMeta.hasAlpha === true);

  const rotated = await sharp({ create: { width: 100, height: 50, channels: 3, background: "#00aa00" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const rotatedMeta = await sharp(await convertToWebp(rotated)).metadata();
  check("EXIF orientation 6 is applied (100x50 -> 50x100)", rotatedMeta.width === 50 && rotatedMeta.height === 100);
  check("EXIF is stripped", !rotatedMeta.exif);

  const corrupt = Buffer.concat([Buffer.from(png), Buffer.from("not really a png")]);
  check("corrupt png with valid signature fails to convert", await rejects(() => convertToWebp(corrupt)));

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}
main();
