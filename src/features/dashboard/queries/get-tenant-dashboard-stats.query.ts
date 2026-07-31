import { prisma } from "@/server/database/prisma";
import { getServerSession } from "@/server/auth/session";

export interface TenantDashboardStats {
  greetingName: string;
  roomNumber: string;
  buildingName: string;
  buildingAddress: string;
  wifiInfo: string;
  contractEnd: string;
  currentInvoice: {
    id: string;
    code: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    dueDate: string;
    status: string;
  } | null;
}

export async function getTenantDashboardStats(): Promise<TenantDashboardStats> {
  const session = await getServerSession();
  const userId = session?.user?.id;
  const greetingName = session?.user?.fullName || "Khách Thuê";

  if (!userId) {
    return getFallbackTenantStats(greetingName);
  }

  try {
    // 1. Find tenant record
    const tenant = await prisma.tenant.findUnique({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        contractTenants: {
          where: { contract: { status: "ACTIVE", deletedAt: null } },
          select: {
            contract: {
              select: {
                id: true,
                contractCode: true,
                endDate: true,
                room: {
                  select: {
                    id: true,
                    roomNumber: true,
                    building: {
                      select: {
                        name: true,
                        address: true,
                        wifiInfo: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant || tenant.contractTenants.length === 0) {
      return getFallbackTenantStats(greetingName);
    }

    const activeContract = tenant.contractTenants[0].contract;
    const roomNumber = activeContract.room.roomNumber;
    const buildingName = activeContract.room.building.name;
    const buildingAddress = activeContract.room.building.address;
    const wifiInfo = activeContract.room.building.wifiInfo || "Chưa thiết lập wifi";
    const contractEnd = new Date(activeContract.endDate).toLocaleDateString("vi-VN");

    // 2. Find latest unpaid or recent invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        contractId: activeContract.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceCode: true,
        totalAmount: true,
        paidAmount: true,
        remainingAmount: true,
        dueDate: true,
        status: true,
      },
    });

    const currentInvoice = invoice
      ? {
          id: invoice.id,
          code: invoice.invoiceCode,
          amount: Number(invoice.totalAmount),
          paidAmount: Number(invoice.paidAmount),
          remainingAmount: Number(invoice.remainingAmount),
          dueDate: new Date(invoice.dueDate).toLocaleDateString("vi-VN"),
          status: invoice.status,
        }
      : null;

    return {
      greetingName: tenant.fullName || greetingName,
      roomNumber,
      buildingName,
      buildingAddress,
      wifiInfo,
      contractEnd,
      currentInvoice,
    };
  } catch (error) {
    console.error("Failed to fetch tenant dashboard stats:", error);
    return getFallbackTenantStats(greetingName);
  }
}

function getFallbackTenantStats(greetingName: string): TenantDashboardStats {
  return {
    greetingName,
    roomNumber: "---",
    buildingName: "Chưa tham gia phòng trọ nào",
    buildingAddress: "Vui lòng liên hệ Chủ nhà để liên kết hợp đồng",
    wifiInfo: "Chưa khả dụng",
    contractEnd: "---",
    currentInvoice: null,
  };
}
