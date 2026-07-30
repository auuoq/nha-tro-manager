import { UserRole } from "@prisma/client";
import { SessionUser } from "../auth/session";

export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === UserRole.SUPER_ADMIN;
}

export function isOwner(user: SessionUser): boolean {
  return user.role === UserRole.OWNER;
}

export function isTenant(user: SessionUser): boolean {
  return user.role === UserRole.TENANT;
}

export function requireSuperAdmin(user: SessionUser): void {
  if (!isSuperAdmin(user)) {
    throw new Error("FORBIDDEN_SUPER_ADMIN_ONLY");
  }
}

export function requireOwner(user: SessionUser): void {
  if (!isOwner(user)) {
    throw new Error("FORBIDDEN_OWNER_ONLY");
  }
}

export function requireTenant(user: SessionUser): void {
  if (!isTenant(user)) {
    throw new Error("FORBIDDEN_TENANT_ONLY");
  }
}

export function assertOwnerAccountAccess(targetOwnerUserId: string, user: SessionUser): void {
  if (isSuperAdmin(user)) return;
  if (isOwner(user) && user.id === targetOwnerUserId) return;

  throw new Error("FORBIDDEN_OWNER_ACCOUNT_ACCESS");
}
