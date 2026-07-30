import { Prisma, UserRole, OwnerStatus } from "@prisma/client";

export interface CreateOwnerData {
  phone: string;
  email?: string;
  passwordHash: string;
  fullName: string;
  businessName?: string;
  taxCode?: string;
  address?: string;
}

export async function createOwnerInTx(tx: Prisma.TransactionClient, data: CreateOwnerData) {
  const user = await tx.user.create({
    data: {
      phone: data.phone,
      email: data.email || null,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      role: UserRole.OWNER,
      isActive: true,
      mustChangePassword: true,
      ownerProfile: {
        create: {
          businessName: data.businessName || null,
          taxCode: data.taxCode || null,
          address: data.address || null,
          status: OwnerStatus.ACTIVE,
        },
      },
    },
    include: {
      ownerProfile: true,
    },
  });

  return user;
}

export async function updateOwnerStatusInTx(
  tx: Prisma.TransactionClient,
  ownerUserId: string,
  isActive: boolean,
  status: OwnerStatus
) {
  const updatedUser = await tx.user.update({
    where: { id: ownerUserId },
    data: {
      isActive: isActive,
      tokenVersion: { increment: 1 },
      ownerProfile: {
        update: {
          status: status,
        },
      },
    },
  });

  return updatedUser;
}
