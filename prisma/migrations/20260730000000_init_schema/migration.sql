-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TENANT');
CREATE TYPE "RoomStatus" AS ENUM ('VACANT', 'RESERVED', 'RENTED', 'MAINTENANCE');
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRING', 'TERMINATED', 'CANCELLED');
CREATE TYPE "ContractTenantRole" AS ENUM ('PRIMARY', 'MEMBER');
CREATE TYPE "MeterType" AS ENUM ('ELECTRICITY', 'WATER');
CREATE TYPE "MeterReadingStatus" AS ENUM ('RECORDED', 'VERIFIED', 'INVALIDATED');
CREATE TYPE "ChargeType" AS ENUM ('ELECTRICITY', 'WATER', 'WIFI', 'GARBAGE', 'PARKING', 'OTHER');
CREATE TYPE "ChargeMethod" AS ENUM ('METERED', 'PER_PERSON', 'PER_ROOM', 'FREE');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "InvoiceItemType" AS ENUM ('ROOM', 'ELECTRICITY', 'WATER', 'WIFI', 'GARBAGE', 'PARKING', 'PREVIOUS_DEBT', 'DISCOUNT', 'OTHER');
CREATE TYPE "PaymentMethod" AS ENUM ('VIETQR', 'BANK_TRANSFER', 'CASH');
CREATE TYPE "PaymentSource" AS ENUM ('ADMIN_MANUAL', 'BANK_WEBHOOK', 'SYSTEM');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PENDING_REVIEW', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Building
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankAccountName" TEXT,
    "bankBin" TEXT,
    "wifiInfo" TEXT,
    "rules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable Room
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "basePrice" DECIMAL(12,0) NOT NULL,
    "areaSqM" DECIMAL(6,2) NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'VACANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable ChargeConfig
CREATE TABLE "ChargeConfig" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT,
    "roomId" TEXT,
    "contractId" TEXT,
    "chargeType" "ChargeType" NOT NULL,
    "chargeMethod" "ChargeMethod" NOT NULL,
    "unitPrice" DECIMAL(12,0) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChargeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable RoomAsset
CREATE TABLE "RoomAsset" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetCode" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable Tenant
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "idCardNumber" TEXT,
    "idCardIssuedDate" TIMESTAMP(3),
    "idCardIssuedPlace" TEXT,
    "idCardFrontPath" TEXT,
    "idCardBackPath" TEXT,
    "hometown" TEXT,
    "permanentAddress" TEXT,
    "vehicleNumber" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable Contract
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "contractCode" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "actualMoveInDate" TIMESTAMP(3),
    "actualMoveOutDate" TIMESTAMP(3),
    "depositAmount" DECIMAL(12,0) NOT NULL,
    "monthlyPrice" DECIMAL(12,0) NOT NULL,
    "billingDay" INTEGER NOT NULL DEFAULT 5,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "depositReturnedAmount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "depositDeductionAmount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "documentPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable ContractTenant
