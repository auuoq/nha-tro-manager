import { Prisma } from "@prisma/client";
import { CreateBuildingInput, UpdateBuildingInput } from "../schemas/building.schema";

export async function createBuildingInTx(
  tx: Prisma.TransactionClient,
  ownerUserId: string,
  data: CreateBuildingInput
) {
  return tx.building.create({
    data: {
      ownerId: ownerUserId,
      name: data.name,
      address: data.address,
      description: data.description || null,
      bankName: data.bankName || null,
      bankAccountNo: data.bankAccountNo || null,
      bankAccountName: data.bankAccountName || null,
      bankBin: data.bankBin || null,
      wifiInfo: data.wifiInfo || null,
      rules: data.rules || null,
    },
  });
}

export async function updateBuildingInTx(
  tx: Prisma.TransactionClient,
  buildingId: string,
  data: UpdateBuildingInput
) {
  return tx.building.update({
    where: { id: buildingId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.address ? { address: data.address } : {}),
      description: data.description ?? undefined,
      bankName: data.bankName ?? undefined,
      bankAccountNo: data.bankAccountNo ?? undefined,
      bankAccountName: data.bankAccountName ?? undefined,
      bankBin: data.bankBin ?? undefined,
      wifiInfo: data.wifiInfo ?? undefined,
      rules: data.rules ?? undefined,
    },
  });
}

export async function softDeleteBuildingInTx(tx: Prisma.TransactionClient, buildingId: string) {
  return tx.building.update({
    where: { id: buildingId },
    data: {
      deletedAt: new Date(),
    },
  });
}
