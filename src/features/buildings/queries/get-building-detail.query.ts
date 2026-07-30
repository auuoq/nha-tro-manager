import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findBuildingDetail } from "../repositories/building-read.repository";

export async function getBuildingDetailQuery(buildingId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findBuildingDetail(buildingId, session.user.id);
}
