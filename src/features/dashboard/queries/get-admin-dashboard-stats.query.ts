import { prisma } from "@/server/database/prisma";
import { getServerSession } from "@/server/auth/session";

export interface AdminDashboardStats {
  greetingName: string;
  totalBuildings: number;
  buildingNamesSummary: string;
  totalRooms: number;
  rentedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  monthlyRevenue: number;
  collectedRevenue: number;
  unpaidDebt: number;
  unpaidInvoicesCount: number;
  pendingMaintenanceCount: number;
  urgentMaintenanceCount: number;
  overdueInvoices: Array<{
    id: string;
    code: string;
    roomNumber: string;
    tenantName: string;
    remainingAmount: number;
    dueDate: string;
    status: string;
  }>;
  expiringContracts: Array<{
    id: string;
    code: string;
    roomNumber: string;
    tenantName: string;
    endDate: string;
    daysLeft: string;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    desc: string;
    link: string;
    btnText: string;
    tag: string;
  }>;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const session = await getServerSession();
  const ownerId = session?.user?.id;
  const greetingName = session?.user?.fullName || "Chủ Nhà";

  if (!ownerId) {
    return getFallbackStats(greetingName);
  }

  try {
    // 1. Buildings count & summary
    const buildings = await prisma.building.findMany({
      where: { ownerId, deletedAt: null },
      select: { id: true, name: true },
    });
    const totalBuildings = buildings.length;
    const buildingNamesSummary = totalBuildings > 0 
      ? buildings.slice(0, 2).map(b => b.name).join(" & ")
      : "Chưa tạo tòa nhà";

    // 2. Rooms count by status
    const rooms = await prisma.room.findMany({
      where: { building: { ownerId, deletedAt: null }, deletedAt: null },
      select: { status: true },
    });

    const totalRooms = rooms.length;
    const rentedRooms = rooms.filter(r => r.status === "RENTED").length;
    const vacantRooms = rooms.filter(r => r.status === "VACANT").length;
    const maintenanceRooms = rooms.filter(r => r.status === "MAINTENANCE").length;
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    // 3. Current month revenue & collected amount
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const invoicesThisMonth = await prisma.invoice.findMany({
      where: {
        room: { building: { ownerId, deletedAt: null } },
        deletedAt: null,
        createdAt: { gte: startOfMonth },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        remainingAmount: true,
        status: true,
      },
    });

    const monthlyRevenue = invoicesThisMonth.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
    const collectedRevenue = invoicesThisMonth.reduce((acc, inv) => acc + Number(inv.paidAmount || 0), 0);

    // 4. Total unpaid debt across all active invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        room: { building: { ownerId, deletedAt: null } },
        deletedAt: null,
        status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
      },
      select: {
        id: true,
        invoiceCode: true,
        remainingAmount: true,
        dueDate: true,
        status: true,
        room: { select: { roomNumber: true } },
        contract: {
          select: {
            contractTenants: {
              where: { role: "PRIMARY" },
              select: { tenant: { select: { fullName: true } } },
            },
          },
        },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    });

    const unpaidDebt = unpaidInvoices.reduce((acc, inv) => acc + Number(inv.remainingAmount || 0), 0);
    const unpaidInvoicesCount = unpaidInvoices.length;

    // 5. Maintenance requests count
    const pendingMaintenances = await prisma.maintenanceRequest.findMany({
      where: {
        room: { building: { ownerId, deletedAt: null } },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      select: { priority: true },
    });
    const pendingMaintenanceCount = pendingMaintenances.length;
    const urgentMaintenanceCount = pendingMaintenances.filter(m => m.priority === "HIGH" || m.priority === "URGENT").length;

    // 6. Expiring contracts (within 30 days)
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringContractsDb = await prisma.contract.findMany({
      where: {
        room: { building: { ownerId, deletedAt: null } },
        status: "ACTIVE",
        deletedAt: null,
        endDate: { lte: thirtyDaysLater },
      },
      select: {
        id: true,
        contractCode: true,
        endDate: true,
        room: { select: { roomNumber: true } },
        contractTenants: {
          where: { role: "PRIMARY" },
          select: { tenant: { select: { fullName: true } } },
        },
      },
      take: 5,
      orderBy: { endDate: "asc" },
    });

    const overdueInvoicesFormatted = unpaidInvoices.map(inv => {
      const tenantName = inv.contract.contractTenants[0]?.tenant?.fullName || "Khách thuê";
      const formattedDate = new Date(inv.dueDate).toLocaleDateString("vi-VN");
      return {
        id: inv.id,
        code: inv.invoiceCode,
        roomNumber: `Phòng ${inv.room.roomNumber}`,
        tenantName,
        remainingAmount: Number(inv.remainingAmount),
        dueDate: formattedDate,
        status: inv.status,
      };
    });

    const expiringContractsFormatted = expiringContractsDb.map(c => {
      const tenantName = c.contractTenants[0]?.tenant?.fullName || "Khách thuê";
      const endDate = new Date(c.endDate);
      const formattedDate = endDate.toLocaleDateString("vi-VN");
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        id: c.id,
        code: c.contractCode,
        roomNumber: `Phòng ${c.room.roomNumber}`,
        tenantName,
        endDate: formattedDate,
        daysLeft: diffDays > 0 ? `${diffDays} ngày` : "Hết hạn hôm nay",
      };
    });

    // 7. Dynamic Action Items based on real system state
    const actionItems = [];
    
    // Check unrecorded meter readings for current period
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const unrecordedMeters = await prisma.meter.count({
      where: {
        room: { building: { ownerId, deletedAt: null } },
        isActive: true,
        readings: { none: { period: currentPeriod } },
      },
    });

    if (unrecordedMeters > 0) {
      actionItems.push({
        id: "act-meters",
        title: `Chốt chỉ số Điện/Nước kỳ ${currentPeriod}`,
        desc: `Còn ${unrecordedMeters} đồng hồ chưa ghi nhận chỉ số kỳ này`,
        link: "/admin/meters",
        btnText: "Chốt chỉ số",
        tag: "Vận hành",
      });
    }

    if (pendingMaintenanceCount > 0) {
      actionItems.push({
        id: "act-maint",
        title: `Duyệt ${pendingMaintenanceCount} yêu cầu báo hỏng`,
        desc: urgentMaintenanceCount > 0 ? `Có ${urgentMaintenanceCount} sự cố ưu tiên cao cần xử lý ngay` : "Yêu cầu từ khách thuê đang chờ phản hồi",
        link: "/admin/maintenance",
        btnText: "Xem yêu cầu",
        tag: "Sự cố",
      });
    }

    if (unpaidInvoicesCount > 0) {
      actionItems.push({
        id: "act-inv",
        title: `Có ${unpaidInvoicesCount} hóa đơn quá hạn / chưa thu đủ`,
        desc: `Tổng công nợ cần theo dõi: ${unpaidDebt.toLocaleString("vi-VN")} ₫`,
        link: "/admin/invoices",
        btnText: "Gửi nhắc nhở",
        tag: "Tài chính",
      });
    }

    // Default action item if none triggered
    if (actionItems.length === 0) {
      actionItems.push({
        id: "act-normal",
        title: "Hệ thống vận hành ổn định",
        desc: "Không có tác vụ tồn đọng cần xử lý gấp hôm nay",
        link: "/admin/buildings",
        btnText: "Quản lý tòa nhà",
        tag: "Thông tin",
      });
    }

    return {
      greetingName,
      totalBuildings,
      buildingNamesSummary,
      totalRooms,
      rentedRooms,
      vacantRooms,
      maintenanceRooms,
      occupancyRate,
      monthlyRevenue,
      collectedRevenue,
      unpaidDebt,
      unpaidInvoicesCount,
      pendingMaintenanceCount,
      urgentMaintenanceCount,
      overdueInvoices: overdueInvoicesFormatted,
      expiringContracts: expiringContractsFormatted,
      actionItems,
    };
  } catch (error) {
    console.error("Failed to fetch live admin dashboard stats:", error);
    return getFallbackStats(greetingName);
  }
}

function getFallbackStats(greetingName: string): AdminDashboardStats {
  return {
    greetingName,
    totalBuildings: 0,
    buildingNamesSummary: "Chưa tạo tòa nhà",
    totalRooms: 0,
    rentedRooms: 0,
    vacantRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    collectedRevenue: 0,
    unpaidDebt: 0,
    unpaidInvoicesCount: 0,
    pendingMaintenanceCount: 0,
    urgentMaintenanceCount: 0,
    overdueInvoices: [],
    expiringContracts: [],
    actionItems: [
      {
        id: "act-init",
        title: "Tạo Tòa nhà & Phòng đầu tiên",
        desc: "Khởi tạo dữ liệu danh mục nhà trọ để bắt đầu vận hành",
        link: "/admin/buildings",
        btnText: "Tạo Tòa nhà",
        tag: "Khởi tạo",
      },
    ],
  };
}
