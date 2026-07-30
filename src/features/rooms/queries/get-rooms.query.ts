import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findRoomsByOwner } from "../repositories/room-read.repository";

export async function getRoomsQuery(buildingId?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findRoomsByOwner(session.user.id, buildingId);
}
