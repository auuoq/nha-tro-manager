import { prisma } from "@/server/database/prisma";
import { PaymentItemDTO } from "../types/payment.types";
import { PaymentStatus, PaymentMethod } from "@prisma/client";

export interface PaymentFilter {
  ownerId: string;
  invoiceId?: string;
  buildingId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export async function findOwnerPayments(filter: PaymentFilter): Promise<PaymentItemDTO[]> {
  const where: any = {
    deletedAt: null,
    invoice: {
      room: {
        building: { ownerId: filter.ownerId },
      },
    },
  };

  if (filter.invoiceId) where.invoiceId = filter.invoiceId;
  if (filter.buildingId) where.invoice = { ...where.invoice, roomId: { in: (await prisma.room.findMany({ where: { buildingId: filter.buildingId }, select: { id: true } })).map(r => r.id) } };
  if (filter.status) where.status = filter.status;
  if (filter.method) where.method = filter.method;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      invoice: {
        select: {
          invoiceCode: true,
          contract: { select: { contractCode: true } },
          room: { select: { roomNumber: true, building: { select: { name: true } } } },
        },
      },
      recordedBy: { select: { fullName: true } },
      confirmedBy: { select: { fullName: true } },
    },
  });

  return payments.map((p) => {
    const gross = Number(p.amount);
    const refund = Number(p.refundAmount || 0);
    return {
      id: p.id,
      paymentCode: p.paymentCode,
      invoiceId: p.invoiceId,
      invoiceCode: p.invoice.invoiceCode,
      buildingName: p.invoice.room.building.name,
      roomNumber: p.invoice.room.roomNumber,
      contractCode: p.invoice.contract.contractCode,
      amount: gross,
      refundAmount: refund,
      overpaymentAmount: Number(p.overpaymentAmount || 0),
      netAmount: Math.max(0, gross - refund),
      method: p.method,
      source: p.source,
      status: p.status,
      provider: p.provider,
      transactionRef: p.transactionRef,
      idempotencyKey: p.idempotencyKey,
      notes: p.notes,
      receivedAt: p.receivedAt,
      confirmedAt: p.confirmedAt,
      cancelledAt: p.cancelledAt,
      cancellationReason: p.cancellationReason,
      refundReason: p.refundReason,
      recordedByName: p.recordedBy?.fullName || null,
      confirmedByName: p.confirmedBy?.fullName || null,
      createdAt: p.createdAt,
    };
  });
}

export async function findTenantPayments(tenantUserId: string, invoiceId?: string): Promise<PaymentItemDTO[]> {
  const contractIds = await prisma.contractTenant.findMany({
    where: { tenantId: tenantUserId },
    select: { contractId: true },
    distinct: ["contractId"],
  });

  const ids = contractIds.map((c) => c.contractId);

  const where: any = {
    deletedAt: null,
    invoice: { contractId: { in: ids } },
  };

  if (invoiceId) where.invoiceId = invoiceId;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      invoice: {
        select: {
          invoiceCode: true,
          contract: { select: { contractCode: true } },
          room: { select: { roomNumber: true, building: { select: { name: true } } } },
        },
      },
    },
  });

  return payments.map((p) => {
    const gross = Number(p.amount);
    const refund = Number(p.refundAmount || 0);
    return {
      id: p.id,
      paymentCode: p.paymentCode,
      invoiceId: p.invoiceId,
      invoiceCode: p.invoice.invoiceCode,
      buildingName: p.invoice.room.building.name,
      roomNumber: p.invoice.room.roomNumber,
      contractCode: p.invoice.contract.contractCode,
      amount: gross,
      refundAmount: refund,
      overpaymentAmount: Number(p.overpaymentAmount || 0),
      netAmount: Math.max(0, gross - refund),
      method: p.method,
      source: p.source,
      status: p.status,
      provider: p.provider,
      transactionRef: p.transactionRef ? `${p.transactionRef.slice(0, 4)}***` : null, // Mask ref for Tenant
      idempotencyKey: null,
      notes: p.notes,
      receivedAt: p.receivedAt,
      confirmedAt: p.confirmedAt,
      cancelledAt: p.cancelledAt,
      cancellationReason: p.cancellationReason,
      refundReason: p.refundReason,
      recordedByName: null,
      confirmedByName: null,
      createdAt: p.createdAt,
    };
  });
}
