import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from "@/lib/supabase";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function saveUploadedFile(
  file: File,
  extension: string,
  folder: string,
  baseName: string
): Promise<string> {
  const safeBaseName = baseName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const path = `${folder}/${safeBaseName}-${Date.now()}.${extension}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
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
    throw new Error(`Image is too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)}MB).`);
  }

  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error("Image must be JPG, PNG, or WebP.");
  }

  return saveUploadedFile(file, extension, folder, baseName);
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
    throw new Error(`PDF is too large (max ${MAX_PDF_BYTES / (1024 * 1024)}MB).`);
  }

  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF.");
  }

  return saveUploadedFile(file, "pdf", folder, baseName);
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
