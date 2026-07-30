import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findMetersByOwner } from "../repositories/meter-read.repository";

export async function getMetersQuery(roomId?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findMetersByOwner(session.user.id, roomId);
}
