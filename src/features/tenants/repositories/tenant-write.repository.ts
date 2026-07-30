import { Prisma } from "@prisma/client";
import { CreateTenantInput, UpdateTenantInput } from "../schemas/tenant.schema";

export async function createTenantInTx(tx: Prisma.TransactionClient, ownerUserId: string, data: CreateTenantInput) {
  return tx.tenant.create({
    data: {
      ownerId: ownerUserId,
      fullName: data.fullName,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || null,
      idCardNumber: data.idCardNumber || null,
      idCardIssuedDate: data.idCardIssuedDate || null,
      idCardIssuedPlace: data.idCardIssuedPlace || null,
      hometown: data.hometown || null,
      permanentAddress: data.permanentAddress || null,
      vehicleNumber: data.vehicleNumber || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
    },
  });
}

export async function updateTenantInTx(tx: Prisma.TransactionClient, tenantId: string, data: UpdateTenantInput) {
  return tx.tenant.update({
    where: { id: tenantId },
    data: {
      ...(data.fullName ? { fullName: data.fullName } : {}),
      phone: data.phone !== undefined ? (data.phone || null) : undefined,
      dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : undefined,
      gender: data.gender !== undefined ? (data.gender || null) : undefined,
      idCardNumber: data.idCardNumber !== undefined ? (data.idCardNumber || null) : undefined,
      idCardIssuedDate: data.idCardIssuedDate !== undefined ? data.idCardIssuedDate : undefined,
      idCardIssuedPlace: data.idCardIssuedPlace !== undefined ? (data.idCardIssuedPlace || null) : undefined,
      hometown: data.hometown !== undefined ? (data.hometown || null) : undefined,
      permanentAddress: data.permanentAddress !== undefined ? (data.permanentAddress || null) : undefined,
      vehicleNumber: data.vehicleNumber !== undefined ? (data.vehicleNumber || null) : undefined,
      emergencyContactName: data.emergencyContactName !== undefined ? (data.emergencyContactName || null) : undefined,
      emergencyContactPhone: data.emergencyContactPhone !== undefined ? (data.emergencyContactPhone || null) : undefined,
    },
  });
}

export async function updateTenantCCCDPathsInTx(
  tx: Prisma.TransactionClient,
  tenantId: string,
  paths: { idCardFrontPath?: string | null; idCardBackPath?: string | null }
) {
  return tx.tenant.update({
    where: { id: tenantId },
    data: {
      ...(paths.idCardFrontPath !== undefined ? { idCardFrontPath: paths.idCardFrontPath } : {}),
      ...(paths.idCardBackPath !== undefined ? { idCardBackPath: paths.idCardBackPath } : {}),
    },
  });
}

export async function softDeleteTenantInTx(tx: Prisma.TransactionClient, tenantId: string) {
  return tx.tenant.update({
    where: { id: tenantId },
    data: { deletedAt: new Date() },
  });
}
