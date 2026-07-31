# Prisma Schema → SQLAlchemy 2.x Model Mapping Specification

Tài liệu quy định chi tiết 1:1 việc chuyển đổi từ `prisma/schema.prisma` (PostgreSQL) sang **SQLAlchemy 2.x Async Mapped Models** trong dự án `apps/api-fastapi`.

---

## 1. ENUM MAPPING TABLE

| Prisma Enum Name | PostgreSQL Enum Type Name | Enums Values |
|---|---|---|
| `UserRole` | `UserRole` | `SUPER_ADMIN`, `OWNER`, `TENANT` |
| `OwnerStatus` | `OwnerStatus` | `PENDING`, `ACTIVE`, `SUSPENDED`, `TERMINATED` |
| `RoomStatus` | `RoomStatus` | `VACANT`, `RESERVED`, `RENTED`, `MAINTENANCE` |
| `ContractStatus` | `ContractStatus` | `DRAFT`, `ACTIVE`, `EXPIRING`, `TERMINATED`, `CANCELLED` |
| `ContractTenantRole` | `ContractTenantRole` | `PRIMARY`, `MEMBER` |
| `MeterType` | `MeterType` | `ELECTRICITY`, `WATER` |
| `MeterReadingStatus` | `MeterReadingStatus` | `RECORDED`, `VERIFIED`, `INVALIDATED` |
| `ChargeType` | `ChargeType` | `ELECTRICITY`, `WATER`, `WIFI`, `GARBAGE`, `PARKING`, `OTHER` |
| `ChargeMethod` | `ChargeMethod` | `METERED`, `PER_PERSON`, `PER_ROOM`, `FREE` |
| `InvoiceStatus` | `InvoiceStatus` | `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED` |
| `InvoiceItemType` | `InvoiceItemType` | `ROOM`, `ELECTRICITY`, `WATER`, `WIFI`, `GARBAGE`, `PARKING`, `PREVIOUS_DEBT`, `DISCOUNT`, `OTHER` |
| `PaymentMethod` | `PaymentMethod` | `VIETQR`, `BANK_TRANSFER`, `CASH`, `BANK_WEBHOOK`, `OTHER` |
| `PaymentSource` | `PaymentSource` | `ADMIN_MANUAL`, `BANK_WEBHOOK`, `SYSTEM` |
| `PaymentStatus` | `PaymentStatus` | `PENDING`, `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED` |
| `MaintenanceStatus` | `MaintenanceStatus` | `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| `MaintenancePriority` | `MaintenancePriority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |

---

## 2. MODEL MAPPING DETAILS

