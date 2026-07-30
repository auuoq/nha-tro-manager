import { prisma } from "@/server/database/prisma";
import { InvoiceDetailDTO, InvoiceItemDTOList } from "../types/invoice.types";
import { calculatePreviousOutstandingService } from "../services/calculate-previous-outstanding.service";

export async function findInvoicesByOwner(ownerUserId: string, period?: string): Promise<InvoiceItemDTOList[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      room: {
        building: {
          ownerId: ownerUserId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      deletedAt: null,
      ...(period ? { billingPeriod: period } : {}),
    },
    orderBy: [{ billingPeriod: "desc" }, { createdAt: "desc" }],
    include: {
      contract: {
        select: {
          contractCode: true,
          contractTenants: {
            where: { leftAt: null, role: "PRIMARY" },
            select: { tenant: { select: { fullName: true } } },
          },
        },
      },
      room: {
        select: {
          roomNumber: true,
          building: { select: { name: true } },
        },
      },
    },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    invoiceCode: inv.invoiceCode,
    contractCode: inv.contract.contractCode,
    buildingName: inv.room.building.name,
    roomNumber: inv.room.roomNumber,
    primaryTenantName: inv.contract.contractTenants[0]?.tenant.fullName || "Chưa gán",
    billingPeriod: inv.billingPeriod,
    revision: inv.revision,
    issuedAt: inv.issuedAt,
    dueDate: inv.dueDate,
    subtotalAmount: Number(inv.subtotalAmount),
    discountAmount: Number(inv.discountAmount),
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    remainingAmount: Number(inv.remainingAmount),
    status: inv.status,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  }));
}

export async function findInvoiceDetail(invoiceId: string, ownerUserId: string): Promise<InvoiceDetailDTO | null> {
  const inv = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      room: {
        building: {
          ownerId: ownerUserId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      contract: {
        select: {
          contractCode: true,
          contractTenants: {
            where: { leftAt: null, role: "PRIMARY" },
            select: { tenant: { select: { fullName: true } } },
          },
        },
      },
      room: {
        select: {
          roomNumber: true,
          building: { select: { name: true } },
        },
      },
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!inv) return null;

  const previousOutstandingAmount = await calculatePreviousOutstandingService(prisma as any, inv.contractId, inv.id);
  const currentInvoiceAmount = Number(inv.totalAmount);
  const totalAmountDue = currentInvoiceAmount + previousOutstandingAmount;

  return {
    id: inv.id,
    invoiceCode: inv.invoiceCode,
    contractCode: inv.contract.contractCode,
    buildingName: inv.room.building.name,
    roomNumber: inv.room.roomNumber,
    primaryTenantName: inv.contract.contractTenants[0]?.tenant.fullName || "Chưa gán",
    billingPeriod: inv.billingPeriod,
    revision: inv.revision,
    issuedAt: inv.issuedAt,
    dueDate: inv.dueDate,
    subtotalAmount: Number(inv.subtotalAmount),
    discountAmount: Number(inv.discountAmount),
    totalAmount: currentInvoiceAmount,
    paidAmount: Number(inv.paidAmount),
    remainingAmount: Number(inv.remainingAmount),
    status: inv.status,
    previousOutstandingAmount,
    totalAmountDue,
    cancellationReason: inv.cancellationReason,
    notes: inv.notes,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
    items: inv.items.map((i) => ({
      id: i.id,
      invoiceId: i.invoiceId,
      type: i.type,
      description: i.description,
      quantity: Number(i.quantity),
      unit: i.unit,
      unitPrice: Number(i.unitPrice),
      amount: Number(i.amount),
      meterReadingId: i.meterReadingId,
      previousReading: i.previousReading !== null ? Number(i.previousReading) : null,
      currentReading: i.currentReading !== null ? Number(i.currentReading) : null,
      sortOrder: i.sortOrder,
      calculationMetadata: i.calculationMetadata as Record<string, any> | null,
    })),
  };
}
