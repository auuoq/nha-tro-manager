export interface TenantItemDTO {
  id: string;
  ownerId: string;
  userId: string | null;
  fullName: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  idCardNumber: string | null;
  hometown: string | null;
  hasAccount: boolean;
  isAccountActive: boolean;
  hasIdCardFront: boolean;
  hasIdCardBack: boolean;
  activeContractId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDetailDTO extends TenantItemDTO {
  idCardIssuedDate: Date | null;
  idCardIssuedPlace: string | null;
  permanentAddress: string | null;
  vehicleNumber: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  account: {
    userId: string;
    phone: string;
    email: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: Date;
  } | null;
}

export interface CreateTenantAccountResult {
  userId: string;
  phone: string;
  tempPassword: string; // Trả về duy nhất 1 lần cho Owner
}