### 2.1 Model `User` (Bảng `User` / `"User"`)
- **Primary Key**: `id` String (UUID, default: `gen_random_uuid()` / `uuid4()`)
- **Fields**:
  - `phone`: `String`, Unique, Not Null, Index
  - `email`: `String?`, Unique, Nullable
  - `passwordHash`: `String`, Not Null
  - `fullName`: `String`, Not Null
  - `role`: Enum `UserRole`, Default `'TENANT'`, Index
  - `isActive`: `Boolean`, Default `True`
  - `mustChangePassword`: `Boolean`, Default `True`
  - `tokenVersion`: `Integer`, Default `1`
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`, OnUpdate `now()`
  - `deletedAt`: `DateTime?`, Nullable (Soft delete)
- **Relationships**:
  - `ownerProfile`: 1-to-1 `OwnerProfile`
  - `ownedBuildings`: 1-to-many `Building` (`ownerId`)
  - `managedTenants`: 1-to-many `Tenant` (`ownerId`)
  - `tenantProfile`: 1-to-1 `Tenant` (`userId`)

### 2.2 Model `OwnerProfile` (Bảng `OwnerProfile`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `userId`: `String`, Unique, Foreign Key `User.id` (onDelete: Restrict), Index
  - `businessName`: `String?`, Nullable
  - `taxCode`: `String?`, Nullable
  - `address`: `String?`, Nullable
  - `status`: Enum `OwnerStatus`, Default `'ACTIVE'`, Index
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable

### 2.3 Model `Building` (Bảng `Building`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `ownerId`: `String`, Foreign Key `User.id` (onDelete: Restrict), Index
  - `name`: `String`, Not Null
  - `address`: `String`, Not Null
  - `description`: `String?`, Nullable
  - `bankName`: `String?`, Nullable
  - `bankAccountNo`: `String?`, Nullable
  - `bankAccountName`: `String?`, Nullable
  - `bankBin`: `String?`, Nullable
  - `wifiInfo`: `String?`, Nullable
  - `rules`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable

### 2.4 Model `Room` (Bảng `Room`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `buildingId`: `String`, Foreign Key `Building.id` (onDelete: Restrict), Index
  - `roomNumber`: `String`, Not Null
  - `floor`: `Integer`, Not Null
  - `roomType`: `String`, Not Null
  - `basePrice`: `Numeric(12, 0)`, Not Null
  - `areaSqM`: `Numeric(6, 2)`, Not Null
  - `status`: Enum `RoomStatus`, Default `'VACANT'`, Index
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable
- **Unique Constraint**: `@@unique([buildingId, roomNumber])`

### 2.5 Model `ChargeConfig` (Bảng `ChargeConfig`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `buildingId`: `String?`, Foreign Key `Building.id`, Index
  - `roomId`: `String?`, Foreign Key `Room.id`, Index
  - `contractId`: `String?`, Foreign Key `Contract.id`, Index
  - `chargeType`: Enum `ChargeType`, Not Null
  - `chargeMethod`: Enum `ChargeMethod`, Not Null
  - `unitPrice`: `Numeric(12, 0)`, Not Null
  - `effectiveFrom`: `DateTime`, Default `now()`
  - `effectiveTo`: `DateTime?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
- **Indexes**: `@@index([chargeType, effectiveFrom])`

### 2.6 Model `RoomAsset` (Bảng `RoomAsset`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `roomId`: `String`, Foreign Key `Room.id` (onDelete: Cascade), Index
  - `name`: `String`, Not Null
  - `assetCode`: `String?`, Nullable
  - `condition`: `String`, Default `'GOOD'`
  - `quantity`: `Integer`, Default `1`
  - `note`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable

### 2.7 Model `Tenant` (Bảng `Tenant`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `ownerId`: `String`, Foreign Key `User.id` (onDelete: Restrict), Index
  - `userId`: `String?`, Unique, Foreign Key `User.id` (onDelete: SetNull), Index
  - `fullName`: `String`, Not Null
  - `phone`: `String?`, Nullable, Index
  - `dateOfBirth`: `DateTime?`, Nullable
  - `gender`: `String?`, Nullable
  - `idCardNumber`: `String?`, Unique, Nullable, Index
  - `idCardIssuedDate`: `DateTime?`, Nullable
  - `idCardIssuedPlace`: `String?`, Nullable
  - `idCardFrontPath`: `String?`, Nullable
  - `idCardBackPath`: `String?`, Nullable
  - `hometown`: `String?`, Nullable
  - `permanentAddress`: `String?`, Nullable
  - `vehicleNumber`: `String?`, Nullable
  - `emergencyContactName`: `String?`, Nullable
  - `emergencyContactPhone`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable

