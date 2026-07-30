-- AlterTable RoomAsset
ALTER TABLE "RoomAsset" 
ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "note" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable Tenant: Bổ sung ownerId
ALTER TABLE "Tenant" ADD COLUMN "ownerId" TEXT;

-- Gán giá trị mặc định cho ownerId dữ liệu cũ nếu có
UPDATE "Tenant" SET "ownerId" = (SELECT id FROM "User" WHERE role = 'OWNER' LIMIT 1) WHERE "ownerId" IS NULL;

-- Đặt ownerId NOT NULL sau khi cập nhật dữ liệu
ALTER TABLE "Tenant" ALTER COLUMN "ownerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Tenant_ownerId_idx" ON "Tenant"("ownerId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
