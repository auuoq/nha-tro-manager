import { prisma } from "../database/prisma";
import { SessionUser } from "../auth/session";

export async function assertBuildingOwnership(buildingId: string, user: SessionUser): Promise<void> {
  if (user.role !== "OWNER") {
    throw new Error("FORBIDDEN_NOT_OWNER");
  }

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: { ownerId: true },
  });

  if (!building || building.ownerId !== user.id) {
    throw new Error("FORBIDDEN_NOT_BUILDING_OWNER");
  }
}

interface ContractTenantItem {
  tenant: {
    userId: string | null;
  };
}

interface ContractItem {
  contractTenants: ContractTenantItem[];
}

export async function assertRoomAccess(roomId: string, user: SessionUser): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      building: {
        select: { ownerId: true },
      },
      contracts: {
        where: { status: "ACTIVE" },
        select: {
          contractTenants: {
            select: {
              tenant: {
                select: { userId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!room) {
    throw new Error("NOT_FOUND_ROOM");
  }

  if (user.role === "OWNER") {
    if (room.building.ownerId !== user.id) {
      throw new Error("FORBIDDEN_NOT_ROOM_OWNER");
    }
    return;
  }

  // Tenant Guard
  const isOccupant = room.contracts.some((contract: ContractItem) =>
    contract.contractTenants.some((ct: ContractTenantItem) => ct.tenant.userId === user.id)
  );

  if (!isOccupant) {
    throw new Error("FORBIDDEN_NOT_ROOM_OCCUPANT");
  }
}

export async function logSuperAdminSupportAccess(
  superAdminUserId: string,
  targetEntity: string,
  targetEntityId: string,
  reason: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: superAdminUserId,
      action: "SUPER_ADMIN_SUPPORT_ACCESS",
      entity: targetEntity,
      entityId: targetEntityId,
      details: JSON.stringify({ reason, timestamp: new Date().toISOString() }),
    },
  });
}