### 2.8 Model `Contract` (Bảng `Contract`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `roomId`: `String`, Foreign Key `Room.id` (onDelete: Restrict), Index
  - `contractCode`: `String`, Unique, Index
  - `startDate`: `DateTime`, Not Null
  - `endDate`: `DateTime`, Not Null
  - `actualMoveInDate`: `DateTime?`, Nullable
  - `actualMoveOutDate`: `DateTime?`, Nullable
  - `depositAmount`: `Numeric(12, 0)`, Not Null
  - `monthlyPrice`: `Numeric(12, 0)`, Not Null
  - `billingDay`: `Integer`, Default `5`
  - `status`: Enum `ContractStatus`, Default `'DRAFT'`, Index
  - `cancellationReason`: `String?`, Nullable
  - `terminationDate`: `DateTime?`, Nullable
  - `terminationReason`: `String?`, Nullable
  - `depositReturnedAmount`: `Numeric(12, 0)`, Default `0`
  - `depositDeductionAmount`: `Numeric(12, 0)`, Default `0`
  - `documentPath`: `String?`, Nullable
  - `notes`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable
- **Indexes**: `@@index([startDate, endDate])`

### 2.9 Model `ContractTenant` (Bảng `ContractTenant`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `contractId`: `String`, Foreign Key `Contract.id`, Index
  - `tenantId`: `String`, Foreign Key `Tenant.id`, Index
  - `role`: Enum `ContractTenantRole`, Default `'MEMBER'`
  - `joinedAt`: `DateTime`, Default `now()`
  - `leftAt`: `DateTime?`, Nullable
- **Unique Constraint**: `@@unique([contractId, tenantId])`

### 2.10 Model `Meter` (Bảng `Meter`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `roomId`: `String`, Foreign Key `Room.id`, Index
  - `type`: Enum `MeterType`, Not Null
  - `serialNumber`: `String`, Not Null
  - `initialReading`: `Numeric(10, 2)`, Not Null
  - `installedAt`: `DateTime`, Default `now()`
  - `removedAt`: `DateTime?`, Nullable
  - `isActive`: `Boolean`, Default `True`
  - `note`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
- **Indexes**: `@@index([roomId, type, isActive])`

### 2.11 Model `MeterReading` (Bảng `MeterReading`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `meterId`: `String`, Foreign Key `Meter.id`, Index
  - `period`: `String`, Not Null, Index
  - `previousValue`: `Numeric(10, 2)`, Not Null
  - `currentValue`: `Numeric(10, 2)`, Not Null
  - `consumption`: `Numeric(10, 2)`, Not Null
  - `imagePath`: `String?`, Nullable
  - `note`: `String?`, Nullable
  - `status`: Enum `MeterReadingStatus`, Default `'RECORDED'`
  - `recordedById`: `String`, Foreign Key `User.id`, Index
  - `recordedAt`: `DateTime`, Default `now()`
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
- **Unique Constraint**: `@@unique([meterId, period])`

### 2.12 Model `Invoice` (Bảng `Invoice`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `invoiceCode`: `String`, Unique, Not Null
  - `roomId`: `String`, Foreign Key `Room.id`, Index
  - `contractId`: `String`, Foreign Key `Contract.id`, Index
  - `billingPeriod`: `String`, Not Null, Index
  - `revision`: `Integer`, Default `1`
  - `issuedAt`: `DateTime?`, Nullable
  - `dueDate`: `DateTime`, Not Null
  - `subtotalAmount`: `Numeric(12, 0)`, Not Null
  - `discountAmount`: `Numeric(12, 0)`, Default `0`
  - `totalAmount`: `Numeric(12, 0)`, Not Null
  - `paidAmount`: `Numeric(12, 0)`, Default `0`
  - `remainingAmount`: `Numeric(12, 0)`, Not Null
  - `status`: Enum `InvoiceStatus`, Default `'DRAFT'`, Index
  - `replacedInvoiceId`: `String?`, Foreign Key `Invoice.id`, Nullable
  - `cancellationReason`: `String?`, Nullable
  - `notes`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable
- **Unique Constraint**: `@@unique([contractId, billingPeriod, revision])`

