import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findMeterReadingsByOwner } from "../repositories/meter-read.repository";

export async function getMeterReadingsQuery(period?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findMeterReadingsByOwner(session.user.id, period);
}
