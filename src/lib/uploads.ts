import { getSupabaseAdmin, SUPABASE_STORAGE_BUCKET } from "@/lib/supabase";
import { signatureMatchesMime } from "@/lib/imageSignature";
import { convertToWebp } from "@/lib/imageProcess";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const FAIL = "บันทึกไม่สำเร็จ: ";

function mb(bytes: number): string {
  return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;
}

// Thai upload error wording approved in the Figma "Upload errors" page (F7b).
// Every message starts with "บันทึกไม่สำเร็จ:" and names the file.
const msg = {
  imageNotReal: (n: string) =>
    `${FAIL}ไฟล์ “${n}” ไม่ใช่รูป JPG, PNG หรือ WebP จริง อาจเป็นไฟล์ชนิดอื่นที่เปลี่ยนนามสกุล กรุณาเลือกไฟล์รูปใหม่`,
  imageUnsupported: (n: string) => `${FAIL}ไฟล์ “${n}” ไม่รองรับ ใช้ได้เฉพาะ JPG, PNG หรือ WebP`,
  imageTooBig: (n: string, size: number) =>
    `${FAIL}รูป “${n}” ใหญ่ ${mb(size)} เกินกำหนด ${mb(MAX_IMAGE_BYTES)} กรุณาย่อรูปก่อนอัปโหลด`,
  imageCorrupt: (n: string) =>
    `${FAIL}เปิดรูป “${n}” ไม่ได้ ไฟล์อาจเสียหรือดาวน์โหลดมาไม่ครบ กรุณาลองไฟล์อื่น`,
  imageHugePixels: (n: string) =>
    `${FAIL}รูป “${n}” มีขนาดภาพใหญ่เกินไป กรุณาย่อให้ด้านยาวไม่เกิน 5000 px`,
  pdfNotReal: (n: string) => `${FAIL}ไฟล์ “${n}” ไม่ใช่ PDF จริง กรุณาเลือกไฟล์ PDF`,
  pdfTooBig: (n: string, size: number) =>
    `${FAIL}PDF “${n}” ใหญ่ ${mb(size)} เกินกำหนด ${mb(MAX_PDF_BYTES)}`,
  heroWrongType: `${FAIL}ไฟล์พื้นหลังต้องเป็นวิดีโอ MP4 หรือรูป JPG, PNG, WebP`,
  videoTooBig: (n: string, size: number) =>
    `${FAIL}วิดีโอ “${n}” ใหญ่ ${mb(size)} เกินกำหนด ${mb(MAX_VIDEO_BYTES)} กรุณาตัดให้สั้นลงหรือลดความละเอียด`,
  storageDown: `${FAIL}อัปโหลดไม่สำเร็จ ระบบเก็บไฟล์ไม่ตอบ กรุณาลองใหม่อีกครั้ง ถ้ายังไม่ได้แจ้งผู้ดูแลเว็บ`,
};

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
    console.error(`Storage upload failed: ${error.message}`);
    throw new Error(msg.storageDown);
  }
  const { data } = supabaseAdmin.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Checks the signature, resizes (max 2000 px) and re-encodes to WebP, then
 * stores the result as `.webp`. Throws a Thai message for a bad or corrupt file.
 */
async function saveImageAsWebp(file: File, folder: string, baseName: string): Promise<string> {
  const bytes = await readVerifiedBytes(file, msg.imageNotReal(file.name));
  let webp: Buffer;
  try {
    webp = await convertToWebp(bytes);
  } catch (error) {
    const tooManyPixels = error instanceof Error && /pixel limit/i.test(error.message);
    throw new Error(tooManyPixels ? msg.imageHugePixels(file.name) : msg.imageCorrupt(file.name));
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
  if (file.size > MAX_IMAGE_BYTES) throw new Error(msg.imageTooBig(file.name, file.size));
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error(msg.imageUnsupported(file.name));
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
  if (file.size > MAX_PDF_BYTES) throw new Error(msg.pdfTooBig(file.name, file.size));
  if (file.type !== "application/pdf") throw new Error(msg.pdfNotReal(file.name));
  const bytes = await readVerifiedBytes(file, msg.pdfNotReal(file.name));
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
    if (file.size > MAX_VIDEO_BYTES) throw new Error(msg.videoTooBig(file.name, file.size));
    if (file.type !== "video/mp4") throw new Error(msg.heroWrongType);
    const bytes = await readVerifiedBytes(file, msg.heroWrongType);
    return saveUploadedFile(bytes, file.type, "mp4", folder, baseName);
  }
  if (file.size > MAX_IMAGE_BYTES) throw new Error(msg.imageTooBig(file.name, file.size));
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error(msg.heroWrongType);
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
