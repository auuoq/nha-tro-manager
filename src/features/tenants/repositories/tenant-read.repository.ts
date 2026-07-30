import { prisma } from "@/server/database/prisma";
import { TenantDetailDTO, TenantItemDTO } from "../types/tenant.types";

export async function findTenantsByOwner(ownerUserId: string): Promise<TenantItemDTO[]> {
  const tenants = await prisma.tenant.findMany({
    where: {
      ownerId: ownerUserId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, isActive: true },
      },
      contractTenants: {
        where: { leftAt: null, contract: { status: "ACTIVE" } },
        select: { contractId: true },
      },
    },
  });

  return tenants.map((t) => ({
    id: t.id,
    ownerId: t.ownerId,
    userId: t.userId,
    fullName: t.fullName,
    phone: t.phone,
    dateOfBirth: t.dateOfBirth,
    gender: t.gender,
    idCardNumber: t.idCardNumber,
    hometown: t.hometown,
    hasAccount: !!t.userId,
    isAccountActive: t.user ? t.user.isActive : false,
    hasIdCardFront: !!t.idCardFrontPath,
    hasIdCardBack: !!t.idCardBackPath,
    activeContractId: t.contractTenants[0]?.contractId || null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
}

export async function findTenantDetail(tenantId: string, ownerUserId: string): Promise<TenantDetailDTO | null> {
  const t = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      ownerId: ownerUserId,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          phone: true,
          email: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
        },
      },
      contractTenants: {
        where: { leftAt: null, contract: { status: "ACTIVE" } },
        select: { contractId: true },
      },
    },
  });

  if (!t) return null;

  return {
    id: t.id,
    ownerId: t.ownerId,
    userId: t.userId,
    fullName: t.fullName,
    phone: t.phone,
    dateOfBirth: t.dateOfBirth,
    gender: t.gender,
    idCardNumber: t.idCardNumber,
    idCardIssuedDate: t.idCardIssuedDate,
    idCardIssuedPlace: t.idCardIssuedPlace,
    hometown: t.hometown,
    permanentAddress: t.permanentAddress,
    vehicleNumber: t.vehicleNumber,
    emergencyContactName: t.emergencyContactName,
    emergencyContactPhone: t.emergencyContactPhone,
    hasAccount: !!t.userId,
    isAccountActive: t.user ? t.user.isActive : false,
    hasIdCardFront: !!t.idCardFrontPath,
    hasIdCardBack: !!t.idCardBackPath,
    activeContractId: t.contractTenants[0]?.contractId || null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    account: t.user
      ? {
          userId: t.user.id,
          phone: t.user.phone,
          email: t.user.email,
          isActive: t.user.isActive,
          mustChangePassword: t.user.mustChangePassword,
          createdAt: t.user.createdAt,
        }
      : null,
  };
}

export async function findTenantByUserId(userId: string): Promise<TenantDetailDTO | null> {
  const t = await prisma.tenant.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          phone: true,
          email: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
        },
      },
      contractTenants: {
        where: { leftAt: null, contract: { status: "ACTIVE" } },
        select: { contractId: true },
      },
    },
  });

  if (!t || t.deletedAt) return null;

  return {
    id: t.id,
    ownerId: t.ownerId,
    userId: t.userId,
    fullName: t.fullName,
    phone: t.phone,
    dateOfBirth: t.dateOfBirth,
    gender: t.gender,
    idCardNumber: t.idCardNumber,
    idCardIssuedDate: t.idCardIssuedDate,
    idCardIssuedPlace: t.idCardIssuedPlace,
    hometown: t.hometown,
    permanentAddress: t.permanentAddress,
    vehicleNumber: t.vehicleNumber,
    emergencyContactName: t.emergencyContactName,
    emergencyContactPhone: t.emergencyContactPhone,
    hasAccount: !!t.userId,
    isAccountActive: t.user ? t.user.isActive : false,
    hasIdCardFront: !!t.idCardFrontPath,
    hasIdCardBack: !!t.idCardBackPath,
    activeContractId: t.contractTenants[0]?.contractId || null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    account: t.user
      ? {
          userId: t.user.id,
          phone: t.user.phone,
          email: t.user.email,
          isActive: t.user.isActive,
          mustChangePassword: t.user.mustChangePassword,
          createdAt: t.user.createdAt,
        }
      : null,
  };
}
