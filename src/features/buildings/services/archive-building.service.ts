import { requireOwner } from "@/server/permissions/rbac";
import { assertBuildingOwnership } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { softDeleteBuildingInTx } from "../repositories/building-write.repository";

export async function archiveBuildingService(buildingId: string, reason?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  await assertBuildingOwnership(buildingId, session.user);

  return runSerializableTransaction(async (tx) => {
    // Kiểm tra xem tòa nhà có hợp đồng đang ACTIVE nào không
    const activeContractsCount = await tx.contract.count({
      where: {
        room: { buildingId },
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (activeContractsCount > 0) {
      throw new Error(
        `CANNOT_ARCHIVE_BUILDING_WITH_ACTIVE_CONTRACTS: Tòa nhà đang có ${activeContractsCount} hợp đồng hoạt động (ACTIVE). Không thể lưu trữ!`
      );
    }

    const archived = await softDeleteBuildingInTx(tx, buildingId);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ARCHIVE_BUILDING",
        entity: "Building",
        entityId: buildingId,
        details: JSON.stringify({
          archivedAt: archived.deletedAt,
          reason: reason || "Chủ nhà chủ động lưu trữ tòa nhà",
        }),
      },
    });

    return archived;
  });
}
