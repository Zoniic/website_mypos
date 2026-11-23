/**
 * File signature ("magic bytes") detection. Browsers report the MIME type
 * from the file extension, so it can be wrong or forged; the first bytes of
 * the file cannot be. Pure and dependency-free so it can be self-tested.
 */
export type FileKind = "jpeg" | "png" | "webp" | "pdf" | "mp4";

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

/** Returns the detected kind, or null when the bytes match none of the allowed formats. */
export function detectFileKind(bytes: Uint8Array): FileKind | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  // WebP: "RIFF" <4 byte size> "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "webp";
  }
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf"; // "%PDF-"
  // MP4: "ftyp" box type at bytes 4..8
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return "mp4";
  return null;
}

/** Declared MIME type -> the kind its bytes must have. */
export const KIND_BY_MIME: Record<string, FileKind> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
};

/** True when the bytes really are the kind the declared MIME type claims. */
export function signatureMatchesMime(bytes: Uint8Array, mime: string): boolean {
  const expected = KIND_BY_MIME[mime];
  return !!expected && detectFileKind(bytes) === expected;
}
