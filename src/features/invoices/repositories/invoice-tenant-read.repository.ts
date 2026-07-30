import { prisma } from "@/server/database/prisma";
import { InvoiceDetailDTO, InvoiceItemDTOList } from "../types/invoice.types";
import { calculatePreviousOutstandingService } from "../services/calculate-previous-outstanding.service";
import { InvoiceStatus } from "@prisma/client";

// Statuses visible to Tenant
const TENANT_VISIBLE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.ISSUED,
  InvoiceStatus.PARTIALLY_PAID,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
];

export async function findTenantInvoices(tenantUserId: string): Promise<InvoiceItemDTOList[]> {
  // Tenant sees invoices of contracts they are (or were) a member of
  const contractIds = await prisma.contractTenant.findMany({
    where: { tenantId: tenantUserId },
    select: { contractId: true },
    distinct: ["contractId"],
  });

  const ids = contractIds.map((c) => c.contractId);

  const invoices = await prisma.invoice.findMany({
    where: {
      contractId: { in: ids },
      status: { in: TENANT_VISIBLE_STATUSES },
      deletedAt: null,
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
    primaryTenantName: inv.contract.contractTenants[0]?.tenant.fullName || "",
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

export async function findTenantInvoiceDetail(invoiceId: string, tenantUserId: string): Promise<InvoiceDetailDTO | null> {
  // Verify Tenant has access via ContractTenant membership
  const inv = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      status: { in: TENANT_VISIBLE_STATUSES },
      deletedAt: null,
      contract: {
        contractTenants: { some: { tenantId: tenantUserId } },
      },
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

  return {
    id: inv.id,
    invoiceCode: inv.invoiceCode,
    contractCode: inv.contract.contractCode,
    buildingName: inv.room.building.name,
    roomNumber: inv.room.roomNumber,
    primaryTenantName: inv.contract.contractTenants[0]?.tenant.fullName || "",
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
    previousOutstandingAmount,
    totalAmountDue: Number(inv.totalAmount) + previousOutstandingAmount,
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
      calculationMetadata: null, // Do not expose internal metadata to Tenant
    })),
  };
}
