export interface TenantAccountDTO {
  id: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  role: "TENANT";
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string | null;
  gender: string | null;
  idCardNumber: string | null;
  hometown: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  hasAccount?: boolean;
  isAccountActive?: boolean;
  account?: TenantAccountDTO | null;
}

export interface TenantCreateInput {
  fullName: string;
  phone?: string | null;
  gender?: string | null;
  idCardNumber?: string | null;
  hometown?: string | null;
}

export interface TenantUpdateInput extends Partial<TenantCreateInput> {}

export interface CreateAccountInput {
  phone: string;
  email?: string | null;
}

export interface CreateAccountResponse {
  tempPassword: string;
  account: TenantAccountDTO;
}
