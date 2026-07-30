-- AlterEnum UserRole: Bổ sung SUPER_ADMIN và OWNER
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'OWNER';

-- Chuyển đổi dữ liệu cũ role = 'ADMIN' sang role = 'OWNER' (Skipped due to enum transaction limitation on fresh DB)
-- UPDATE "User" SET role = 'OWNER' WHERE role::text = 'ADMIN';

-- CreateEnum OwnerStatus
CREATE TYPE "OwnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateTable OwnerProfile
CREATE TABLE "OwnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "taxCode" TEXT,
    "address" TEXT,
    "status" "OwnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OwnerProfile_pkey" PRIMARY KEY ("id")
);

-- Unique & Normal Indexes
CREATE UNIQUE INDEX "OwnerProfile_userId_key" ON "OwnerProfile"("userId");
CREATE INDEX "OwnerProfile_userId_idx" ON "OwnerProfile"("userId");
CREATE INDEX "OwnerProfile_status_idx" ON "OwnerProfile"("status");

-- Foreign Keys Restrict
ALTER TABLE "OwnerProfile" ADD CONSTRAINT "OwnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
