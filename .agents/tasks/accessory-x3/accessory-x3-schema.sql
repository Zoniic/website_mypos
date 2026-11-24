-- Accessory X3 schema change: accessories get price, stock, gallery, spec PDF, video,
-- per-language specs and a "works with" list of machines.
-- ADDITIVE ONLY: new columns with defaults and one new link table. Nothing is removed or emptied.
-- Needs the owner's approval before it runs on the shared database.
-- Run with: .agents/tasks/accessory-x3/apply-schema.ts (--check, --backup, --apply)
-- Undo: .agents/tasks/accessory-x3/accessory-x3-undo.sql
-- Generated with: prisma migrate diff --from-schema-datamodel <old> --to-schema-datamodel prisma/schema.prisma --script

-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "datasheetUrl" TEXT,
ADD COLUMN     "galleryUrls" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "leadTimeDays" INTEGER,
ADD COLUMN     "priceFrom" INTEGER,
ADD COLUMN     "stockStatus" TEXT NOT NULL DEFAULT 'in_stock',
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "AccessoryTranslation" ADD COLUMN     "specs" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "_AccessoryCompatibleProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AccessoryCompatibleProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AccessoryCompatibleProducts_B_index" ON "_AccessoryCompatibleProducts"("B");

-- AddForeignKey
ALTER TABLE "_AccessoryCompatibleProducts" ADD CONSTRAINT "_AccessoryCompatibleProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessoryCompatibleProducts" ADD CONSTRAINT "_AccessoryCompatibleProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
