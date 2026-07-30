import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { savePrivateCCCDImageBuffer, deletePrivateCCCDFile } from "@/server/storage/private-storage.service";
import { generateCCCDSignedUrl } from "@/server/storage/signed-url.service";
import { updateTenantCCCDPathsInTx } from "../repositories/tenant-write.repository";

export async function uploadTenantIdCardService(
  tenantId: string,
  side: "FRONT" | "BACK",
  fileBuffer: Buffer,
  originalFilename: string
): Promise<string> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  // 1. Save file in private storage
  const saveResult = await savePrivateCCCDImageBuffer(fileBuffer, originalFilename);
  if (!saveResult.success || !saveResult.storagePath) {
    throw new Error(saveResult.error || "UPLOAD_FAILED");
  }

  const savedPath = saveResult.storagePath;

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { ownerId: true, idCardFrontPath: true, idCardBackPath: true },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      deletePrivateCCCDFile(savedPath);
      throw new Error("FORBIDDEN_NOT_TENANT_OWNER");
    }

    // Delete old file if present
    const oldPath = side === "FRONT" ? tenant.idCardFrontPath : tenant.idCardBackPath;
    if (oldPath) {
      deletePrivateCCCDFile(oldPath);
    }

    await updateTenantCCCDPathsInTx(tx, tenantId, {
      ...(side === "FRONT" ? { idCardFrontPath: savedPath } : { idCardBackPath: savedPath }),
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: side === "FRONT" ? "UPLOAD_CCCD_FRONT" : "UPLOAD_CCCD_BACK",
        entity: "Tenant",
        entityId: tenantId,
        details: JSON.stringify({ side }),
      },
    });

    return savedPath;
  });
}

export async function getTenantIdCardSignedUrlService(
  tenantId: string,
  side: "FRONT" | "BACK",
  supportReason?: string
): Promise<{ url: string; expiresAt: Date }> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { ownerId: true, userId: true, idCardFrontPath: true, idCardBackPath: true },
    });

    if (!tenant) throw new Error("NOT_FOUND_TENANT");

    // Check Access
    const isOwner = session.user.role === "OWNER" && tenant.ownerId === session.user.id;
    const isTenantSelf = session.user.role === "TENANT" && tenant.userId === session.user.id;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isTenantSelf && !isSuperAdmin) {
      throw new Error("FORBIDDEN_CCCD_ACCESS");
    }

    const path = side === "FRONT" ? tenant.idCardFrontPath : tenant.idCardBackPath;
    if (!path) {
      throw new Error("NOT_FOUND_CCCD_IMAGE");
    }

    // AuditLog for viewing sensitive CCCD image
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "VIEW_CCCD_IMAGE",
        entity: "Tenant",
        entityId: tenantId,
        details: JSON.stringify({
          side,
          role: session.user.role,
          supportReason: isSuperAdmin ? (supportReason || "Super Admin Support") : null,
        }),
      },
    });

    return generateCCCDSignedUrl(tenantId, side, 300);
  });
}