CREATE TABLE "ContractTenant" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" "ContractTenantRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ContractTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable Meter
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "type" "MeterType" NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "initialReading" DECIMAL(10,2) NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable MeterReading
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "previousValue" DECIMAL(10,2) NOT NULL,
    "currentValue" DECIMAL(10,2) NOT NULL,
    "consumption" DECIMAL(10,2) NOT NULL,
    "imagePath" TEXT,
    "note" TEXT,
    "status" "MeterReadingStatus" NOT NULL DEFAULT 'RECORDED',
    "recordedById" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeterReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable Invoice
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceCode" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "issuedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "subtotalAmount" DECIMAL(12,0) NOT NULL,
    "discountAmount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,0) NOT NULL,
    "paidAmount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(12,0) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "replacedInvoiceId" TEXT,
    "cancellationReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable InvoiceItem
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "InvoiceItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,0) NOT NULL,
    "amount" DECIMAL(12,0) NOT NULL,
    "meterReadingId" TEXT,
    "previousReading" DECIMAL(10,2),
    "currentReading" DECIMAL(10,2),
    "calculationMetadata" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentCode" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(12,0) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'VIETQR',
    "source" "PaymentSource" NOT NULL DEFAULT 'ADMIN_MANUAL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "transactionRef" TEXT,
    "rawPayload" JSONB,
    "notes" TEXT,
    "receivedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "refundReason" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable MaintenanceRequest
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "cost" DECIMAL(12,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable MaintenanceAttachment
CREATE TABLE "MaintenanceAttachment" (
    "id" TEXT NOT NULL,
    "maintenanceRequestId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Unique & Normal Indexes
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE INDEX "Building_ownerId_idx" ON "Building"("ownerId");

CREATE INDEX "Room_buildingId_idx" ON "Room"("buildingId");
CREATE INDEX "Room_status_idx" ON "Room"("status");
CREATE UNIQUE INDEX "Room_buildingId_roomNumber_key" ON "Room"("buildingId", "roomNumber");

CREATE INDEX "ChargeConfig_buildingId_idx" ON "ChargeConfig"("buildingId");
CREATE INDEX "ChargeConfig_roomId_idx" ON "ChargeConfig"("roomId");
CREATE INDEX "ChargeConfig_contractId_idx" ON "ChargeConfig"("contractId");
CREATE INDEX "ChargeConfig_chargeType_effectiveFrom_idx" ON "ChargeConfig"("chargeType", "effectiveFrom");

CREATE INDEX "RoomAsset_roomId_idx" ON "RoomAsset"("roomId");

CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");
CREATE UNIQUE INDEX "Tenant_idCardNumber_key" ON "Tenant"("idCardNumber");
CREATE INDEX "Tenant_userId_idx" ON "Tenant"("userId");
CREATE INDEX "Tenant_idCardNumber_idx" ON "Tenant"("idCardNumber");
CREATE INDEX "Tenant_phone_idx" ON "Tenant"("phone");

CREATE UNIQUE INDEX "Contract_contractCode_key" ON "Contract"("contractCode");
CREATE INDEX "Contract_roomId_idx" ON "Contract"("roomId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Contract_startDate_endDate_idx" ON "Contract"("startDate", "endDate");

CREATE INDEX "ContractTenant_contractId_idx" ON "ContractTenant"("contractId");
CREATE INDEX "ContractTenant_tenantId_idx" ON "ContractTenant"("tenantId");
CREATE UNIQUE INDEX "ContractTenant_contractId_tenantId_key" ON "ContractTenant"("contractId", "tenantId");

CREATE INDEX "Meter_roomId_type_isActive_idx" ON "Meter"("roomId", "type", "isActive");

CREATE INDEX "MeterReading_meterId_idx" ON "MeterReading"("meterId");
CREATE INDEX "MeterReading_period_idx" ON "MeterReading"("period");
CREATE INDEX "MeterReading_recordedById_idx" ON "MeterReading"("recordedById");
CREATE UNIQUE INDEX "MeterReading_meterId_period_key" ON "MeterReading"("meterId", "period");

CREATE UNIQUE INDEX "Invoice_invoiceCode_key" ON "Invoice"("invoiceCode");
CREATE INDEX "Invoice_roomId_idx" ON "Invoice"("roomId");
CREATE INDEX "Invoice_contractId_idx" ON "Invoice"("contractId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Invoice_billingPeriod_idx" ON "Invoice"("billingPeriod");
CREATE UNIQUE INDEX "Invoice_contractId_billingPeriod_revision_key" ON "Invoice"("contractId", "billingPeriod", "revision");

CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
CREATE INDEX "InvoiceItem_meterReadingId_idx" ON "InvoiceItem"("meterReadingId");

CREATE UNIQUE INDEX "Payment_paymentCode_key" ON "Payment"("paymentCode");
CREATE UNIQUE INDEX "Payment_transactionRef_key" ON "Payment"("transactionRef");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");
CREATE INDEX "Payment_recordedById_idx" ON "Payment"("recordedById");
CREATE INDEX "Payment_confirmedById_idx" ON "Payment"("confirmedById");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_source_idx" ON "Payment"("source");

CREATE UNIQUE INDEX "MaintenanceRequest_ticketCode_key" ON "MaintenanceRequest"("ticketCode");
CREATE INDEX "MaintenanceRequest_roomId_idx" ON "MaintenanceRequest"("roomId");
CREATE INDEX "MaintenanceRequest_createdById_idx" ON "MaintenanceRequest"("createdById");
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

CREATE INDEX "MaintenanceAttachment_maintenanceRequestId_idx" ON "MaintenanceAttachment"("maintenanceRequestId");

CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Foreign Keys Restrict
ALTER TABLE "Building" ADD CONSTRAINT "Building_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Room" ADD CONSTRAINT "Room_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChargeConfig" ADD CONSTRAINT "ChargeConfig_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChargeConfig" ADD CONSTRAINT "ChargeConfig_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChargeConfig" ADD CONSTRAINT "ChargeConfig_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoomAsset" ADD CONSTRAINT "RoomAsset_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractTenant" ADD CONSTRAINT "ContractTenant_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractTenant" ADD CONSTRAINT "ContractTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meter" ADD CONSTRAINT "Meter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "Meter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_replacedInvoiceId_fkey" FOREIGN KEY ("replacedInvoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_meterReadingId_fkey" FOREIGN KEY ("meterReadingId") REFERENCES "MeterReading"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceAttachment" ADD CONSTRAINT "MaintenanceAttachment_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
