import { getSupabaseAdmin, SUPABASE_STORAGE_BUCKET } from "@/lib/supabase";
import { signatureMatchesMime } from "@/lib/imageSignature";
import { convertToWebp } from "@/lib/imageProcess";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_TYPE_MESSAGE = "ไฟล์ต้องเป็นรูป JPG, PNG หรือ WebP ที่เปิดได้จริง";
const IMAGE_DECODE_MESSAGE = "เปิดรูปนี้ไม่ได้ ไฟล์อาจเสียหาย ลองบันทึกรูปใหม่แล้วอัปโหลดอีกครั้ง";
/**
 * Reads the file and checks that its first bytes really are the type the
 * browser declared (the declared MIME type alone can be wrong or forged).
 */
export async function readVerifiedBytes(file: File, badTypeMessage: string): Promise<Buffer> {
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!signatureMatchesMime(bytes, file.type)) throw new Error(badTypeMessage);
  return bytes;
}
async function saveUploadedFile(
  bytes: Buffer,
  contentType: string,
  extension: string,
  folder: string,
  baseName: string
): Promise<string> {
  const safeBaseName = baseName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const path = `${folder}/${safeBaseName}-${Date.now()}.${extension}`;
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  const { data } = supabaseAdmin.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
/**
 * Checks the signature, resizes (max 2000 px) and re-encodes to WebP, then
 * stores the result as `.webp`. Throws a Thai message for a bad or corrupt file.
 */
async function saveImageAsWebp(file: File, folder: string, baseName: string): Promise<string> {
  const bytes = await readVerifiedBytes(file, IMAGE_TYPE_MESSAGE);
  let webp: Buffer;
  try {
    webp = await convertToWebp(bytes);
  } catch {
    throw new Error(IMAGE_DECODE_MESSAGE);
  }
  return saveUploadedFile(webp, "image/webp", "webp", folder, baseName);
}
/**
 * Uploads an image file to the Supabase Storage bucket and returns its
 * public URL. Returns null if no file was provided (so callers can leave
 * the existing image untouched on edit forms). Throws a user-facing message
 * string on validation failure (caller should surface it as a form error).
 */
export async function saveUploadedImage(
  file: File | null,
  folder: string,
  baseName: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`รูปใหญ่เกินไป (สูงสุด ${MAX_IMAGE_BYTES / (1024 * 1024)}MB)`);
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(IMAGE_TYPE_MESSAGE);
  }
  return saveImageAsWebp(file, folder, baseName);
}
/**
 * Uploads a PDF to the Supabase Storage bucket and returns its public URL.
 * Same null/error conventions as saveUploadedImage.
 */
export async function saveUploadedPdf(
  file: File | null,
  folder: string,
  baseName: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_PDF_BYTES) {
    throw new Error(`ไฟล์ PDF ใหญ่เกินไป (สูงสุด ${MAX_PDF_BYTES / (1024 * 1024)}MB)`);
  }
  if (file.type !== "application/pdf") {
    throw new Error("ไฟล์ต้องเป็น PDF ที่เปิดได้จริง");
  }
  const bytes = await readVerifiedBytes(file, "ไฟล์ต้องเป็น PDF ที่เปิดได้จริง");
  return saveUploadedFile(bytes, file.type, "pdf", folder, baseName);
}
/**
 * Uploads a hero background asset (either a short .mp4 clip or a still
 * image) to the Supabase Storage bucket and returns its public URL. Same
 * null/error conventions as saveUploadedImage/saveUploadedPdf. Which kind
 * of file was uploaded is later inferred from the URL's extension by the
 * caller (Hero.tsx) — no separate "type" field is stored. Videos are stored
 * as-is (signature checked, not transcoded); images are resized to WebP.
 */
export async function saveUploadedHeroBackground(
  file: File | null,
  folder: string,
  baseName: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(`วิดีโอใหญ่เกินไป (สูงสุด ${MAX_VIDEO_BYTES / (1024 * 1024)}MB)`);
    }
    if (file.type !== "video/mp4") {
      throw new Error("วิดีโอต้องเป็นไฟล์ MP4");
    }
    const bytes = await readVerifiedBytes(file, "วิดีโอต้องเป็นไฟล์ MP4 ที่เปิดได้จริง");
    return saveUploadedFile(bytes, file.type, "mp4", folder, baseName);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`รูปใหญ่เกินไป (สูงสุด ${MAX_IMAGE_BYTES / (1024 * 1024)}MB)`);
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("ไฟล์ต้องเป็น MP4, JPG, PNG หรือ WebP");
  }
  return saveImageAsWebp(file, folder, baseName);
}
/** Uploads multiple gallery images, skipping empty file inputs. */
export async function saveUploadedImages(
  files: File[],
  folder: string,
  baseName: string
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await saveUploadedImage(files[i], folder, `${baseName}-${i + 1}`);
    if (url) urls.push(url);
  }
  return urls;
}
