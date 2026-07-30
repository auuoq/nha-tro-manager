import { prisma } from "@/server/database/prisma";
import { UserRole } from "@prisma/client";
import { OwnerItemDTO } from "../types/owner.types";

export async function findOwnersList(): Promise<OwnerItemDTO[]> {
  const users = await prisma.user.findMany({
    where: { role: UserRole.OWNER },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      phone: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
      ownerProfile: {
        select: {
          id: true,
          businessName: true,
          taxCode: true,
          address: true,
          status: true,
        },
      },
      _count: {
        select: {
          ownedBuildings: true,
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    phone: u.phone,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    isActive: u.isActive,
    mustChangePassword: u.mustChangePassword,
    createdAt: u.createdAt,
    profile: u.ownerProfile,
    buildingsCount: u._count.ownedBuildings,
  }));
}
