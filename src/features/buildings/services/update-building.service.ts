import { requireOwner } from "@/server/permissions/rbac";
import { assertBuildingOwnership } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { updateBuildingSchema, UpdateBuildingInput } from "../schemas/building.schema";
import { updateBuildingInTx } from "../repositories/building-write.repository";

export async function updateBuildingService(input: UpdateBuildingInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = updateBuildingSchema.parse(input);
  if (!validated.buildingId) throw new Error("MISSING_BUILDING_ID");

  await assertBuildingOwnership(validated.buildingId, session.user);

  return runSerializableTransaction(async (tx) => {
    const updated = await updateBuildingInTx(tx, validated.buildingId!, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_BUILDING",
        entity: "Building",
        entityId: updated.id,
        details: JSON.stringify({ name: updated.name }),
      },
    });

    return updated;
  });
}
