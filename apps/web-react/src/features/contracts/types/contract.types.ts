export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRING" | "TERMINATED" | "CANCELLED";

export interface ContractTenantRelation {
  tenantId: string;
  isPrimary: boolean;
  fullName: string;
  phone: string | null;
  idCardNumber: string | null;
}

export interface Contract {
  id: string;
  contractCode: string;
  roomId: string;
  roomNumber?: string;
  buildingName?: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  depositAmount: number;
  billingDay: number;
  status: ContractStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  primaryTenantName?: string;
  tenantsCount?: number;
  tenants?: ContractTenantRelation[];
}

export interface ContractCreateInput {
  roomId: string;
  primaryTenantId: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  depositAmount: number;
  billingDay: number;
  notes?: string | null;
}

export interface ContractUpdateInput {
  startDate?: string;
  endDate?: string;
  monthlyPrice?: number;
  depositAmount?: number;
  billingDay?: number;
  notes?: string | null;
}
