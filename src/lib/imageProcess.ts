import sharp from "sharp";

export const MAX_IMAGE_DIMENSION = 2000;
const WEBP_QUALITY = 82;
const MAX_INPUT_PIXELS = 50_000_000; // 50 MP, guards against decompression bombs

/**
 * Normalises an uploaded image: applies EXIF orientation, fits it inside
 * 2000 x 2000 px (never enlarges), strips metadata (GPS etc.) and encodes
 * WebP. Alpha is kept so logos stay transparent. Throws on undecodable input.
 */
export async function convertToWebp(input: Buffer): Promise<Buffer> {
  return sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}
