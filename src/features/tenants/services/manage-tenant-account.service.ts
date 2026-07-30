import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { generateRandomTempPassword, hashPassword } from "@/server/auth/auth-service";
import { UserRole } from "@prisma/client";
import { createTenantAccountSchema, CreateTenantAccountInput } from "../schemas/tenant-account.schema";
import { CreateTenantAccountResult } from "../types/tenant.types";

export async function createTenantAccountService(input: CreateTenantAccountInput): Promise<CreateTenantAccountResult> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createTenantAccountSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: validated.tenantId },
      select: { ownerId: true, userId: true, fullName: true },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_TENANT_OWNER");
    }

    if (tenant.userId) {
      throw new Error("ALREADY_HAS_ACCOUNT: Khách thuê này đã có tài khoản đăng nhập.");
    }

    // Check phone / email conflict in User table
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [
          { phone: validated.phone },
          ...(validated.email ? [{ email: validated.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new Error("CONFLICT_PHONE_OR_EMAIL_ALREADY_EXISTS: Số điện thoại hoặc email đã được sử dụng cho tài khoản khác.");
    }

    const tempPassword = generateRandomTempPassword(8);
    const passwordHash = await hashPassword(tempPassword);

    const newUser = await tx.user.create({
      data: {
        phone: validated.phone,
        email: validated.email || null,
        passwordHash,
        fullName: tenant.fullName,
        role: UserRole.TENANT,
        isActive: true,
        mustChangePassword: true,
        tokenVersion: 1,
      },
    });

    await tx.tenant.update({
      where: { id: validated.tenantId },
      data: { userId: newUser.id },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TENANT_ACCOUNT",
        entity: "User",
        entityId: newUser.id,
        details: JSON.stringify({ tenantId: validated.tenantId, phone: newUser.phone }),
      },
    });

    return {
      userId: newUser.id,
      phone: newUser.phone,
      tempPassword,
    };
  });
}

export async function resetTenantPasswordService(tenantId: string): Promise<string> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { ownerId: true, userId: true },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_TENANT_OWNER");
    }

    if (!tenant.userId) {
      throw new Error("NOT_FOUND_TENANT_ACCOUNT: Khách thuê chưa có tài khoản đăng nhập.");
    }

    const tempPassword = generateRandomTempPassword(8);
    const passwordHash = await hashPassword(tempPassword);

    await tx.user.update({
      where: { id: tenant.userId },
      data: {
        passwordHash,
        mustChangePassword: true,
        tokenVersion: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RESET_TENANT_PASSWORD",
        entity: "User",
        entityId: tenant.userId,
        details: JSON.stringify({ tenantId }),
      },
    });

    return tempPassword;
  });
}

export async function toggleTenantAccountStatusService(tenantId: string, isActive: boolean): Promise<void> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { ownerId: true, userId: true },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_TENANT_OWNER");
    }

    if (!tenant.userId) {
      throw new Error("NOT_FOUND_TENANT_ACCOUNT");
    }

    await tx.user.update({
      where: { id: tenant.userId },
      data: {
        isActive,
        tokenVersion: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: isActive ? "REACTIVATE_TENANT_ACCOUNT" : "SUSPEND_TENANT_ACCOUNT",
        entity: "User",
        entityId: tenant.userId,
        details: JSON.stringify({ tenantId, isActive }),
      },
    });
  });
}
