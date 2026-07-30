-- AlterTable Contract
ALTER TABLE "Contract" ADD COLUMN "cancellationReason" TEXT;

-- CreateIndex
CREATE INDEX "Contract_contractCode_idx" ON "Contract"("contractCode");
