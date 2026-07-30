import { OwnerStatus, UserRole } from "@prisma/client";

export interface OwnerItemDTO {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  profile: {
    id: string;
    businessName: string | null;
    taxCode: string | null;
    address: string | null;
    status: OwnerStatus;
  } | null;
  buildingsCount: number;
}

export interface CreateOwnerResult {
  ownerId: string;
  fullName: string;
  phone: string;
  tempPassword: string; // Trả về duy nhất 1 lần để hiển thị cho Super Admin
}
