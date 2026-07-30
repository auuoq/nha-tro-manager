-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'BANK_WEBHOOK';
ALTER TYPE "PaymentMethod" ADD VALUE 'OTHER';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "refundAmount" DECIMAL(12,0) NOT NULL DEFAULT 0,
ADD COLUMN "overpaymentAmount" DECIMAL(12,0) NOT NULL DEFAULT 0,
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "matchedInvoiceId" TEXT,
    "matchedPaymentId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_matchedInvoiceId_idx" ON "WebhookEvent"("matchedInvoiceId");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");
