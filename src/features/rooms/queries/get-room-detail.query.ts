import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findRoomDetail } from "../repositories/room-read.repository";

export async function getRoomDetailQuery(roomId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findRoomDetail(roomId, session.user.id);
}
