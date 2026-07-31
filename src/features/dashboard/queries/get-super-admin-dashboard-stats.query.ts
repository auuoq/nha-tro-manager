import { prisma } from "@/server/database/prisma";

export interface SuperAdminDashboardStats {
  totalOwners: number;
  activeOwners: number;
  suspendedOwners: number;
  totalBuildings: number;
  totalRooms: number;
  totalTenants: number;
  platformOccupancyRate: number;
  recentOwners: Array<{
    id: string;
    name: string;
    phone: string;
    businessName: string;
    buildingsCount: number;
    status: string;
  }>;
}

export async function getSuperAdminDashboardStats(): Promise<SuperAdminDashboardStats> {
  try {
    // 1. Owners stats
    const owners = await prisma.user.findMany({
      where: { role: "OWNER", deletedAt: null },
      select: {
        id: true,
        fullName: true,
        phone: true,
        isActive: true,
        ownerProfile: { select: { businessName: true, status: true } },
        ownedBuildings: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalOwners = owners.length;
    const activeOwners = owners.filter(o => o.isActive && o.ownerProfile?.status !== "SUSPENDED").length;
    const suspendedOwners = totalOwners - activeOwners;

    // 2. Buildings & Rooms stats
    const totalBuildings = await prisma.building.count({ where: { deletedAt: null } });
    const rooms = await prisma.room.findMany({
      where: { deletedAt: null },
      select: { status: true },
    });

    const totalRooms = rooms.length;
    const rentedRooms = rooms.filter(r => r.status === "RENTED").length;
    const platformOccupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    // 3. Tenants count
    const totalTenants = await prisma.tenant.count({ where: { deletedAt: null } });

    // 4. Formatted recent owners
    const recentOwners = owners.slice(0, 5).map(o => ({
      id: o.id,
      name: o.fullName,
      phone: o.phone,
      businessName: o.ownerProfile?.businessName || "Chủ nhà cá nhân",
      buildingsCount: o.ownedBuildings.length,
      status: o.isActive && o.ownerProfile?.status !== "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
    }));

    return {
      totalOwners,
      activeOwners,
      suspendedOwners,
      totalBuildings,
      totalRooms,
      totalTenants,
      platformOccupancyRate,
      recentOwners,
    };
  } catch (error) {
    console.error("Failed to fetch super admin dashboard stats:", error);
    return {
      totalOwners: 0,
      activeOwners: 0,
      suspendedOwners: 0,
      totalBuildings: 0,
      totalRooms: 0,
      totalTenants: 0,
      platformOccupancyRate: 0,
      recentOwners: [],
    };
  }
}