### 2.13 Model `InvoiceItem` (Bảng `InvoiceItem`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `invoiceId`: `String`, Foreign Key `Invoice.id`, Index
  - `type`: Enum `InvoiceItemType`, Not Null
  - `description`: `String`, Not Null
  - `quantity`: `Numeric(10, 2)`, Not Null
  - `unit`: `String`, Not Null
  - `unitPrice`: `Numeric(12, 0)`, Not Null
  - `amount`: `Numeric(12, 0)`, Not Null
  - `meterReadingId`: `String?`, Foreign Key `MeterReading.id`, Nullable, Index
  - `previousReading`: `Numeric(10, 2)?`, Nullable
  - `currentReading`: `Numeric(10, 2)?`, Nullable
  - `calculationMetadata`: `JSONB?`, Nullable
  - `sortOrder`: `Integer`, Default `0`

### 2.14 Model `Payment` (Bảng `Payment`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `paymentCode`: `String`, Unique, Not Null
  - `invoiceId`: `String`, Foreign Key `Invoice.id`, Index
  - `amount`: `Numeric(12, 0)`, Not Null
  - `refundAmount`: `Numeric(12, 0)`, Default `0`
  - `overpaymentAmount`: `Numeric(12, 0)`, Default `0`
  - `method`: Enum `PaymentMethod`, Default `'VIETQR'`
  - `source`: Enum `PaymentSource`, Default `'ADMIN_MANUAL'`, Index
  - `status`: Enum `PaymentStatus`, Default `'PENDING'`, Index
  - `provider`: `String?`, Nullable
  - `transactionRef`: `String?`, Unique, Nullable
  - `idempotencyKey`: `String?`, Unique, Nullable
  - `rawPayload`: `JSONB?`, Nullable
  - `notes`: `String?`, Nullable
  - `receivedAt`: `DateTime?`, Nullable
  - `confirmedAt`: `DateTime?`, Nullable
  - `confirmedById`: `String?`, Foreign Key `User.id`, Nullable, Index
  - `cancelledAt`: `DateTime?`, Nullable
  - `cancellationReason`: `String?`, Nullable
  - `refundReason`: `String?`, Nullable
  - `recordedById`: `String?`, Foreign Key `User.id`, Nullable, Index
  - `createdAt`: `DateTime`, Default `now()`
  - `updatedAt`: `DateTime`, Default `now()`
  - `deletedAt`: `DateTime?`, Nullable

### 2.15 Model `WebhookEvent` (Bảng `WebhookEvent`)
- **Primary Key**: `id` String (UUID)
- **Fields**:
  - `provider`: `String`, Not Null
  - `eventId`: `String`, Not Null
  - `payload`: `JSONB`, Not Null
  - `status`: `String`, Not Null, Index
  - `matchedInvoiceId`: `String?`, Nullable, Index
  - `matchedPaymentId`: `String?`, Nullable
  - `errorMessage`: `String?`, Nullable
  - `createdAt`: `DateTime`, Default `now()`
- **Unique Constraint**: `@@unique([provider, eventId])`

### 2.16 Model `MaintenanceRequest` & `MaintenanceAttachment`
- `MaintenanceRequest`:
  - `id` (UUID), `ticketCode` (Unique), `roomId` (FK Room), `createdById` (FK User), `title`, `description` (Text), `priority` (Enum `MaintenancePriority`), `status` (Enum `MaintenanceStatus`), `resolvedAt`, `cost` (`Numeric(12,0)`), `createdAt`, `updatedAt`
- `MaintenanceAttachment`:
  - `id` (UUID), `maintenanceRequestId` (FK MaintenanceRequest, Cascade), `filePath`, `fileType`, `createdAt`

### 2.17 Model `Notification` & `AuditLog`
- `Notification`:
  - `id` (UUID), `userId` (FK User, Cascade), `title`, `content` (Text), `isRead` (Boolean), `linkUrl`, `createdAt`. Index `[userId, isRead]`
- `AuditLog`:
  - `id` (UUID), `userId` (FK User, SetNull), `action`, `entity`, `entityId`, `details` (Text), `ipAddress`, `userAgent`, `createdAt`. Indexes `[userId]`, `[entity, entityId]`, `[createdAt]`
