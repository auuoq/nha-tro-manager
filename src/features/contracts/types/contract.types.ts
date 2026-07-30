import { ContractStatus, ContractTenantRole, ChargeMethod, ChargeType } from "@prisma/client";

export interface ContractTenantDTO {
  id: string;
  contractId: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string | null;
  tenantIdCard: string | null;
  role: ContractTenantRole;
  joinedAt: Date;
  leftAt: Date | null;
}

export interface ContractChargeConfigDTO {
  id: string;
  chargeType: ChargeType;
  chargeMethod: ChargeMethod;
  unitPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

export interface ContractItemDTO {
  id: string;
  roomId: string;
  buildingName: string;
  roomNumber: string;
  contractCode: string;
  startDate: Date;
  endDate: Date;
  actualMoveInDate: Date | null;
  actualMoveOutDate: Date | null;
  depositAmount: number;
  monthlyPrice: number;
  billingDay: number;
  status: ContractStatus;
  primaryTenantName: string;
  tenantsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractDetailDTO extends ContractItemDTO {
  cancellationReason: string | null;
  terminationDate: Date | null;
  terminationReason: string | null;
  depositReturnedAmount: number;
  depositDeductionAmount: number;
  documentPath: string | null;
  notes: string | null;
  tenants: ContractTenantDTO[];
  chargeConfigs: ContractChargeConfigDTO[];
  roomOverrideChargeConfigs: ContractChargeConfigDTO[];
  buildingDefaultChargeConfigs: ContractChargeConfigDTO[];
}
