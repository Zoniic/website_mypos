import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const uploadsRoot = path.join(process.cwd(), "public", "uploads");

/**
 * Saves an uploaded image file to public/uploads/{folder}/ and returns its
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

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error("Image must be JPG, PNG, or WebP.");
  }

  const safeBaseName = baseName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const filename = `${safeBaseName}-${Date.now()}.${extension}`;

  const dir = path.join(uploadsRoot, folder);
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${folder}/${filename}`;
}

/** Saves multiple gallery images, skipping empty file inputs. */
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
