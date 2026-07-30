import { requireSuperAdmin } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { OwnerStatus, UserRole } from "@prisma/client";
import { updateOwnerStatusInTx } from "../repositories/owner-write.repository";

export async function updateOwnerStatusService(
  targetOwnerUserId: string,
  targetStatus: OwnerStatus,
  reason?: string
): Promise<void> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireSuperAdmin(session.user);

  if (session.user.id === targetOwnerUserId) {
    throw new Error("FORBIDDEN_CANNOT_SUSPEND_SELF");
  }

  return runSerializableTransaction(async (tx) => {
    const targetUser = await tx.user.findUnique({
      where: { id: targetOwnerUserId },
      select: { id: true, role: true },
    });

    if (!targetUser) throw new Error("NOT_FOUND_OWNER_USER");
    if (targetUser.role !== UserRole.OWNER) {
      throw new Error("INVALID_ROLE_NOT_AN_OWNER");
    }

    const isActive = targetStatus === OwnerStatus.ACTIVE;

    await updateOwnerStatusInTx(tx, targetOwnerUserId, isActive, targetStatus);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: targetStatus === OwnerStatus.SUSPENDED ? "SUSPEND_OWNER" : "REACTIVATE_OWNER",
        entity: "User",
        entityId: targetOwnerUserId,
        details: JSON.stringify({ targetStatus, reason: reason || null }),
      },
    });
  });
}
