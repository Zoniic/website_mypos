-- Undo of accessory-x3-schema.sql. Drops ONLY the objects that file added.
-- WARNING: deletes whatever was typed into the new fields (prices, specs, "works with" links).
-- Run only after the code that uses them has been rolled back.
DROP TABLE IF EXISTS "_AccessoryCompatibleProducts";
ALTER TABLE "AccessoryTranslation" DROP COLUMN IF EXISTS "specs";
ALTER TABLE "Accessory" DROP COLUMN IF EXISTS "videoUrl",
DROP COLUMN IF EXISTS "stockStatus",
DROP COLUMN IF EXISTS "priceFrom",
DROP COLUMN IF EXISTS "leadTimeDays",
DROP COLUMN IF EXISTS "galleryUrls",
DROP COLUMN IF EXISTS "datasheetUrl";
