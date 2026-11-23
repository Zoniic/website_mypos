-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "assigneeId" INTEGER;

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "assigneeId" INTEGER;

-- AlterTable
ALTER TABLE "WarrantyClaim" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "assigneeId" INTEGER;

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_assigneeId_idx" ON "ContactMessage"("assigneeId");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteRequest_assigneeId_idx" ON "QuoteRequest"("assigneeId");

-- CreateIndex
CREATE INDEX "WarrantyClaim_status_createdAt_idx" ON "WarrantyClaim"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WarrantyClaim_assigneeId_idx" ON "WarrantyClaim"("assigneeId");

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarrantyClaim" ADD CONSTRAINT "WarrantyClaim_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

