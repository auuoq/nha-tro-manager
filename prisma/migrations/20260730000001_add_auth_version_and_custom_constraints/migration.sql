-- AlterTable User: Bổ sung mustChangePassword và tokenVersion
ALTER TABLE "User" 
ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- =========================================================================
-- CUSTOM POSTGRESQL CONSTRAINTS & PARTIAL UNIQUE INDEXES
-- =========================================================================

-- 1. ChargeConfig Constraint: Exactly One Scope (buildingId OR roomId OR contractId)
ALTER TABLE "ChargeConfig" ADD CONSTRAINT "charge_config_exactly_one_scope" 
CHECK (
  ("buildingId" IS NOT NULL AND "roomId" IS NULL AND "contractId" IS NULL) OR 
  ("buildingId" IS NULL AND "roomId" IS NOT NULL AND "contractId" IS NULL) OR 
  ("buildingId" IS NULL AND "roomId" IS NULL AND "contractId" IS NOT NULL)
);

-- 2. ContractTenant Partial Unique Index: Duy nhất 1 Primary Tenant đang hoạt động trên mỗi Contract
CREATE UNIQUE INDEX "contract_primary_tenant_active_idx" 
ON "ContractTenant" ("contractId") 
WHERE role = 'PRIMARY' AND "leftAt" IS NULL;

-- 3. Meter Partial Unique Index: Duy nhất 1 Active Meter per MeterType cho mỗi Room
CREATE UNIQUE INDEX "meter_active_per_room_type_idx" 
ON "Meter" ("roomId", "type") 
WHERE "isActive" = true AND "removedAt" IS NULL;
