import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findBuildingsByOwner } from "../repositories/building-read.repository";

export async function getBuildingsQuery() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findBuildingsByOwner(session.user.id);
}
