import { requireSuperAdmin } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findOwnersList } from "../repositories/owner-read.repository";
import { OwnerItemDTO } from "../types/owner.types";

export async function getOwnersQuery(): Promise<OwnerItemDTO[]> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireSuperAdmin(session.user);

  return findOwnersList();
}
